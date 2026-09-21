/**
 * IMediaRepository Interface
 * Pure contract for persisting and retrieving user media tracking items.
 */

import type { MediaItem } from "@/types/media.js";

export interface IMediaRepository {
  getItems(): Promise<MediaItem[]>;
  saveItems(items: MediaItem[]): Promise<void>;
  getItemById(id: string): Promise<MediaItem | null>;
  saveItem(item: MediaItem): Promise<void>;
  deleteItem(id: string): Promise<void>;
}
