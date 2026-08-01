/**
 * ChromeStorageBistCacheRepository
 * Infrastructure implementation of IBistCacheRepository using chrome.storage.local
 * for BIST stock price data caching with TTL-based expiry.
 */

import type { IBistCacheRepository } from "@/domain/repositories/IBistCacheRepository.js";
import type { StockQuote, StockCache } from "@/types/bist.js";

import { LOCAL_BIST_CACHE } from "@/infrastructure/storage/keys.js";

const CACHE_KEY = LOCAL_BIST_CACHE;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class ChromeStorageBistCacheRepository implements IBistCacheRepository {
  async getCached(): Promise<StockQuote[] | null> {
    try {
      const result = await chrome.storage.local.get(CACHE_KEY);
      const cached = result[CACHE_KEY] as StockCache | undefined;
      if (!cached) {
        return null;
      }
      if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
        return null;
      }
      return cached.data;
    } catch {
      return null;
    }
  }

  async setCache(data: StockQuote[]): Promise<void> {
    try {
      const payload: StockCache = { timestamp: Date.now(), data };
      await chrome.storage.local.set({ [CACHE_KEY]: payload });
    } catch {
      // Storage write error — swallow silently
    }
  }

  async clearCache(): Promise<void> {
    try {
      await chrome.storage.local.remove(CACHE_KEY);
    } catch {
      // ignore
    }
  }
}
