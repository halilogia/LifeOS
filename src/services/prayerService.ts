/**
 * prayerService.ts
 * Namaz Vakitleri Servisi.
 * Aylık/Yıllık takvimi IPrayerCacheRepository üzerinden önbelleğe alır.
 * İnternet bağlantısı olmasa bile %100 Çevrimdışı (Offline) çalışır.
 */

import type { IPrayerCacheRepository } from "@/domain/repositories/IPrayerCacheRepository.js";
import type { PrayerTimes, DayPrayerData } from "@/types/prayer.js";

export type { PrayerTimes, DayPrayerData } from "@/types/prayer.js";

export function createPrayerService(cacheRepo: IPrayerCacheRepository) {
  let _cache: { date: string; city: string; country: string; times: PrayerTimes } | null = null;

  return {
    async getPrayerTimes(
      city: string = "Istanbul",
      country: string = "Turkey",
    ): Promise<PrayerTimes> {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      // 1. In-memory cache
      if (_cache && _cache.date === todayStr && _cache.city === city && _cache.country === country) {
        return _cache.times;
      }

      // 2. chrome.storage.local cache (via repository)
      const storageKey = `prayer_calendar_${city.toLowerCase()}_${year}_${month}`;
      const cachedData = await cacheRepo.getMonthCalendar(storageKey);

      if (cachedData && cachedData[todayStr]) {
        const times = cachedData[todayStr].timings;
        _cache = { date: todayStr, city, country, times };
        return times;
      }

      // 3. Fetch full monthly calendar from API and cache it
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=13`,
        );

        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }

        const json = await response.json();
        const monthDays: any[] = json.data || [];
        const newCacheMap: Record<string, DayPrayerData> = {};

        monthDays.forEach((dayData: any) => {
          const [d, m, y] = dayData.date.gregorian.date.split("-");
          const formattedDate = `${y}-${m}-${d}`;
          const rawTimings = dayData.timings;
          const cleanTimings: PrayerTimes = {
            Fajr: rawTimings.Fajr.split(" ")[0],
            Sunrise: rawTimings.Sunrise.split(" ")[0],
            Dhuhr: rawTimings.Dhuhr.split(" ")[0],
            Asr: rawTimings.Asr.split(" ")[0],
            Maghrib: rawTimings.Maghrib.split(" ")[0],
            Isha: rawTimings.Isha.split(" ")[0],
          };
          newCacheMap[formattedDate] = { date: formattedDate, timings: cleanTimings };
        });

        await cacheRepo.setMonthCalendar(storageKey, newCacheMap);

        if (newCacheMap[todayStr]) {
          const times = newCacheMap[todayStr].timings;
          _cache = { date: todayStr, city, country, times };
          return times;
        }

        const firstDayKey = Object.keys(newCacheMap)[0];
        if (firstDayKey) { return newCacheMap[firstDayKey].timings; }

        throw new Error("No timings found in calendar API");
      } catch (error) {
        logger.warn("Prayer service API fetch failed (Offline mode). Attempting fallback:", error);

        // Fallback: search any available stored month
        const allLocalStorage = await cacheRepo.getAllKeys();
        const calendarKeys = Object.keys(allLocalStorage).filter((k) =>
          k.startsWith(`prayer_calendar_${city.toLowerCase()}`),
        );

        for (const k of calendarKeys) {
          const calMap = allLocalStorage[k] as Record<string, DayPrayerData> | undefined;
          if (calMap && calMap[todayStr]) {
            return calMap[todayStr].timings;
          }
        }

        if (_cache) { return _cache.times; }
        throw error;
      }
    },
  };
}

export type PrayerService = ReturnType<typeof createPrayerService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStoragePrayerCacheRepository } from "@/infrastructure/persistence/ChromeStoragePrayerCacheRepository.js";
import { logger } from "@/utils/logger.js";

const _defaultPrayerRepo = new ChromeStoragePrayerCacheRepository();
const _defaultPrayerService = createPrayerService(_defaultPrayerRepo);

export const prayerService = _defaultPrayerService;
