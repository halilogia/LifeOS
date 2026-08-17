import { useState, useEffect, useCallback } from "preact/hooks";
import { gamesService } from "@/services/gamesService.js";
import {
  Giveaway,
  HistoricalEpicGame,
  ExclusionSettings,
  defaultExclusions,
} from "@/types/games.js";
import { Language } from "@/types/types.js";
import { logger } from "@/utils/logger.js";

interface UseFreeGamesOptions {
  lang: Language;
}

/**
 * Free games state + fetch + filtre mantığı (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder.
 */
export function useFreeGames({ lang }: UseFreeGamesOptions) {
  // UI state
  const [tab, setTab] = useState<"giveaways" | "wasitfree">("giveaways");
  const [allGiveaways, setAllGiveaways] = useState<Giveaway[]>([]);
  const [exclusions, setExclusions] = useState<ExclusionSettings>({
    ...defaultExclusions,
  });

  // Filters
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("game");

  // History search state
  const [searchQuery, setSearchQuery] = useState("");
  const [historyResults, setHistoryResults] = useState<HistoricalEpicGame[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyEmpty, setHistoryEmpty] = useState(false);

  // Claimed games (id listesi — storage'da kalıcı)
  const [claimedIds, setClaimedIds] = useState<number[]>([]);
  const [hideClaimed, setHideClaimed] = useState(false);

  // Loading/Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSettingsAndGiveaways = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const activeExclusions = await gamesService.loadExclusionSettings();
      setExclusions(activeExclusions);
      const list = await gamesService.fetchLiveGiveaways();
      setAllGiveaways(list);
      const claimed = await gamesService.loadClaimedGames();
      setClaimedIds(claimed);
      setLoading(false);
    } catch (e) {
      logger.error("[FreeGamesView] loadSettingsAndGiveaways:", e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsAndGiveaways();
  }, [loadSettingsAndGiveaways]);

  const handleExclusionChange = async (siteKey: keyof ExclusionSettings) => {
    const updated = {
      ...exclusions,
      [siteKey]: !exclusions[siteKey],
    };
    setExclusions(updated);
    await gamesService.saveExclusionSettings(updated);
  };

  /** Claim butonuna tıklandı → oyunu otomatik "alındı" işaretle (geri al: tekrar tıkla). */
  const handleClaimToggle = useCallback(
    async (gameId: number) => {
      const isClaimed = claimedIds.includes(gameId);
      const next = isClaimed
        ? claimedIds.filter((id) => id !== gameId)
        : [...claimedIds, gameId];
      setClaimedIds(next);
      try {
        await gamesService.saveClaimedGames(next);
      } catch (e) {
        logger.error("[FreeGamesView] handleClaimToggle:", e);
      }
    },
    [claimedIds],
  );

  const handleHistorySearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    setHistoryLoading(true);
    setHistoryEmpty(false);
    setHistoryResults([]);

    try {
      const historyList = await gamesService.fetchHistoricalGiveaways();
      const matched = historyList.filter((game) =>
        game.gameTitle.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      );

      // Sort by date descending
      matched.sort(
        (a, b) =>
          new Date(b.freeDate).getTime() - new Date(a.freeDate).getTime(),
      );

      setHistoryLoading(false);
      if (matched.length === 0) {
        setHistoryEmpty(true);
      } else {
        setHistoryResults(matched);
      }
    } catch (e) {
      logger.error("[FreeGamesView] handleHistorySearch:", e);
      setHistoryLoading(false);
      setHistoryEmpty(true);
    }
  };

  const getGiveawaySite = (
    platformsStr: string,
    titleStr: string,
  ): keyof ExclusionSettings => {
    const p = platformsStr.toLowerCase();
    const title = titleStr.toLowerCase();
    if (p.includes("steam") || title.includes("steam")) {
      return "steam";
    }
    if (p.includes("epic") || title.includes("epic")) {
      return "epic";
    }
    if (p.includes("gog") || title.includes("gog")) {
      return "gog";
    }
    if (p.includes("humble") || title.includes("humble")) {
      return "humble";
    }
    if (p.includes("indiegala") || title.includes("indiegala")) {
      return "indiegala";
    }
    if (p.includes("itch") || title.includes("itch")) {
      return "itch";
    }
    return "other";
  };

  const getCleanerPlatforms = (
    platformsStr: string,
    titleStr: string,
  ): string[] => {
    const parts = platformsStr.split(",").map((p) => p.trim());
    const list: string[] = [];
    const title = titleStr.toLowerCase();

    if (title.includes("indiegala")) {
      list.push("IndieGala");
    }
    if (title.includes("itch.io") || title.includes("itch")) {
      list.push("Itch.io");
    }

    for (const part of parts) {
      if (part.toLowerCase().includes("steam")) {
        list.push("Steam");
      } else if (part.toLowerCase().includes("epic")) {
        list.push("Epic Games");
      } else if (part.toLowerCase().includes("gog")) {
        list.push("GOG");
      } else if (
        part.toLowerCase() === "pc" ||
        part.toLowerCase().includes("drm-free")
      ) {
        if (!title.includes("indiegala") && !title.includes("itch")) {
          list.push("PC");
        }
      } else if (
        part.toLowerCase().includes("playstation") ||
        part.toLowerCase() === "ps4" ||
        part.toLowerCase() === "ps5"
      ) {
        list.push("PlayStation");
      } else if (part.toLowerCase().includes("xbox")) {
        list.push("Xbox");
      } else if (part.toLowerCase().includes("switch")) {
        list.push("Switch");
      } else if (
        part.toLowerCase().includes("android") ||
        part.toLowerCase().includes("ios")
      ) {
        list.push("Mobile");
      } else {
        list.push(part);
      }
    }
    return [...new Set(list)].slice(0, 3);
  };

  const formatHistoryDate = (dateStr: string): string => {
    if (!dateStr) {
      return "";
    }
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }

      const locale = lang === "tr" ? "tr-TR" : "en-US";
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString(locale, options);
    } catch {
      return dateStr;
    }
  };

  // Filter live giveaways based on platform, type, source exclusion, and claimed state
  const filteredGiveaways = allGiveaways.filter((item) => {
    const site = getGiveawaySite(item.platforms, item.title);
    if (!exclusions[site]) {
      return false;
    }
    if (item.type.toLowerCase() !== type.toLowerCase()) {
      return false;
    }
    if (hideClaimed && claimedIds.includes(item.id)) {
      return false;
    }
    const platformsLower = item.platforms.toLowerCase();
    if (platform === "steam") {
      return platformsLower.includes("steam");
    } else if (platform === "epic-games-store") {
      return platformsLower.includes("epic");
    } else if (platform === "gog") {
      return platformsLower.includes("gog");
    } else if (platform === "pc") {
      return platformsLower.includes("pc");
    }
    return true;
  });

  return {
    tab,
    setTab,
    exclusions,
    platform,
    setPlatform,
    type,
    setType,
    searchQuery,
    setSearchQuery,
    historyResults,
    historyLoading,
    historyEmpty,
    loading,
    error,
    filteredGiveaways,
    claimedIds,
    hideClaimed,
    setHideClaimed,
    handleClaimToggle,
    loadSettingsAndGiveaways,
    handleExclusionChange,
    handleHistorySearch,
    getCleanerPlatforms,
    formatHistoryDate,
  };
}
