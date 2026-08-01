/**
 * ChromeStorageKapNewsCacheRepository
 * Infrastructure implementation of IKapNewsCacheRepository using chrome.storage.local
 * for KAP news data caching.
 */

import type {
  IKapNewsCacheRepository,
  KapNewsCache,
} from "@/domain/repositories/IKapNewsCacheRepository.js";
import { LOCAL_KAP_NEWS_CACHE } from "@/infrastructure/storage/keys.js";

const KAP_CACHE_KEY = LOCAL_KAP_NEWS_CACHE;

export class ChromeStorageKapNewsCacheRepository implements IKapNewsCacheRepository {
  async getCached(): Promise<KapNewsCache | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([KAP_CACHE_KEY], (res) => {
        resolve((res[KAP_CACHE_KEY] as KapNewsCache | undefined) ?? null);
      });
    });
  }

  async setCached(cache: KapNewsCache): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KAP_CACHE_KEY]: cache }, resolve);
    });
  }
}
