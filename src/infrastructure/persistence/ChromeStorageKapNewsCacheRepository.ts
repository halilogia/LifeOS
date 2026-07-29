/**
 * ChromeStorageKapNewsCacheRepository
 * Infrastructure implementation of IKapNewsCacheRepository using chrome.storage.local
 * for KAP news data caching.
 */

import type { IKapNewsCacheRepository, KapNewsCache } from "@/domain/repositories/IKapNewsCacheRepository.js";

const KAP_CACHE_KEY = "kapNewsCache";

export class ChromeStorageKapNewsCacheRepository implements IKapNewsCacheRepository {
  async getCached(): Promise<KapNewsCache | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([KAP_CACHE_KEY], (res) => {
        resolve(res[KAP_CACHE_KEY] as KapNewsCache | undefined ?? null);
      });
    });
  }

  async setCached(cache: KapNewsCache): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KAP_CACHE_KEY]: cache }, resolve);
    });
  }
}
