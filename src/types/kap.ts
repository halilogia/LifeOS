/**
 * kap.ts
 * Type definitions for KAP (Kamuyu Aydınlatma Platformu) news items.
 */

export interface KapNewsItem {
  id: string;
  symbol?: string;
  title: string;
  summary: string;
  pubDate: string;
  link: string;
  category?: string;
}
