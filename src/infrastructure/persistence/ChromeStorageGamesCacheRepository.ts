/**
 * ChromeStorageGamesCacheRepository
 * Infrastructure implementation of IGamesCacheRepository using chrome.storage.local
 * for free-games cache data (API caches + exclusion settings).
 */

import type { IGamesCacheRepository } from "@/domain/repositories/IGamesCacheRepository.js";
import type {
  Giveaway,
  HistoricalEpicGame,
  CachedLiveGames,
  CachedHistoryGames,
  ExclusionSettings,
} from "@/types/games.js";
import { defaultExclusions } from "@/types/games.js";
import {
  LOCAL_FREE_GAMES_CACHE,
  LOCAL_EPIC_HISTORY_CACHE,
  LOCAL_FG_EXCLUSIONS,
} from "@/infrastructure/storage/keys.js";

const LIVE_CACHE_KEY = LOCAL_FREE_GAMES_CACHE;
const HISTORY_CACHE_KEY = LOCAL_EPIC_HISTORY_CACHE;

export class ChromeStorageGamesCacheRepository implements IGamesCacheRepository {
  getLiveCache(): Promise<CachedLiveGames | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([LIVE_CACHE_KEY], (res) => {
        resolve((res[LIVE_CACHE_KEY] as CachedLiveGames) || null);
      });
    });
  }

  setLiveCache(data: Giveaway[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedLiveGames = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [LIVE_CACHE_KEY]: cacheVal }, resolve);
    });
  }

  getHistoryCache(): Promise<CachedHistoryGames | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([HISTORY_CACHE_KEY], (res) => {
        resolve((res[HISTORY_CACHE_KEY] as CachedHistoryGames) || null);
      });
    });
  }

  setHistoryCache(data: HistoricalEpicGame[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedHistoryGames = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [HISTORY_CACHE_KEY]: cacheVal }, resolve);
    });
  }

  loadExclusionSettings(): Promise<ExclusionSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get([LOCAL_FG_EXCLUSIONS], (res) => {
        resolve(
          (res[LOCAL_FG_EXCLUSIONS] as ExclusionSettings) || {
            ...defaultExclusions,
          },
        );
      });
    });
  }

  saveExclusionSettings(settings: ExclusionSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [LOCAL_FG_EXCLUSIONS]: settings }, resolve);
    });
  }
}
