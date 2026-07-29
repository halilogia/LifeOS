/**
 * IBistCacheRepository Interface
 * Repository pattern for BIST stock price cache persistence.
 * Domain layer — pure interface, no external dependencies.
 */

import type { StockQuote } from "@/types/bist.js";

export interface IBistCacheRepository {
  /** Get cached stock quotes. Returns null when cache is missing or expired. */
  getCached(): Promise<StockQuote[] | null>;

  /** Store stock quotes in cache with current timestamp. */
  setCache(data: StockQuote[]): Promise<void>;

  /** Remove the cache entry entirely (force refresh). */
  clearCache(): Promise<void>;
}
