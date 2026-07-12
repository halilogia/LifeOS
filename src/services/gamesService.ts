export interface Giveaway {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  platforms: string;
  end_date: string;
  type: string;
  status: string;
}

export interface HistoricalEpicGame {
  gameTitle: string;
  freeDate: string;
  epicStoreLink?: string;
  metacriticScore?: number;
  metacriticUrl?: string;
  steamDBRating?: number;
  steamUrl?: string;
}

interface EpicJSONItem {
  gameTitle?: string;
  freeDate?: string;
  epicStoreLink?: string;
  metacriticScore?: number;
  metacriticUrl?: string;
  steamDBRating?: number;
  steamUrl?: string;
}

export interface ExclusionSettings {
  steam: boolean;
  epic: boolean;
  gog: boolean;
  humble: boolean;
  indiegala: boolean;
  itch: boolean;
  other: boolean;
}

interface CachedLiveGames {
  timestamp: number;
  data: Giveaway[];
}

interface CachedHistoryGames {
  timestamp: number;
  data: HistoricalEpicGame[];
}

const LIVE_CACHE_KEY = "free_games_cache";
const LIVE_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

const HISTORY_CACHE_KEY = "epic_history_cache";
const HISTORY_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const defaultExclusions: ExclusionSettings = {
  steam: true,
  epic: true,
  gog: true,
  humble: true,
  indiegala: true,
  itch: true,
  other: true,
};

export const gamesService = {
  /**
   * Fetches active giveaways from GamerPower API, utilizing local cache.
   */
  async fetchLiveGiveaways(forceFresh = false): Promise<Giveaway[]> {
    if (!forceFresh) {
      const cached = await this.getLiveCache();
      if (cached && Date.now() - cached.timestamp < LIVE_CACHE_EXPIRY) {
        return cached.data;
      }
    }

    try {
      const response = await fetch("https://www.gamerpower.com/api/giveaways");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      await this.setLiveCache(list);
      return list;
    } catch (error) {
      console.error("gamesService: Failed to fetch live giveaways:", error);
      // Fallback to expired cache if available
      const cached = await this.getLiveCache();
      if (cached && cached.data.length > 0) {
        console.log("gamesService: Using expired cache as fallback");
        return cached.data;
      }
      throw error;
    }
  },

  /**
   * Fetches historical Epic Games Store giveaways, utilizing local cache.
   */
  async fetchHistoricalGiveaways(): Promise<HistoricalEpicGame[]> {
    const cached = await this.getHistoryCache();
    if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_EXPIRY) {
      return cached.data;
    }

    try {
      const url =
        "https://raw.githubusercontent.com/josephmate/EpicFreeGamesList/master/epic_free_games.json";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load Epic history: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const mapped: HistoricalEpicGame[] = data.map((item: EpicJSONItem) => ({
          gameTitle: item.gameTitle || "",
          freeDate: item.freeDate || "",
          epicStoreLink: item.epicStoreLink || undefined,
          metacriticScore: item.metacriticScore || undefined,
          metacriticUrl: item.metacriticUrl || undefined,
          steamDBRating: item.steamDBRating || undefined,
          steamUrl: item.steamUrl || undefined,
        }));
        await this.setHistoryCache(mapped);
        return mapped;
      }
      return [];
    } catch (error) {
      console.error(
        "gamesService: Failed to fetch historical giveaways:",
        error,
      );
      const cached = await this.getHistoryCache();
      if (cached && cached.data.length > 0) {
        console.log("gamesService: Using expired history cache as fallback");
        return cached.data;
      }
      throw error;
    }
  },

  /**
   * Loads site exclusion settings from local storage.
   */
  loadExclusionSettings(): Promise<ExclusionSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get(["fg_exclusions"], (res) => {
        resolve(
          (res.fg_exclusions as ExclusionSettings) || { ...defaultExclusions },
        );
      });
    });
  },

  /**
   * Saves site exclusion settings to local storage.
   */
  saveExclusionSettings(settings: ExclusionSettings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ fg_exclusions: settings }, resolve);
    });
  },

  // Cache helper methods
  getLiveCache(): Promise<CachedLiveGames | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([LIVE_CACHE_KEY], (res) => {
        resolve((res[LIVE_CACHE_KEY] as CachedLiveGames) || null);
      });
    });
  },

  setLiveCache(data: Giveaway[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedLiveGames = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [LIVE_CACHE_KEY]: cacheVal }, resolve);
    });
  },

  getHistoryCache(): Promise<CachedHistoryGames | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([HISTORY_CACHE_KEY], (res) => {
        resolve((res[HISTORY_CACHE_KEY] as CachedHistoryGames) || null);
      });
    });
  },

  setHistoryCache(data: HistoricalEpicGame[]): Promise<void> {
    return new Promise((resolve) => {
      const cacheVal: CachedHistoryGames = {
        timestamp: Date.now(),
        data,
      };
      chrome.storage.local.set({ [HISTORY_CACHE_KEY]: cacheVal }, resolve);
    });
  },
};
