/**
 * ChromeStorageMediaRepository
 * Infrastructure implementation of IMediaRepository using chrome.storage.local
 * with localStorage fallback and error logging.
 */

import type { IMediaRepository } from "@/domain/repositories/IMediaRepository.js";
import type { MediaItem } from "@/types/media.js";
import { SYNC_MEDIA_ITEMS } from "@/infrastructure/storage/keys.js";
import { logger } from "@/utils/logger.js";

export class ChromeStorageMediaRepository implements IMediaRepository {
  getItems(): Promise<MediaItem[]> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          const raw = localStorage.getItem(SYNC_MEDIA_ITEMS);
          resolve(raw ? (JSON.parse(raw) as MediaItem[]) : []);
        } catch (err) {
          logger.error("[ChromeStorageMediaRepository] getItems fallback error:", err);
          resolve([]);
        }
        return;
      }

      chrome.storage.local.get([SYNC_MEDIA_ITEMS], (res) => {
        if (chrome.runtime.lastError) {
          logger.warn(
            "[ChromeStorageMediaRepository] getItems lastError:",
            chrome.runtime.lastError,
          );
        }
        const data = res[SYNC_MEDIA_ITEMS] as MediaItem[] | undefined;
        resolve(Array.isArray(data) ? data : []);
      });
    });
  }

  saveItems(items: MediaItem[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        try {
          localStorage.setItem(SYNC_MEDIA_ITEMS, JSON.stringify(items));
        } catch (err) {
          logger.error("[ChromeStorageMediaRepository] saveItems fallback error:", err);
        }
        resolve();
        return;
      }

      chrome.storage.local.set({ [SYNC_MEDIA_ITEMS]: items }, () => {
        if (chrome.runtime.lastError) {
          logger.error(
            "[ChromeStorageMediaRepository] saveItems lastError:",
            chrome.runtime.lastError,
          );
        }
        resolve();
      });
    });
  }

  async getItemById(id: string): Promise<MediaItem | null> {
    const items = await this.getItems();
    return items.find((item) => item.id === id) || null;
  }

  async saveItem(item: MediaItem): Promise<void> {
    const items = await this.getItems();
    const idx = items.findIndex((i) => i.id === item.id);
    let updated: MediaItem[];
    if (idx >= 0) {
      updated = items.map((i) => (i.id === item.id ? item : i));
    } else {
      updated = [item, ...items];
    }
    await this.saveItems(updated);
  }

  async deleteItem(id: string): Promise<void> {
    const items = await this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    await this.saveItems(filtered);
  }
}
