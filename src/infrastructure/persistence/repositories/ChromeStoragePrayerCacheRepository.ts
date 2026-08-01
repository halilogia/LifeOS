/**
 * ChromeStoragePrayerCacheRepository
 * Infrastructure implementation of IPrayerCacheRepository using chrome.storage.local
 * for prayer times calendar caching.
 */

import type { IPrayerCacheRepository } from "@/domain/repositories/IPrayerCacheRepository.js";
import { prayerCalendarKey } from "@/infrastructure/storage/keys.js";
import type { DayPrayerData } from "@/types/prayer.js";

export class ChromeStoragePrayerCacheRepository implements IPrayerCacheRepository {
  async getMonthCalendar(
    storageKey: string,
  ): Promise<Record<string, DayPrayerData> | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (res) => {
        resolve((res[storageKey] as Record<string, DayPrayerData>) || null);
      });
    });
  }

  async setMonthCalendar(
    storageKey: string,
    data: Record<string, DayPrayerData>,
  ): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [storageKey]: data }, resolve);
    });
  }

  async getAllKeys(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (res) => resolve(res || {}));
    });
  }
}
