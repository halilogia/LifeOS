/**
 * prayerPlugin.ts
 * AI Prayer Times Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { usePrayerState } from "@/presentation/store/prayerStore.js";
import { logger } from "@/utils/logger.js";

export const prayerPlugin: AiFeaturePlugin = {
  id: "prayer",
  name: "Namaz Vakitleri",
  description: "Provides awareness of daily prayer times and allows changing the active city.",

  getContextSnapshot: async () => {
    try {
      if (typeof window === "undefined") return null;

      const store = usePrayerState.getState();
      const city = store.city || "Istanbul";
      const times = store.times;

      if (!times) {
        return `[Namaz Vakitleri] Şehir: ${city}.`;
      }

      return `[Namaz Vakitleri] Şehir: ${city}. Vakitler: İmsak: ${times.Fajr}, Güneş: ${times.Sunrise}, Öğle: ${times.Dhuhr}, İkindi: ${times.Asr}, Akşam: ${times.Maghrib}, Yatsı: ${times.Isha}.`;
    } catch {
      return null;
    }
  },

  actions: [
    {
      name: "set_prayer_city",
      description: "Sets the user's active city for prayer times calculations (e.g. 'Ankara', 'Istanbul', 'Izmir', 'Bursa').",
      parametersExample: {
        city: "Ankara",
      },
      execute: async (params) => {
        const city = String(params.city ?? "").trim();
        if (!city) {
          return { success: false, message: "Şehir adı belirtilmedi." };
        }

        if (typeof window === "undefined") {
          return { success: false, message: "Pencere ortamı bulunamadı." };
        }

        await usePrayerState.getState().handleSaveCity(city);
        logger.info(`[prayerPlugin] Set prayer city to "${city}"`);
        return {
          success: true,
          message: `Namaz vakitleri şehri "${city}" olarak güncellendi.`,
        };
      },
    },
  ],
};
