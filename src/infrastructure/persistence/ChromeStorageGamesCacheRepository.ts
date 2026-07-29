/**
 * ChromeStorageGamesCacheRepository
 * Infrastructure implementation of IGamesCacheRepository using chrome.storage.local
 * for free-games cache data (API caches + exclusion settings).
 */

import type { IGamesCacheRepository } from "@/domain/repositories/IGamesCacheRepository.js";
import type {
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  CachedLiveGames,
  CachedHistoryGames,
} from "@/types/games.js";
import { defaultExclusions } from "@/types/games.js";

const LIVE_CACHE_KEY = "free_games_cache";
const HISTORY_CACHE_KEY = "epic_history_cache";

export class ChromeStorageGamesCacheRepository
  implements IGamesCacheRepository
{
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
      chrome.storage.local.get(["fg_exclusions"], (res) => {
        resolve(
          (res.fg_exclusions as ExclusionSettings) || { ...defaultExclusions },
        );
      });
    });
  }

  saveExclusionSettings(settings: ExclusionSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ fg_exclusions: settings }, resolve);
    });
  }
}
