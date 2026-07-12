import {
  Todo,
  Language,
  HifizProgress,
  Note,
  KpssProgress,
  CustomQuote,
  KpssDailyStats,
  WillpowerStreak,
} from "../types/types.js";
import { WordReviewData } from "../types/word.js";

interface SettingsResult {
  lang?: Language;
  sidebarOpen?: boolean;
  prayerCity?: string;
  prayerCountry?: string;
  freeGamesNotificationsEnabled?: boolean;
  universalInfoBoxEnabled?: boolean;
  universalInfoBoxHotkey?: string;
}

export const storage = {
  getWillpowerStreak: (): Promise<WillpowerStreak | null> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["willpowerStreak"], (result) => {
        resolve((result.willpowerStreak as WillpowerStreak) || null);
      });
    });
  },
  setWillpowerStreak: (willpowerStreak: WillpowerStreak): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ willpowerStreak }, resolve);
    });
  },
  getTodos: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["todos"], (result) => {
        resolve((result.todos as Todo[]) || []);
      });
    });
  },
  setTodos: (todos: Todo[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ todos }, resolve);
    });
  },
  getNotes: (): Promise<Note[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["notes"], (result) => {
        resolve((result.notes as Note[]) || []);
      });
    });
  },
  setNotes: (notes: Note[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ notes }, resolve);
    });
  },
  getHifizProgress: (): Promise<HifizProgress[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["hifizProgress"], (result) => {
        resolve((result.hifizProgress as HifizProgress[]) || []);
      });
    });
  },
  setHifizProgress: (hifizProgress: HifizProgress[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ hifizProgress }, resolve);
    });
  },
  getSrsProgress: (): Promise<WordReviewData[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["srsProgress"], (result) => {
        resolve((result.srsProgress as WordReviewData[]) || []);
      });
    });
  },
  setSrsProgress: (srsProgress: WordReviewData[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ srsProgress }, resolve);
    });
  },
  getCustomCategories: (): Promise<string[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["customCategories"], (result) => {
        resolve((result.customCategories as string[]) || []);
      });
    });
  },
  setCustomCategories: (customCategories: string[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ customCategories }, resolve);
    });
  },
  getKpssProgress: (): Promise<KpssProgress[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssProgress"], (result) => {
        resolve((result.kpssProgress as KpssProgress[]) || []);
      });
    });
  },
  setKpssProgress: (kpssProgress: KpssProgress[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssProgress }, resolve);
    });
  },
  getCustomQuotes: (): Promise<CustomQuote[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["customQuotes"], (result) => {
        resolve((result.customQuotes as CustomQuote[]) || []);
      });
    });
  },
  setCustomQuotes: (customQuotes: CustomQuote[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ customQuotes }, resolve);
    });
  },
  getYeterlikler: (): Promise<number[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["yeterlikler"], (result) => {
        resolve((result.yeterlikler as number[]) || []);
      });
    });
  },
  setYeterlikler: (yeterlikler: number[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ yeterlikler }, resolve);
    });
  },
  getKpssDailyStats: (): Promise<KpssDailyStats[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssDailyStats"], (result) => {
        resolve((result.kpssDailyStats as KpssDailyStats[]) || []);
      });
    });
  },
  setKpssDailyStats: (kpssDailyStats: KpssDailyStats[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssDailyStats }, resolve);
    });
  },
  getSettings: (): Promise<{
    lang: Language;
    sidebarOpen?: boolean;
    prayerCity?: string;
    prayerCountry?: string;
    freeGamesNotificationsEnabled: boolean;
    universalInfoBoxEnabled: boolean;
    universalInfoBoxHotkey: string;
  }> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        [
          "lang",
          "sidebarOpen",
          "prayerCity",
          "prayerCountry",
          "freeGamesNotificationsEnabled",
          "universalInfoBoxEnabled",
          "universalInfoBoxHotkey",
        ],
        (result: SettingsResult) => {
          resolve({
            lang: (result.lang as Language) || "tr",
            sidebarOpen: result.sidebarOpen ?? true,
            prayerCity: result.prayerCity || "Istanbul",
            prayerCountry: result.prayerCountry || "Turkey",
            freeGamesNotificationsEnabled:
              result.freeGamesNotificationsEnabled ?? true,
            universalInfoBoxEnabled: result.universalInfoBoxEnabled ?? true,
            universalInfoBoxHotkey: result.universalInfoBoxHotkey || "none",
          });
        },
      );
    });
  },
  setUniversalInfoBox: (enabled: boolean, hotkey: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { universalInfoBoxEnabled: enabled, universalInfoBoxHotkey: hotkey },
        resolve,
      );
    });
  },
  setFreeGamesNotificationsEnabled: (enabled: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { freeGamesNotificationsEnabled: enabled },
        resolve,
      );
    });
  },
  setPrayerLocation: (city: string, country: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { prayerCity: city, prayerCountry: country },
        resolve,
      );
    });
  },
  setLang: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ lang }, resolve);
    });
  },
  setSidebarOpen: (isOpen: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ sidebarOpen: isOpen }, resolve);
    });
  },
  clearAll: (lang: Language): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        chrome.storage.sync.set({ lang }, resolve);
      });
    });
  },
  migrateLocalToSync: async (): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, async (localData) => {
        if (localData && Object.keys(localData).length > 0) {
          // Check if sync already has data to avoid overwriting existing cloud data unnecessarily
          chrome.storage.sync.get(null, async (syncData) => {
            if (!syncData || Object.keys(syncData).length <= 1) {
              // <= 1 because lang might be there
              // Only migrate keys meant for sync storage to avoid exceeding sync quotas with large local caches (e.g. free_games_cache)
              const syncKeys = [
                "todos",
                "notes",
                "hifizProgress",
                "srsProgress",
                "customCategories",
                "kpssProgress",
                "customQuotes",
                "yeterlikler",
                "kpssDailyStats",
                "lang",
                "sidebarOpen",
                "prayerCity",
                "prayerCountry",
                "willpowerStreak",
                "freeGamesNotificationsEnabled",
                "universalInfoBoxEnabled",
                "universalInfoBoxHotkey",
              ];
              const filteredData: Record<string, any> = {};
              for (const key of syncKeys) {
                if (localData[key] !== undefined) {
                  filteredData[key] = localData[key];
                }
              }
              if (Object.keys(filteredData).length > 0) {
                try {
                  await chrome.storage.sync.set(filteredData);
                  console.log("Data migrated to sync storage.");
                } catch (error) {
                  console.error("Migration to sync storage failed:", error);
                }
              }
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  },
};
