/**
 * ChromeStorageGameAssetsRepository
 * Infrastructure implementation of IGameAssetsCacheRepository using chrome.storage.local
 * for game assets cache and claimed state.
 */

import type { IGameAssetsCacheRepository } from "@/domain/repositories/IGameAssetsCacheRepository.js";
import type { GameAssetItem, CachedGameAssets } from "@/types/gameAssets.js";
import {
  LOCAL_GAME_ASSETS_CACHE,
  LOCAL_GAME_ASSETS_CLAIMED,
} from "@/infrastructure/storage/keys.js";

const ASSETS_CACHE_KEY = LOCAL_GAME_ASSETS_CACHE;
const CLAIMED_KEY = LOCAL_GAME_ASSETS_CLAIMED;

export class ChromeStorageGameAssetsRepository
  implements IGameAssetsCacheRepository
{
  getAssetsCache(): Promise<CachedGameAssets | null> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve(null);
        return;
      }
      chrome.storage.local.get([ASSETS_CACHE_KEY], (res) => {
        resolve((res[ASSETS_CACHE_KEY] as CachedGameAssets) || null);
      });
    });
  }

  setAssetsCache(data: GameAssetItem[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve();
        return;
      }
      const cacheVal: CachedGameAssets = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [ASSETS_CACHE_KEY]: cacheVal }, resolve);
    });
  }

  loadClaimedAssetIds(): Promise<string[]> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve([]);
        return;
      }
      chrome.storage.local.get([CLAIMED_KEY], (res) => {
        const stored = res[CLAIMED_KEY] as string[] | undefined;
        resolve(Array.isArray(stored) ? stored : []);
      });
    });
  }

  saveClaimedAssetIds(ids: string[]): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve();
        return;
      }
      chrome.storage.local.set({ [CLAIMED_KEY]: ids }, resolve);
    });
  }
}
