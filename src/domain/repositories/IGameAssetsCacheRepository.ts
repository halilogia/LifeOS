/**
 * IGameAssetsCacheRepository Interface
 * Repository pattern for free-game-assets cache data and claimed state.
 * Domain layer — pure interface, no external dependencies.
 */

import type { GameAssetItem, CachedGameAssets } from "@/types/gameAssets.js";

export interface IGameAssetsCacheRepository {
  getAssetsCache(): Promise<CachedGameAssets | null>;
  setAssetsCache(data: GameAssetItem[]): Promise<void>;
  loadClaimedAssetIds(): Promise<string[]>;
  saveClaimedAssetIds(ids: string[]): Promise<void>;
}
