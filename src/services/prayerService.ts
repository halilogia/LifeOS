/**
 * prayerService.ts
 * Namaz Vakitleri Servisi.
 * Aylık/Yıllık takvimi chrome.storage.local içinde önbelleğe alır.
 * İnternet bağlantısı olmasa bile %100 Çevrimdışı (Offline) çalışır.
 */

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface DayPrayerData {
  date: string; // YYYY-MM-DD
  timings: PrayerTimes;
}

export const prayerService = {
  _cache: null as {
    date: string;
    city: string;
    country: string;
    times: PrayerTimes;
  } | null,

  /**
   * Get Prayer Times for today.
   * Checks chrome.storage.local cache first. If found, returns 100% offline!
   * If missing, fetches full monthly calendar from AlAdhan API and caches all days in local storage.
   */
  async getPrayerTimes(
    city: string = "Istanbul",
    country: string = "Turkey",
  ): Promise<PrayerTimes> {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // 1. Check in-memory cache
    if (
      this._cache &&
      this._cache.date === todayStr &&
      this._cache.city === city &&
      this._cache.country === country
    ) {
      return this._cache.times;
    }

    // 2. Check chrome.storage.local cache (Offline storage)
    const storageKey = `prayer_calendar_${city.toLowerCase()}_${year}_${month}`;
    const cachedData = await new Promise<Record<string, DayPrayerData> | null>((resolve) => {
      chrome.storage.local.get([storageKey], (res) => {
        resolve((res[storageKey] as Record<string, DayPrayerData>) || null);
      });
    });

    if (cachedData && cachedData[todayStr]) {
      const times = cachedData[todayStr].timings;
      this._cache = { date: todayStr, city, country, times };
      return times;
    }

    // 3. Fetch full monthly calendar from API and store in chrome.storage.local
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(
          city,
        )}&country=${encodeURIComponent(country)}&method=13`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const monthDays: any[] = json.data || [];
      const newCacheMap: Record<string, DayPrayerData> = {};

      monthDays.forEach((dayData: any) => {
        // dayData.date.gregorian.date is "DD-MM-YYYY"
        const [d, m, y] = dayData.date.gregorian.date.split("-");
        const formattedDate = `${y}-${m}-${d}`;
        const rawTimings = dayData.timings;

        // Clean up timing strings (e.g. "05:12 (+03)" -> "05:12")
        const cleanTimings: PrayerTimes = {
          Fajr: rawTimings.Fajr.split(" ")[0],
          Sunrise: rawTimings.Sunrise.split(" ")[0],
          Dhuhr: rawTimings.Dhuhr.split(" ")[0],
          Asr: rawTimings.Asr.split(" ")[0],
          Maghrib: rawTimings.Maghrib.split(" ")[0],
          Isha: rawTimings.Isha.split(" ")[0],
        };

        newCacheMap[formattedDate] = {
          date: formattedDate,
          timings: cleanTimings,
        };
      });

      // Save entire month into chrome.storage.local
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [storageKey]: newCacheMap }, resolve);
      });

      if (newCacheMap[todayStr]) {
        const times = newCacheMap[todayStr].timings;
        this._cache = { date: todayStr, city, country, times };
        return times;
      }

      // If today's date format differs, fallback to first day
      const firstDayKey = Object.keys(newCacheMap)[0];
      if (firstDayKey) {
        return newCacheMap[firstDayKey].timings;
      }

      throw new Error("No timings found in calendar API");
    } catch (error) {
      console.warn("Prayer service API fetch failed (Offline mode). Attempting fallback:", error);

      // Fallback: If offline and API fails, search any available stored month in local storage!
      const allLocalStorage = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(null, (res) => resolve(res || {}));
      });

      const calendarKeys = Object.keys(allLocalStorage).filter((k) =>
        k.startsWith(`prayer_calendar_${city.toLowerCase()}`),
      );

      for (const k of calendarKeys) {
        const calMap = allLocalStorage[k];
        if (calMap && calMap[todayStr]) {
          return calMap[todayStr].timings;
        }
      }

      // Final fallback if no cache exists at all
      if (this._cache) {return this._cache.times;}
      throw error;
    }
  },
};
