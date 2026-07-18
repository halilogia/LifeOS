import {
  Todo,
  Language,
  HifizProgress,
  Note,
  KpssProgress,
  CustomQuote,
  KpssDailyStats,
  WillpowerStreak,
  PomodoroLog,
} from "../types/types.js";
import { WordReviewData } from "../types/word.js";

export interface GoogleSyncSettings {
  enabled: boolean;
  tasksEnabled: boolean;
  calendarEnabled: boolean;
  userEmail?: string;
  lastSyncedBackup?: number;
}

interface SettingsResult {
  lang?: Language;
  sidebarOpen?: boolean;
  prayerCity?: string;
  prayerCountry?: string;
  freeGamesNotificationsEnabled?: boolean;
  calendarNotificationsEnabled?: boolean;
  pomoBlockEnabled?: boolean;
  pomoCustomTimes?: { focus: number; short: number; long: number };
  kpssTargetScore?: number;
  universalInfoBoxEnabled?: boolean;
  universalInfoBoxHotkey?: string;
  kpssGoalType?: "net" | "score";
  kpssTargetNet?: number;
  kpssChartType?: "line" | "bar";
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
  getPomodoroHistory: (): Promise<PomodoroLog[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["pomodoroHistory"], (result) => {
        resolve((result.pomodoroHistory as PomodoroLog[]) || []);
      });
    });
  },
  setPomodoroHistory: (pomodoroHistory: PomodoroLog[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ pomodoroHistory }, resolve);
    });
  },
  getSyncSettings: (): Promise<GoogleSyncSettings> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["syncSettings"], (result) => {
        resolve(
          (result.syncSettings as GoogleSyncSettings) || {
            enabled: false,
            tasksEnabled: false,
            calendarEnabled: false,
          },
        );
      });
    });
  },
  setSyncSettings: (syncSettings: GoogleSyncSettings): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ syncSettings }, resolve);
    });
  },
  getGeminiApiKey: (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["geminiApiKey"], (result) => {
        resolve((result.geminiApiKey as string) || "");
      });
    });
  },
  setGeminiApiKey: (geminiApiKey: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ geminiApiKey }, resolve);
    });
  },
  getAIProvider: (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["aiProvider"], (result) => {
        resolve((result.aiProvider as string) || "openrouter");
      });
    });
  },
  setAIProvider: (aiProvider: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ aiProvider }, resolve);
    });
  },
  getAIModel: (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["aiModel"], (result) => {
        resolve((result.aiModel as string) || "free");
      });
    });
  },
  setAIModel: (aiModel: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ aiModel }, resolve);
    });
  },
  getAIEndpoint: (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["aiEndpoint"], (result) => {
        resolve((result.aiEndpoint as string) || "http://localhost:20128/v1");
      });
    });
  },
  setAIEndpoint: (aiEndpoint: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ aiEndpoint }, resolve);
    });
  },
  getSidebarOrder: (): Promise<string[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["sidebarOrder"], (result) => {
        resolve((result.sidebarOrder as string[]) || []);
      });
    });
  },
  setSidebarOrder: (sidebarOrder: string[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ sidebarOrder }, resolve);
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
  getKpssSrsProgress: (): Promise<WordReviewData[]> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssSrsProgress"], (result) => {
        resolve((result.kpssSrsProgress as WordReviewData[]) || []);
      });
    });
  },
  setKpssSrsProgress: (kpssSrsProgress: WordReviewData[]): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssSrsProgress }, resolve);
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
    calendarNotificationsEnabled: boolean;
    pomoBlockEnabled: boolean;
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
          "calendarNotificationsEnabled",
          "pomoBlockEnabled",
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
            calendarNotificationsEnabled:
              result.calendarNotificationsEnabled ?? true,
            pomoBlockEnabled:
              result.pomoBlockEnabled ?? true,
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
  setCalendarNotificationsEnabled: (enabled: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { calendarNotificationsEnabled: enabled },
        resolve,
      );
    });
  },
  setPomoBlockEnabled: (enabled: boolean): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(
        { pomoBlockEnabled: enabled },
        resolve,
      );
    });
  },
  getPomoCustomTimes: (): Promise<{ focus: number; short: number; long: number }> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["pomoCustomTimes"], (result: any) => {
        resolve(
          (result.pomoCustomTimes as { focus: number; short: number; long: number }) || {
            focus: 25 * 60,
            short: 5 * 60,
            long: 15 * 60,
          }
        );
      });
    });
  },
  setPomoCustomTimes: (times: { focus: number; short: number; long: number }): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ pomoCustomTimes: times }, resolve);
    });
  },
  getKpssTargetScore: (): Promise<number> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssTargetScore"], (result: any) => {
        resolve(result.kpssTargetScore !== undefined ? result.kpssTargetScore : 80);
      });
    });
  },
  setKpssTargetScore: (score: number): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssTargetScore: score }, resolve);
    });
  },
  getKpssGoalType: (): Promise<"net" | "score"> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssGoalType"], (result: any) => {
        resolve((result.kpssGoalType as "net" | "score") || "net");
      });
    });
  },
  setKpssGoalType: (type: "net" | "score"): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssGoalType: type }, resolve);
    });
  },
  getKpssTargetNet: (): Promise<number> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssTargetNet"], (result: any) => {
        resolve(result.kpssTargetNet !== undefined ? result.kpssTargetNet : 80);
      });
    });
  },
  setKpssTargetNet: (net: number): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssTargetNet: net }, resolve);
    });
  },
  getKpssChartType: (): Promise<"line" | "bar"> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["kpssChartType"], (result: any) => {
        resolve((result.kpssChartType as "line" | "bar") || "line");
      });
    });
  },
  setKpssChartType: (type: "line" | "bar"): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ kpssChartType: type }, resolve);
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
  getDetoxLimits: (): Promise<Record<string, number>> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["detox_limits"], (result) => {
        resolve((result.detox_limits as Record<string, number>) || {});
      });
    });
  },
  setDetoxLimits: (limits: Record<string, number>): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ detox_limits: limits }, resolve);
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
                "kpssSrsProgress",
                "customQuotes",
                "yeterlikler",
                "kpssDailyStats",
                "lang",
                "sidebarOpen",
                "prayerCity",
                "prayerCountry",
                "willpowerStreak",
                "freeGamesNotificationsEnabled",
                "calendarNotificationsEnabled",
                "pomoBlockEnabled",
                "pomoCustomTimes",
                "kpssTargetScore",
                "kpssGoalType",
                "kpssTargetNet",
                "kpssChartType",
                "universalInfoBoxEnabled",
                "universalInfoBoxHotkey",
                "pomodoroHistory",
                "syncSettings",
                "geminiApiKey",
                "aiProvider",
                "aiModel",
                "aiEndpoint",
                "sidebarOrder",
                "detox_limits",
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
