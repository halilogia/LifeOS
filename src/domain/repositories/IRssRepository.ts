/**
 * IRssRepository.ts
 * Port interface for RSS feed persistence.
 * Clean Architecture - Domain Repository Port.
 */

export interface RssFeed {
  id: string;
  title: string;
  url: string;
  siteUrl: string;
  lastFetchedAt: number;
  lastError?: string;
}

export interface RssItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  description: string;
  pubDate: number;
  read: boolean;
  savedAt: number;
}

export interface IRssRepository {
  getFeeds(): Promise<RssFeed[]>;
  saveFeeds(feeds: RssFeed[]): Promise<void>;
  addFeed(feed: RssFeed): Promise<void>;
  removeFeed(feedId: string): Promise<void>;
  getItems(feedId: string): Promise<RssItem[]>;
  saveItems(feedId: string, items: RssItem[]): Promise<void>;
  addItems(items: RssItem[]): Promise<void>;
  markItemRead(itemId: string): Promise<void>;
  getReadState(): Promise<Record<string, number>>;
  setReadState(state: Record<string, number>): Promise<void>;
}
