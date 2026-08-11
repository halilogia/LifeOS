/**
 * rssService.ts
 * RSS feed fetching, XML parsing, and item extraction.
 * Runs in background service worker (CORS-safe with host_permissions).
 * Security: all content extracted via textContent — no innerHTML, no XSS.
 * Clean Architecture - Application Service.
 */

import type { RssFeed, RssItem } from "@/domain/repositories/IRssRepository.js";
import { rssRepository } from "@/infrastructure/persistence/ChromeStorageRssRepository.js";
import { logger } from "@/utils/logger.js";

/** Basit string hash — deterministik item/feed ID üretimi */
export function hashString(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

function extractText(node: Element | null): string {
  if (!node) {
    return "";
  }
  return (node.textContent || "").trim();
}

function parseDate(node: Element | null, fallback: number): number {
  const raw = extractText(node);
  if (!raw) {
    return fallback;
  }
  const t = Date.parse(raw);
  return Number.isNaN(t) ? fallback : t;
}

function parseChannelTitle(doc: Document): string {
  const title =
    doc.querySelector("channel > title") ||
    doc.querySelector("feed > title") ||
    doc.querySelector("title");
  return extractText(title) || "Bilinmeyen Feed";
}

function parseSiteUrl(doc: Document, feedUrl: string): string {
  const link =
    doc.querySelector("channel > link") ||
    doc.querySelector("feed > link");
  const href = link?.getAttribute("href") || extractText(link);
  if (href) {
    return href;
  }
  try {
    return new URL(feedUrl).origin;
  } catch {
    return feedUrl;
  }
}

/** Feed URL'sinden site favicon'u türet (google favicon servisi) */
export function getFaviconUrl(siteUrl: string): string {
  try {
    const origin = new URL(siteUrl).origin;
    return `https://www.google.com/s2/favicons?domain=${origin.replace("https://", "").replace("http://", "")}&sz=32`;
  } catch {
    return "";
  }
}

function parseRssItems(doc: Document, feedId: string, feedUrl: string): RssItem[] {
  const now = Date.now();
  // RSS 2.0: <item>, Atom: <entry>
  const nodes = Array.from(doc.querySelectorAll("item, entry"));

  return nodes
    .map((node): RssItem | null => {
      const title =
        extractText(node.querySelector("title")) ||
        extractText(node.querySelector("media\\:title")) ||
        "(Başlıksız)";

      const link =
        node.querySelector("link")?.getAttribute("href") ||
        extractText(node.querySelector("link")) ||
        extractText(node.querySelector("guid")) ||
        feedUrl;

      const guid =
        extractText(node.querySelector("guid")) ||
        extractText(node.querySelector("id")) ||
        link;

      const pubDate = parseDate(
        node.querySelector("pubDate") || node.querySelector("published") || node.querySelector("updated"),
        now,
      );

      // Description — sadece textContent (HTML stripped → XSS güvenli)
      const description =
        extractText(node.querySelector("description")) ||
        extractText(node.querySelector("summary")) ||
        extractText(node.querySelector("content")) ||
        "";

      return {
        id: hashString(`${feedId}:${guid}:${pubDate}`),
        feedId,
        title,
        link,
        description: description.slice(0, 500),
        pubDate,
        read: false,
        savedAt: now,
      };
    })
    .filter((item): item is RssItem => item !== null)
    .sort((a, b) => b.pubDate - a.pubDate);
}

/** Feed çek + parse et + kaydet. Başarısızsa lastError işaretle. */
export async function syncFeed(feed: RssFeed): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      credentials: "omit",
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("Geçersiz XML");
    }

    const items = parseRssItems(doc, feed.id, feed.url);
    await rssRepository.addItems(items);

    const updatedFeed: RssFeed = {
      ...feed,
      title: feed.title || parseChannelTitle(doc),
      siteUrl: feed.siteUrl || parseSiteUrl(doc, feed.url),
      lastFetchedAt: Date.now(),
      lastError: undefined,
    };

    const feeds = await rssRepository.getFeeds();
    await rssRepository.saveFeeds(feeds.map((f) => (f.id === feed.id ? updatedFeed : f)));

    logger.info(`[RssService] "${feed.title}" senkronize edildi (${items.length} item)`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    const feeds = await rssRepository.getFeeds();
    await rssRepository.saveFeeds(
      feeds.map((f) =>
        f.id === feed.id ? { ...f, lastError: message, lastFetchedAt: Date.now() } : f,
      ),
    );
    logger.error(`[RssService] "${feed.title}" çekilemedi: ${message}`);
    return { ok: false, error: message };
  }
}

/** Tüm feed'leri sırayla senkronize et */
export async function syncAllFeeds(): Promise<void> {
  const feeds = await rssRepository.getFeeds();
  for (const feed of feeds) {
    await syncFeed(feed);
  }
}

/** URL'den feed kaydet (sağ tık veya manuel ekleme) */
export async function registerFeed(url: string, fallbackTitle?: string): Promise<{ ok: boolean; error?: string }> {
  let feedUrl = url.trim();
  if (!feedUrl) {
    return { ok: false, error: "URL boş" };
  }
  if (!/^https?:\/\//i.test(feedUrl)) {
    feedUrl = `https://${feedUrl}`;
  }

  const feeds = await rssRepository.getFeeds();
  if (feeds.some((f) => f.url === feedUrl)) {
    return { ok: false, error: "Bu feed zaten kayıtlı" };
  }

  const siteUrl = (() => {
    try {
      return new URL(feedUrl).origin;
    } catch {
      return feedUrl;
    }
  })();

  const newFeed: RssFeed = {
    id: hashString(feedUrl),
    title: fallbackTitle || siteUrl,
    url: feedUrl,
    siteUrl,
    lastFetchedAt: 0,
  };

  await rssRepository.addFeed(newFeed);
  const result = await syncFeed(newFeed);
  return result.ok
    ? { ok: true }
    : { ok: true, error: `Kaydedildi ama ilk çekme başarısız: ${result.error}` };
}
