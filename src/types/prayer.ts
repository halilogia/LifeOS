/**
 * prayer.ts
 * Type definitions for prayer times data.
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

/**
 * Raw API response shape from Aladhan calendar API.
 * Each element in json.data has this shape.
 */
export interface PrayerApiDay {
  date: {
    gregorian: {
      date: string; // "DD-MM-YYYY"
    };
  };
  timings: Record<string, string>; // e.g. { Fajr: "05:30 (+03)", Sunrise: "...", ... }
}

/** Alias for consistency with PrayerApiDay usage in prayerService.ts */
export type PrayerDay = PrayerApiDay;
