/**
 * LocalToSyncMigration
 * Infrastructure implementation for migrating data from chrome.storage.local to chrome.storage.sync.
 * Standalone implementation without legacy core/storage dependency.
 */

const SYNC_KEYS = [
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
  "aiShowThinking",
];

export class LocalToSyncMigration {
  /**
   * Migrates data from local storage to sync storage.
   * Reads all keys from chrome.storage.local and writes relevant keys
   * to chrome.storage.sync if sync storage is empty.
   */
  async migrate(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, async (localData) => {
        if (localData && Object.keys(localData).length > 0) {
          chrome.storage.sync.get(null, async (syncData) => {
            if (!syncData || Object.keys(syncData).length <= 1) {
              const filteredData: Record<string, any> = {};
              for (const key of SYNC_KEYS) {
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
  }
}
