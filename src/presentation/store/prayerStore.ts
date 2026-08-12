/**
 * usePrayer store
 * Zustand singleton — prayer times state + fetch + city persistence.
 * Hook file stays as a facade; consumer components are untouched.
 *
 * City persistence is mirrored to BOTH local (cached calendar reads) and sync
 * (so a freshly installed PC restores the last selected city). Sync mirror goes
 * through IUserSyncProfileRepository (infrastructure boundary).
 */

import { create } from "zustand";
import { prayerService } from "@/services/prayerService.js";
import type { PrayerTimes } from "@/types/prayer.js";
import { logger } from "@/utils/logger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import { userSyncProfileRepo } from "@/infrastructure/persistence/repositories/ChromeStorageUserSyncProfileRepository.js";

const PRAYER_CITY_KEY = "prayerCity";
const PRAYER_COUNTRY_KEY = "prayerCountry";

interface PrayerState {
  loading: boolean;
  error: boolean;
  city: string;
  setCity: (c: string) => void;
  times: PrayerTimes | null;
  isFormOpen: boolean;
  setIsFormOpen: (o: boolean | ((prev: boolean) => boolean)) => void;
  currentPrayerIdx: number;
  loadPrayers: (targetCity?: string) => Promise<void>;
  handleSaveCity: (newCity: string) => Promise<void>;
}

function calculateHighlight(prayerTimes: PrayerTimes): number {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const timeToMinutes = (tStr: string) => {
    const [h, m] = tStr.split(":").map(Number);
    return h * 60 + m;
  };

  const schedule = [
    timeToMinutes(prayerTimes.Fajr),
    timeToMinutes(prayerTimes.Sunrise),
    timeToMinutes(prayerTimes.Dhuhr),
    timeToMinutes(prayerTimes.Asr),
    timeToMinutes(prayerTimes.Maghrib),
    timeToMinutes(prayerTimes.Isha),
  ];

  let idx = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (currentTime >= schedule[i]) {
      idx = i;
    }
  }
  return idx;
}

export const usePrayerState = create<PrayerState>()((set, get) => ({
  loading: true,
  error: false,
  city: "Istanbul",
  setCity: (c) => set({ city: c }),
  times: null,
  isFormOpen: false,
  setIsFormOpen: (o) =>
    set((s) => ({
      isFormOpen: typeof o === "function" ? o(s.isFormOpen) : o,
    })),
  currentPrayerIdx: -1,

  loadPrayers: async (targetCity?: string) => {
    set({ loading: true, error: false });
    try {
      const res = await new Promise<{ prayerCity?: string }>((resolve) =>
        chrome.storage.local.get([PRAYER_CITY_KEY], (r) => resolve(r)),
      );
      const activeCity = targetCity || (res.prayerCity as string) || "Istanbul";
      set({ city: activeCity });

      const prayerTimes = await prayerService.getPrayerTimes(
        activeCity,
        "Turkey",
      );
      set({
        times: prayerTimes,
        currentPrayerIdx: calculateHighlight(prayerTimes),
        loading: false,
      });
    } catch (e) {
      logger.error("[PrayerView] loadPrayers failed:", e);
      set({ error: true, loading: false });
    }
  },

  handleSaveCity: async (newCity: string) => {
    if (!newCity) {
      return;
    }
    chrome.storage.local.set({
      [PRAYER_CITY_KEY]: newCity,
      [PRAYER_COUNTRY_KEY]: "Turkey",
    });
    // Sync'e yaz — yeni PC'de şehir sıfırlanmasın (repo üzerinden).
    void userSyncProfileRepo.saveProfile({
      prayerCity: newCity,
      prayerCountry: "Turkey",
    });
    set({ isFormOpen: false });
    await get().loadPrayers(newCity);
    scheduleCloudBackup();
  },
}));

/** Load persisted city and fetch prayer times on module init. */
void (async () => {
  try {
    await usePrayerState.getState().loadPrayers();
  } catch (e) {
    logger.warn("[prayerStore] Auto loadPrayers failed:", e);
  }
})();
