/**
 * kpssPlugin.ts
 * AI KPSS Study & Progress Plugin.
 * Clean Architecture - AI Service Layer.
 */

import type { AiFeaturePlugin } from "../types.js";
import { SYNC_KPSS_DAILY_STATS, SYNC_KPSS_PROGRESS } from "@/infrastructure/storage/keys.js";
import type { KpssDailyStats, KpssProgress } from "@/types/types.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import { logger } from "@/utils/logger.js";

export const kpssPlugin: AiFeaturePlugin = {
  id: "kpss",
  name: "KPSS Hazırlık & Çıkmış Sorular",
  description: "Tracks KPSS study stats, question solve logs, and curriculum progress.",

  getContextSnapshot: async () => {
    try {
      return new Promise<string | null>((resolve) => {
        if (typeof chrome === "undefined" || !chrome.storage?.local) {
          resolve(null);
          return;
        }

        chrome.storage.local.get(
          [SYNC_KPSS_DAILY_STATS, SYNC_KPSS_PROGRESS],
          (data) => {
            const stats = (data[SYNC_KPSS_DAILY_STATS] as KpssDailyStats[]) || [];
            const progress = (data[SYNC_KPSS_PROGRESS] as KpssProgress[]) || [];

            if (stats.length === 0 && progress.length === 0) {
              resolve(null);
              return;
            }

            const todayStr = new Date().toISOString().split("T")[0];
            const todayStats = stats.filter((s) => s.date === todayStr);
            const todayQuestions = todayStats.reduce((acc, s) => acc + (s.questions || 0), 0);
            const totalQuestionsAllTime = stats.reduce((acc, s) => acc + (s.questions || 0), 0);

            const completedTopics = progress.filter((p) => p.status === 2).length;

            resolve(
              `[KPSS Hazırlık] Bugün Çözülen Soru: ${todayQuestions}. Toplam Çözülen Soru: ${totalQuestionsAllTime}. Tamamlanan Konu: ${completedTopics}.`,
            );
          },
        );
      });
    } catch {
      return null;
    }
  },

  actions: [
    {
      name: "log_kpss_study",
      description: "Logs questions solved or study progress for a specific KPSS subject (e.g. 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Matematik', 'Türkçe').",
      parametersExample: {
        subject: "Tarih",
        questions: 40,
        videos: 2,
      },
      execute: async (params) => {
        const subject = String(params.subject ?? "Genel").trim();
        const questions = Math.max(0, Number(params.questions) || 0);
        const videos = Math.max(0, Number(params.videos) || 0);

        if (questions === 0 && videos === 0) {
          return { success: false, message: "Çözülen soru veya video sayısı belirtilmedi." };
        }

        return new Promise((resolve) => {
          if (typeof chrome === "undefined" || !chrome.storage?.local) {
            resolve({ success: false, message: "Storage erişimi yok." });
            return;
          }

          chrome.storage.local.get([SYNC_KPSS_DAILY_STATS], (data) => {
            const stats = (data[SYNC_KPSS_DAILY_STATS] as KpssDailyStats[]) || [];
            const todayStr = new Date().toISOString().split("T")[0];

            stats.push({
              date: todayStr,
              subject,
              questions,
              videos,
            });

            chrome.storage.local.set({ [SYNC_KPSS_DAILY_STATS]: stats }, () => {
              scheduleCloudBackup();
              logger.info(`[kpssPlugin] Logged study session for ${subject}: ${questions} Qs`);
              resolve({
                success: true,
                message: `KPSS ${subject} çalışması kaydedildi: ${questions} soru, ${videos} video.`,
              });
            });
          });
        });
      },
    },
  ],
};
