/**
 * gamesService
 * Service layer for the Free Games module.
 * Fetches data from external APIs (GamerPower, Epic history) and caches
 * results via IGamesCacheRepository. No chrome.* calls remain here.
 */

import type {
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  CachedLiveGames,
  CachedHistoryGames,
} from "@/types/games.js";
import type { IGamesCacheRepository } from "@/domain/repositories/IGamesCacheRepository.js";

// Re-export types for components that still import from here
export type { Giveaway, HistoricalEpicGame, ExclusionSettings };

const LIVE_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
const HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function createGamesService(cacheRepo: IGamesCacheRepository) {
  return {
    /**
     * Fetches active giveaways from GamerPower API, utilizing local cache.
     */
    async fetchLiveGiveaways(forceFresh = false): Promise<Giveaway[]> {
      if (!forceFresh) {
        const cached = await cacheRepo.getLiveCache();
        if (cached && Date.now() - cached.timestamp < LIVE_CACHE_EXPIRY) {
          return cached.data;
        }
      }

      try {
        const response = await fetch(
          "https://www.gamerpower.com/api/giveaways",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        await cacheRepo.setLiveCache(list);
        return list;
      } catch (error) {
        logger.error("gamesService: Failed to fetch live giveaways:", error);
        // Fallback to expired cache if available
        const cached = await cacheRepo.getLiveCache();
        if (cached && cached.data.length > 0) {
          logger.log("gamesService: Using expired cache as fallback");
          return cached.data;
        }
        throw error;
      }
    },

    /**
     * Fetches historical Epic Games Store giveaways, utilizing local cache.
     */
    async fetchHistoricalGiveaways(): Promise<HistoricalEpicGame[]> {
      const cached = await cacheRepo.getHistoryCache();
      if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_EXPIRY) {
        return cached.data;
      }

      try {
        const url =
          "https://raw.githubusercontent.com/josephmate/EpicFreeGamesList/master/epic_free_games.json";
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to load Epic history: ${response.statusText}`,
          );
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const mapped: HistoricalEpicGame[] = data.map(
            (item: Record<string, unknown>) => ({
              gameTitle: (item.gameTitle as string) || "",
              freeDate: (item.freeDate as string) || "",
              epicStoreLink: (item.epicStoreLink as string) || undefined,
              metacriticScore: (item.metacriticScore as number) || undefined,
              metacriticUrl: (item.metacriticUrl as string) || undefined,
              steamDBRating: (item.steamDBRating as number) || undefined,
              steamUrl: (item.steamUrl as string) || undefined,
            }),
          );
          await cacheRepo.setHistoryCache(mapped);
          return mapped;
        }
        return [];
      } catch (error) {
        logger.error(
          "gamesService: Failed to fetch historical giveaways:",
          error,
        );
        const cached = await cacheRepo.getHistoryCache();
        if (cached && cached.data.length > 0) {
          logger.log("gamesService: Using expired history cache as fallback");
          return cached.data;
        }
        throw error;
      }
    },

    /**
     * Loads site exclusion settings.
     */
    loadExclusionSettings(): Promise<ExclusionSettings> {
      return cacheRepo.loadExclusionSettings();
    },

    /**
     * Saves site exclusion settings.
     */
    saveExclusionSettings(settings: ExclusionSettings): Promise<void> {
      return cacheRepo.saveExclusionSettings(settings);
    },
  };
}

export type GamesService = ReturnType<typeof createGamesService>;

/**
 * Singleton instance with the default storage-backed repository.
 * Components that need testability can import `createGamesService` instead.
 */
import { ChromeStorageGamesCacheRepository } from "@/infrastructure/persistence/ChromeStorageGamesCacheRepository.js";
import { logger } from "@/utils/logger.js";
const _defaultCacheRepo = new ChromeStorageGamesCacheRepository();
export const gamesService = createGamesService(_defaultCacheRepo);
