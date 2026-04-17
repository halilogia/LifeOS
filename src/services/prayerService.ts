export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const prayerService = {
  _cache: null as { date: string; city: string; country: string; times: PrayerTimes } | null,

  async getPrayerTimes(city: string = "Istanbul", country: string = "Turkey"): Promise<PrayerTimes> {
    const today = new Date().toISOString().split("T")[0];
    if (
      this._cache &&
      this._cache.date === today &&
      this._cache.city === city &&
      this._cache.country === country
    ) {
      return this._cache.times;
    }

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=13`
      );
      const data = await response.json();
      this._cache = { date: today, city, country, times: data.data.timings };
      return data.data.timings;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      throw error;
    }
  },
};
