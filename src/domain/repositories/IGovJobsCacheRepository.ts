/**
 * IGovJobsCacheRepository.ts
 * Domain contract for caching Gov Job postings in Chrome storage.
 */

import type { CachedGovJobs, GovJobItem } from "@/types/govJobs.js";

export interface IGovJobsCacheRepository {
  getCache(): Promise<CachedGovJobs | null>;
  setCache(data: GovJobItem[]): Promise<void>;
  clearCache(): Promise<void>;
}
