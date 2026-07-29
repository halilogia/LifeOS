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
