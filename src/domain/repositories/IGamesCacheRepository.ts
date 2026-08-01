/**
 * IGamesCacheRepository Interface
 * Repository pattern for free-games cache data (exclusions + API response caches).
 * Domain layer — pure interface, no external dependencies.
 */

import type {
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  CachedLiveGames,
  CachedHistoryGames,
} from "@/types/games.js";

export interface IGamesCacheRepository {
  getLiveCache(): Promise<CachedLiveGames | null>;
  setLiveCache(data: Giveaway[]): Promise<void>;
  getHistoryCache(): Promise<CachedHistoryGames | null>;
  setHistoryCache(data: HistoricalEpicGame[]): Promise<void>;
  loadExclusionSettings(): Promise<ExclusionSettings>;
  saveExclusionSettings(settings: ExclusionSettings): Promise<void>;
}
