/**
 * IPrayerCacheRepository Interface
 * Repository pattern for prayer times calendar cache.
 * Domain layer — pure interface, no external dependencies.
 */

import type { DayPrayerData } from "@/types/prayer.js";

export interface IPrayerCacheRepository {
  /** Get a cached full-month calendar by its storage key. */
  getMonthCalendar(storageKey: string): Promise<Record<string, DayPrayerData> | null>;

  /** Save a full-month calendar. */
  setMonthCalendar(storageKey: string, data: Record<string, DayPrayerData>): Promise<void>;

  /** Load all local storage (fallback search across months). */
  getAllKeys(): Promise<Record<string, unknown>>;
}
