import { useState, useEffect, useCallback } from "preact/hooks";
import { prayerService } from "@/services/prayerService.js";
import type { PrayerTimes } from "@/types/prayer.js";
import { logger } from "@/utils/logger.js";

/**
 * Prayer times state + business logic (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder; storage + fetch + highlight hesabı burada yaşar.
 */
export function usePrayer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [city, setCity] = useState("Istanbul");
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPrayerIdx, setCurrentPrayerIdx] = useState(-1);

  const calculateHighlight = useCallback((prayerTimes: PrayerTimes) => {
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
    setCurrentPrayerIdx(idx);
  }, []);

  const loadPrayers = useCallback(
    async (targetCity?: string) => {
      setLoading(true);
      setError(false);
      try {
        const res = await new Promise<{ prayerCity?: string }>((resolve) =>
          chrome.storage.local.get(["prayerCity"], (r) => resolve(r)),
        );
        const activeCity =
          targetCity || (res.prayerCity as string) || "Istanbul";
        setCity(activeCity);

        const prayerTimes = await prayerService.getPrayerTimes(
          activeCity,
          "Turkey",
        );
        setTimes(prayerTimes);
        calculateHighlight(prayerTimes);
        setLoading(false);
      } catch (e) {
        logger.error("[PrayerView] loadPrayers failed:", e);
        setError(true);
        setLoading(false);
      }
    },
    [calculateHighlight],
  );

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const handleSaveCity = useCallback(
    async (newCity: string) => {
      if (!newCity) {
        return;
      }
      chrome.storage.local.set({ prayerCity: newCity, prayerCountry: "Turkey" });
      setIsFormOpen(false);
      loadPrayers(newCity);
    },
    [loadPrayers],
  );

  return {
    loading,
    error,
    city,
    setCity,
    times,
    isFormOpen,
    setIsFormOpen,
    currentPrayerIdx,
    handleSaveCity,
  };
}
