import { describe, it, expect, vi } from "vitest";
import {
  createGameAssetsService,
  ASSET_HUBS,
} from "@/services/gameAssetsService.js";
import type { IGameAssetsCacheRepository } from "@/domain/repositories/IGameAssetsCacheRepository.js";
import type { GameAssetItem, CachedGameAssets } from "@/types/gameAssets.js";

describe("gameAssetsService", () => {
  const createMockRepo = (initialCache: CachedGameAssets | null = null) => {
    let cache = initialCache;
    let claimed: string[] = [];

    const repo: IGameAssetsCacheRepository = {
      getAssetsCache: vi.fn(async () => cache),
      setAssetsCache: vi.fn(async (data: GameAssetItem[]) => {
        cache = { timestamp: Date.now(), data };
      }),
      loadClaimedAssetIds: vi.fn(async () => claimed),
      saveClaimedAssetIds: vi.fn(async (ids: string[]) => {
        claimed = ids;
      }),
    };
    return repo;
  };

  it("exposes curated quick asset hubs", () => {
    const repo = createMockRepo();
    const service = createGameAssetsService(repo);
    const hubs = service.getAssetHubs();

    expect(hubs.length).toBeGreaterThan(5);
    expect(hubs.some((h) => h.name.includes("Kenney"))).toBe(true);
    expect(hubs.some((h) => h.name.includes("Poly Pizza"))).toBe(true);
    expect(hubs.some((h) => h.name.includes("Itch.io"))).toBe(true);
  });

  it("loads and saves claimed asset IDs", async () => {
    const repo = createMockRepo();
    const service = createGameAssetsService(repo);

    expect(await service.loadClaimedAssetIds()).toEqual([]);
    await service.saveClaimedAssetIds(["asset-1", "asset-2"]);
    expect(await service.loadClaimedAssetIds()).toEqual(["asset-1", "asset-2"]);
  });

  it("returns unexpired cache if available without re-fetching", async () => {
    const sampleItem: GameAssetItem = {
      id: "test-1",
      title: "Test 2D Pack",
      link: "https://example.com/asset",
      thumbnail: "https://example.com/thumb.png",
      description: "A cool test pack",
      source: "kenney",
      category: "2d",
      license: "CC0",
    };

    const repo = createMockRepo({
      timestamp: Date.now() - 5000, // 5 seconds ago
      data: [sampleItem],
    });

    const service = createGameAssetsService(repo);
    const result = await service.fetchAllAssets();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test 2D Pack");
  });
});
