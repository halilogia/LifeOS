/**
 * useGameAssets.ts
 * Presentation hook for Free Game Assets module.
 * Handles state, category/source filtering, text search, and claimed status.
 */

import { useState, useEffect, useCallback, useMemo } from "preact/hooks";
import {
  GameAssetItem,
  AssetCategory,
  AssetSource,
  AssetHubShortcut,
} from "@/types/gameAssets.js";
import { gameAssetsService } from "@/services/gameAssetsService.js";
import { Language } from "@/types/types.js";
import { logger } from "@/utils/logger.js";

interface UseGameAssetsProps {
  lang: Language;
}

export function useGameAssets({ lang: _lang }: UseGameAssetsProps) {
  const [allAssets, setAllAssets] = useState<GameAssetItem[]>([]);
  const [category, setCategory] = useState<AssetCategory>("all");
  const [source, setSource] = useState<AssetSource>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const assetHubs: AssetHubShortcut[] = useMemo(
    () => gameAssetsService.getAssetHubs(),
    [],
  );

  const loadAssets = useCallback(async (forceFresh = false) => {
    setLoading(true);
    setError(false);
    try {
      const [list, claimed] = await Promise.all([
        gameAssetsService.fetchAllAssets(forceFresh),
        gameAssetsService.loadClaimedAssetIds(),
      ]);
      setAllAssets(list);
      setClaimedIds(claimed);
      setLoading(false);
    } catch (e) {
      logger.error("[useGameAssets] Failed to load game assets:", e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const handleClaimToggle = useCallback(
    async (assetId: string) => {
      const isClaimed = claimedIds.includes(assetId);
      const next = isClaimed
        ? claimedIds.filter((id) => id !== assetId)
        : [...claimedIds, assetId];
      setClaimedIds(next);
      try {
        await gameAssetsService.saveClaimedAssetIds(next);
      } catch (e) {
        logger.error("[useGameAssets] handleClaimToggle:", e);
      }
    },
    [claimedIds],
  );

  const filteredAssets = useMemo(() => {
    return allAssets.filter((item) => {
      // Category filter
      if (category !== "all" && item.category !== category) {
        return false;
      }

      // Source filter
      if (source !== "all" && item.source !== source) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesAuthor = item.author?.toLowerCase().includes(q) ?? false;
        const matchesLicense = item.license?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesLicense) {
          return false;
        }
      }

      return true;
    });
  }, [allAssets, category, source, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<AssetCategory, number> = {
      all: allAssets.length,
      "2d": 0,
      "3d": 0,
      audio: 0,
      ui: 0,
      textures: 0,
      loot: 0,
    };
    for (const item of allAssets) {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    }
    return counts;
  }, [allAssets]);

  return {
    allAssets,
    filteredAssets,
    category,
    setCategory,
    source,
    setSource,
    searchQuery,
    setSearchQuery,
    claimedIds,
    handleClaimToggle,
    loading,
    error,
    loadAssets,
    assetHubs,
    categoryCounts,
  };
}
