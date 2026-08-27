/**
 * ChromeStorageGovJobsRepository
 * Infrastructure implementation of IGovJobsCacheRepository using chrome.storage.local
 * for caching public government job postings.
 */

import type { IGovJobsCacheRepository } from "@/domain/repositories/IGovJobsCacheRepository.js";
import type { GovJobItem, CachedGovJobs } from "@/types/govJobs.js";
import { LOCAL_GOV_JOBS_CACHE } from "@/infrastructure/storage/keys.js";

const CACHE_KEY = LOCAL_GOV_JOBS_CACHE;

export class ChromeStorageGovJobsRepository
  implements IGovJobsCacheRepository
{
  getCache(): Promise<CachedGovJobs | null> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve(null);
        return;
      }
      chrome.storage.local.get([CACHE_KEY], (res) => {
        resolve((res[CACHE_KEY] as CachedGovJobs) || null);
      });
    });
  }

  setCache(data: GovJobItem[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve();
        return;
      }
      const cacheVal: CachedGovJobs = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [CACHE_KEY]: cacheVal }, resolve);
    });
  }

  clearCache(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve();
        return;
      }
      chrome.storage.local.remove([CACHE_KEY], resolve);
    });
  }
}
