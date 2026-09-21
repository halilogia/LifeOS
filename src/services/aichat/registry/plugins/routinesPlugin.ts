/**
 * routinesPlugin.ts
 * AI Routines & Habit Streaks Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { calculateRoutineStreak } from "@/domain/services/routineStreakCalculator.js";
import { logger } from "@/utils/logger.js";

export const routinesPlugin: AiFeaturePlugin = {
  id: "routines",
  name: "Alışkanlık Zinciri & Rutinler",
  description: "Monitors daily routine habits, flame streaks, and allows checking off habits.",

  getContextSnapshot: async (ctx) => {
    try {
      const todos = await ctx.todoRepo.getAll();
      const stats = calculateRoutineStreak(todos);
      const routines = todos.filter((todo) => todo.repeat && todo.repeat !== "none");

      if (routines.length === 0) {
        return null;
      }

      const ignitedStr = stats.isIgnited ? "🔥 Alev Yanıyor!" : "Alev henüz yanmadı.";
      const routineList = routines
        .slice(0, 5)
        .map((r) => `  • [${r.completed ? "x" : " "}] ${r.text}`)
        .join("\n");

      return `[Alışkanlık Zinciri / Rutinler] Seri: ${stats.currentStreak} gün. Bugün: ${stats.todayCompletedCount}/${stats.todayTotalRoutines} tamamlandı (${ignitedStr}).\n${routineList}`;
    } catch (err) {
      logger.warn("[routinesPlugin] Error building snapshot:", err);
      return null;
    }
  },

  actions: [
    {
      name: "toggle_routine",
      description:
        "Marks a daily routine/habit as completed or uncompleted for today.",
      parametersExample: {
        routine_text: "Kitap Oku (30 dk)",
        completed: true,
      },
      execute: async (params, ctx) => {
        const query = String(params.routine_text ?? "").toLowerCase().trim();
        if (!query) {
          return { success: false, message: "Rutin metni belirtilmedi." };
        }

        const todos = await ctx.todoRepo.getAll();
        const routine = todos.find(
          (todo) =>
            todo.repeat &&
            todo.repeat !== "none" &&
            todo.text.toLowerCase().includes(query),
        );

        if (!routine) {
          return {
            success: false,
            message: `"${query}" başlıklı bir rutin bulunamadı.`,
          };
        }

        const shouldComplete =
          typeof params.completed === "boolean" ? params.completed : !routine.completed;

        routine.completed = shouldComplete;
        if (shouldComplete) {
          const todayStr = new Date().toISOString().split("T")[0];
          routine.lastCompletedDate = todayStr;
          if (!Array.isArray(routine.completedDates)) {
            routine.completedDates = [];
          }
          if (!routine.completedDates.includes(todayStr)) {
            routine.completedDates.push(todayStr);
          }
        }

        await ctx.todoRepo.saveAll(todos);
        if (ctx.onManualSync) {
          await ctx.onManualSync();
        }

        logger.info(`[routinesPlugin] Toggled routine "${routine.text}" to ${shouldComplete}`);
        return {
          success: true,
          message: `Rutin güncellendi: "${routine.text}" (${shouldComplete ? "Tamamlandı" : "Beklemede"})`,
        };
      },
    },
  ],
};
