/**
 * pomodoroPlugin.ts
 * AI Pomodoro Plugin providing focus timer controls and state awareness.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { usePomodoroState } from "@/presentation/store/pomodoroStore.js";
import { logger } from "@/utils/logger.js";

export const pomodoroPlugin: AiFeaturePlugin = {
  id: "pomodoro",
  name: "Pomodoro & Odaklanma Zamanlayıcısı",
  description: "Allows the AI to inspect focus sessions, start, pause, or reset Pomodoro timers.",

  getContextSnapshot: async () => {
    try {
      if (typeof window !== "undefined") {
        const pomo = usePomodoroState.getState();
        const minsLeft = Math.ceil(pomo.pomoTimeLeft / 60);
        const modeLabel =
          pomo.pomoMode === "focus"
            ? "Odaklanma"
            : pomo.pomoMode === "short"
              ? "Kısa Mola"
              : "Uzun Mola";
        const status = pomo.pomoRunning ? "Aktif Çalışıyor" : "Durduruldu / Beklemede";
        return `[Pomodoro Zamanlayıcı] Mod: ${modeLabel}, Durum: ${status}, Kalan Süre: ${minsLeft} dakika.`;
      }
      return null;
    } catch {
      return null;
    }
  },

  actions: [
    {
      name: "control_pomodoro",
      description:
        "Controls the Pomodoro focus timer: start, pause, reset, or configure duration and mode ('focus' | 'short' | 'long').",
      parametersExample: {
        command: "start",
        mode: "focus",
        minutes: 25,
      },
      execute: async (params) => {
        const cmd = String(params.command ?? "start").toLowerCase().trim();
        const mode = (params.mode ?? "focus") as "focus" | "short" | "long";

        if (typeof window === "undefined") {
          return { success: false, message: "Window environment not available" };
        }

        const store = usePomodoroState.getState();

        if (params.minutes && typeof params.minutes === "number" && params.minutes > 0) {
          await store.handleCustomTimeChange(mode, params.minutes);
        }

        if (params.mode && (mode === "focus" || mode === "short" || mode === "long")) {
          await store.handlePomoModeChange(mode);
        }

        if (cmd === "start") {
          await store.handlePomoStart();
          logger.info("[pomodoroPlugin] Pomodoro started via AI");
          return { success: true, message: `Pomodoro ${mode} zamanlayıcısı başlatıldı.` };
        } else if (cmd === "pause" || cmd === "stop") {
          await store.handlePomoPause();
          logger.info("[pomodoroPlugin] Pomodoro paused via AI");
          return { success: true, message: "Pomodoro zamanlayıcısı duraklatıldı." };
        } else if (cmd === "reset") {
          await store.handlePomoReset();
          logger.info("[pomodoroPlugin] Pomodoro reset via AI");
          return { success: true, message: "Pomodoro zamanlayıcısı sıfırlandı." };
        }

        return { success: false, message: `Bilinmeyen komut: ${cmd}` };
      },
    },
  ],
};
