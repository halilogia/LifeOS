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
  return (
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (h1 >>> 0).toString(16).padStart(8, "0")
  );
}

function parseDateText(raw: string, fallback: number): number {
  if (!raw) {
    return fallback;
  }
  const t = Date.parse(raw);
  return Number.isNaN(t) ? fallback : t;
}

function parseChannelTitle(blocks: XmlBlock[]): string {
  return extractBlockText(findFirst(blocks, "title")) || "Bilinmeyen Feed";
}

function parseSiteUrl(blocks: XmlBlock[], feedUrl: string): string {
  const linkNode = findFirst(blocks, "link");
  const href = linkNode?.attrs.href || extractBlockText(linkNode);
  if (href) {
    return href;
  }
  try {
    return new URL(feedUrl).origin;
  } catch {
    return feedUrl;
  }
}

// DOMParser background service worker'da YOK. Bu yüzden hafif XML parser
// yazıldı: tagsoup-style — `<channel>...</channel>` ve `<item>...</item>` bloklarını
// regex ile yakalar, nested elementleri (description içindeki HTML) escape eder.
// Not: Bu parser RSS 2.0 + Atom standart yapısını hedefler; malformed feed'ler
// ya kısmi veri ya da hata döner.

interface XmlBlock {
  tag: string;
  attrs: Record<string, string>;
  content: string;
  children: XmlBlock[];
}

const SELF_CLOSING_TAG_RE = /<\s*(\w+(?::\w+)?)\s*([^>]*?)\/\s*>/g;
const OPENING_TAG_RE = /<\s*(\w+(?::\w+)?)([^>]*?)>/g;
const CDATA_RE = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
const COMMENT_RE = /<!--[\s\S]*?-->/g;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    )
    .replace(/&amp;/g, "&");
}

function stripCdata(s: string): string {
  return s.replace(CDATA_RE, "$1");
}

function stripComments(s: string): string {
  return s.replace(COMMENT_RE, "");
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /(\w+(?::\w+)?)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]] = m[2] ?? m[3] ?? "";
  }
  return attrs;
}

function parseBlocks(xml: string): XmlBlock[] {
  // Self-closing tags çıkar (boş içerik kabul et), bütünlüğü bozmasın.
  const stripped = stripComments(stripCdata(xml));

  // Ağaç kurmak için tüm açılış/kapanış taglerini gezip depth ile içerik böl.
  const root: XmlBlock = { tag: "#root", attrs: {}, content: "", children: [] };
  const stack: XmlBlock[] = [root];
  const tagRe = /<\s*(\/?)\s*(\w+(?::\w+)?)([^>]*?)>/g;
  let m: RegExpExecArray | null;
  let lastIndex = 0;
  while ((m = tagRe.exec(stripped)) !== null) {
    const closeTag = m[1] === "/";
    const tagName = m[2];
    const attrsRaw = m[3];
    const before = stripped.slice(lastIndex, m.index);
    if (stack.length > 0) {
      stack[stack.length - 1].content += before;
    }
    if (closeTag) {
      if (stack.length > 1 && stack[stack.length - 1].tag === tagName) {
        stack.pop();
      }
    } else {
      const selfClosing = /\/\s*$/.test(attrsRaw);
      const node: XmlBlock = {
        tag: tagName,
        attrs: parseAttrs(attrsRaw),
        content: "",
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      if (!selfClosing) {
        stack.push(node);
      }
    }
    lastIndex = m.index + m[0].length;
  }
  // Kalan içerik
  if (stack.length > 0) {
    stack[stack.length - 1].content += stripped.slice(lastIndex);
  }
  return root.children;
}

function findAll(blocks: XmlBlock[], tag: string): XmlBlock[] {
  const out: XmlBlock[] = [];
  const walk = (bs: XmlBlock[]): void => {
    for (const b of bs) {
      if (b.tag === tag) {
        out.push(b);
      }
      walk(b.children);
    }
  };
  walk(blocks);
  return out;
}

function findFirst(blocks: XmlBlock[], tag: string): XmlBlock | null {
  const all = findAll(blocks, tag);
  return all.length > 0 ? all[0] : null;
}

/** Background service worker'da fetch → text → parseBlocks zinciri. */
function parseXmlDocument(xml: string): XmlBlock[] {
  return parseBlocks(xml);
}

function extractBlockText(node: XmlBlock | null): string {
  if (!node) {
    return "";
  }
  // text + CDATA çözümlenmiş içerik; HTML etiketlerini de düz metne çevir.
  const raw =
    (node.content || "") + node.children.map((c) => c.content).join("");
  return decodeEntities(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** RSS feed URL'sinden site favicon'u türet (google favicon servisi) */
export function getFaviconUrl(siteUrl: string): string {
  try {
    const origin = new URL(siteUrl).origin;
    return `https://www.google.com/s2/favicons?domain=${origin.replace("https://", "").replace("http://", "")}&sz=32`;
  } catch {
    return "";
  }
}

function parseRssItems(
  blocks: XmlBlock[],
  feedId: string,
  feedUrl: string,
): RssItem[] {
  const now = Date.now();
  // RSS 2.0: <item>, Atom: <entry>
  const nodes = findAll(blocks, "item").concat(findAll(blocks, "entry"));

  return nodes
    .map((node): RssItem | null => {
      const title =
        extractBlockText(findFirst(node.children, "title")) || "(Başlıksız)";

      const linkNode = findFirst(node.children, "link");
      const link =
        linkNode?.attrs.href ||
        extractBlockText(linkNode) ||
        extractBlockText(findFirst(node.children, "guid")) ||
        feedUrl;

      const guid =
        extractBlockText(findFirst(node.children, "guid")) ||
        extractBlockText(findFirst(node.children, "id")) ||
        link;

      const pubDate = parseDateText(
        extractBlockText(findFirst(node.children, "pubDate")) ||
          extractBlockText(findFirst(node.children, "published")) ||
          extractBlockText(findFirst(node.children, "updated")),
        now,
      );

      // Description — sadece düz metin (HTML etiketleri strip edilir → XSS güvenli)
      const description =
        extractBlockText(findFirst(node.children, "description")) ||
        extractBlockText(findFirst(node.children, "summary")) ||
        extractBlockText(findFirst(node.children, "content")) ||
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
export async function syncFeed(
  feed: RssFeed,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      credentials: "omit",
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const xml = await res.text();
    const blocks = parseXmlDocument(xml);
    if (blocks.length === 0) {
      throw new Error("Geçersiz XML");
    }

    const items = parseRssItems(blocks, feed.id, feed.url);
    await rssRepository.addItems(items);

    const updatedFeed: RssFeed = {
      ...feed,
      title: feed.title || parseChannelTitle(blocks),
      siteUrl: feed.siteUrl || parseSiteUrl(blocks, feed.url),
      lastFetchedAt: Date.now(),
      lastError: undefined,
    };

    const feeds = await rssRepository.getFeeds();
    await rssRepository.saveFeeds(
      feeds.map((f) => (f.id === feed.id ? updatedFeed : f)),
    );

    logger.info(
      `[RssService] "${feed.title}" senkronize edildi (${items.length} item)`,
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    const feeds = await rssRepository.getFeeds();
    await rssRepository.saveFeeds(
      feeds.map((f) =>
        f.id === feed.id
          ? { ...f, lastError: message, lastFetchedAt: Date.now() }
          : f,
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
export async function registerFeed(
  url: string,
  fallbackTitle?: string,
): Promise<{ ok: boolean; error?: string }> {
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
    : {
        ok: true,
        error: `Kaydedildi ama ilk çekme başarısız: ${result.error}`,
      };
}
