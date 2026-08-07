/**
 * QuizStorage.ts
 * Persistence helper for quiz statistics in Chrome storage.
 */

import { contentLog, contentError } from "@/content/contentLogger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

export const STORAGE_KEY = "lifos_quiz_stats";

export interface QuizStats {
  completedTests: number;
  totalQuestions: number;
  correctAnswers: number;
  lastDate: string;
}

/** Saves quiz statistics to chrome.storage.local. */
export async function saveQuizStats(
  correct: number,
  total: number,
): Promise<void> {
  try {
    const res = await chrome.storage.local.get(STORAGE_KEY);
    const existing = (res[STORAGE_KEY] as QuizStats | undefined) ?? {
      completedTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      lastDate: new Date().toISOString().split("T")[0],
    };

    const today = new Date().toISOString().split("T")[0];
    const stats: QuizStats = {
      completedTests: existing.completedTests + 1,
      totalQuestions: existing.totalQuestions + total,
      correctAnswers: existing.correctAnswers + correct,
      lastDate: today,
    };

    await chrome.storage.local.set({ [STORAGE_KEY]: stats });
    scheduleCloudBackup();
    contentLog(`[QuizPanel] Stats saved: ${correct}/${total}`);
  } catch (err) {
    contentError("[QuizPanel] saveStats error:", err);
  }
}
