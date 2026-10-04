/**
 * ChromeStorageMediaCatalogCache.ts
 * MV3-compliant asynchronous cache adapter for remote web catalog deltas.
 * Stores only delta entries fetched from open web APIs in chrome.storage.local.
 * Avoids duplicate local persistence of static curated catalogs.
 */

import type {
  CuratedBookItem,
  CuratedGameItem,
  CuratedMovieItem,
  CuratedTvItem,
} from "@/services/curatedCatalogData.js";
import { logger } from "@/utils/logger.js";

const CACHE_STORAGE_KEY = "lifeos_media_web_catalog_cache_v4";

export interface StoredWebCatalogDelta {
  lastUpdated: string;
  tvShows: CuratedTvItem[];
  books: CuratedBookItem[];
  games: CuratedGameItem[];
  movies: CuratedMovieItem[];
}

export interface IMediaCatalogCache {
  loadCache(): Promise<StoredWebCatalogDelta | null>;
  saveCache(delta: StoredWebCatalogDelta): Promise<void>;
  clearCache(): Promise<void>;
}

// In-memory fallback for test environments without chrome.storage
let memoryCacheFallback: StoredWebCatalogDelta | null = null;

export class ChromeStorageMediaCatalogCache implements IMediaCatalogCache {
  async loadCache(): Promise<StoredWebCatalogDelta | null> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([CACHE_STORAGE_KEY], (result) => {
            if (chrome.runtime.lastError || !result[CACHE_STORAGE_KEY]) {
              resolve(null);
            } else {
              resolve(result[CACHE_STORAGE_KEY] as StoredWebCatalogDelta);
            }
          });
        });
      }
      return memoryCacheFallback;
    } catch (err) {
      logger.warn("[ChromeStorageMediaCatalogCache] load error:", err);
      return null;
    }
  }

  async saveCache(delta: StoredWebCatalogDelta): Promise<void> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [CACHE_STORAGE_KEY]: delta }, () => {
            resolve();
          });
        });
      }
      memoryCacheFallback = delta;
    } catch (err) {
      logger.warn("[ChromeStorageMediaCatalogCache] save error:", err);
    }
  }

  async clearCache(): Promise<void> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.remove([CACHE_STORAGE_KEY], () => {
            resolve();
          });
        });
      }
      memoryCacheFallback = null;
    } catch (err) {
      logger.warn("[ChromeStorageMediaCatalogCache] clear error:", err);
    }
  }
}

export const mediaCatalogCache = new ChromeStorageMediaCatalogCache();
