/**
 * ChromeStorageRssRepository.ts
 * Chrome storage-backed RSS repository implementation.
 * Feeds + read state → chrome.storage.sync (small, cross-device).
 * Items → chrome.storage.local (large, device-scoped).
 * Clean Architecture - Infrastructure Persistence.
 */

import type {
  IRssRepository,
  RssFeed,
  RssItem,
} from "@/domain/repositories/IRssRepository.js";

const FEEDS_KEY = "rss_feeds";
const ITEMS_KEY = "rss_items";
const READ_STATE_KEY = "rss_read_state";

/** Feed başına tutulacak maksimum item sayısı (son N) */
export const MAX_ITEMS_PER_FEED = 50;

function storageGet(
  area: "sync" | "local",
  keys: string[],
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const api = area === "sync" ? chrome.storage.sync : chrome.storage.local;
    api.get(keys, (res) => resolve(res as Record<string, unknown>));
  });
}

function storageSet(
  area: "sync" | "local",
  data: Record<string, unknown>,
): Promise<void> {
  return new Promise((resolve) => {
    const api = area === "sync" ? chrome.storage.sync : chrome.storage.local;
    api.set(data, () => resolve());
  });
}

export class ChromeStorageRssRepository implements IRssRepository {
  async getFeeds(): Promise<RssFeed[]> {
    const res = await storageGet("sync", [FEEDS_KEY]);
    const feeds = res[FEEDS_KEY];
    return Array.isArray(feeds) ? (feeds as RssFeed[]) : [];
  }

  async saveFeeds(feeds: RssFeed[]): Promise<void> {
    await storageSet("sync", { [FEEDS_KEY]: feeds });
  }

  async addFeed(feed: RssFeed): Promise<void> {
    const feeds = await this.getFeeds();
    if (feeds.some((f) => f.url === feed.url)) {
      return; // zaten kayıtlı
    }
    await this.saveFeeds([...feeds, feed]);
  }

  async removeFeed(feedId: string): Promise<void> {
    const feeds = await this.getFeeds();
    await this.saveFeeds(feeds.filter((f) => f.id !== feedId));

    // İlişkili item'ları da temizle (local)
    const res = await storageGet("local", [ITEMS_KEY]);
    const items = Array.isArray(res[ITEMS_KEY])
      ? (res[ITEMS_KEY] as RssItem[])
      : [];
    await storageSet("local", {
      [ITEMS_KEY]: items.filter((it) => it.feedId !== feedId),
    });
  }

  async getItems(feedId: string): Promise<RssItem[]> {
    const res = await storageGet("local", [ITEMS_KEY]);
    const items = Array.isArray(res[ITEMS_KEY])
      ? (res[ITEMS_KEY] as RssItem[])
      : [];
    return items
      .filter((it) => it.feedId === feedId)
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, MAX_ITEMS_PER_FEED);
  }

  async saveItems(feedId: string, items: RssItem[]): Promise<void> {
    const res = await storageGet("local", [ITEMS_KEY]);
    const existing = Array.isArray(res[ITEMS_KEY])
      ? (res[ITEMS_KEY] as RssItem[])
      : [];
    const other = existing.filter((it) => it.feedId !== feedId);
    const merged = [...other, ...items]
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, MAX_ITEMS_PER_FEED * 20); // tüm feed'ler için toplam sınır
    await storageSet("local", { [ITEMS_KEY]: merged });
  }

  async addItems(items: RssItem[]): Promise<void> {
    const res = await storageGet("local", [ITEMS_KEY]);
    const existing = Array.isArray(res[ITEMS_KEY])
      ? (res[ITEMS_KEY] as RssItem[])
      : [];
    const knownIds = new Set(existing.map((it) => it.id));
    const fresh = items.filter((it) => !knownIds.has(it.id));
    if (fresh.length === 0) {
      return;
    }
    const merged = [...existing, ...fresh]
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, MAX_ITEMS_PER_FEED * 20);
    await storageSet("local", { [ITEMS_KEY]: merged });
  }

  async markItemRead(itemId: string): Promise<void> {
    const res = await storageGet("local", [ITEMS_KEY]);
    const items = Array.isArray(res[ITEMS_KEY])
      ? (res[ITEMS_KEY] as RssItem[])
      : [];
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, read: true } : it,
    );
    await storageSet("local", { [ITEMS_KEY]: updated });
  }

  async getReadState(): Promise<Record<string, number>> {
    const res = await storageGet("sync", [READ_STATE_KEY]);
    const state = res[READ_STATE_KEY];
    return state && typeof state === "object"
      ? (state as Record<string, number>)
      : {};
  }

  async setReadState(state: Record<string, number>): Promise<void> {
    await storageSet("sync", { [READ_STATE_KEY]: state });
  }
}

export const rssRepository = new ChromeStorageRssRepository();
