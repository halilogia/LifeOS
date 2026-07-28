/**
 * kpssService
 * Service layer for KPSS study tracker functionality.
 * Uses chrome.storage.sync directly instead of legacy core/storage.
 */

import type { KpssProgress, KpssDailyStats } from "@/types/types.js";
import {
  kpssData,
  type KpssTopic,
} from "@/domain/constants/kpssCurriculum.js";
import {
  kpssDummyFlashcards,
  type KpssFlashcard,
} from "@/domain/constants/kpssFlashcards.js";

// Re-export constants and types for backwards compatibility
export { kpssData, type KpssTopic };
export { kpssDummyFlashcards, type KpssFlashcard };

const KPSS_PROGRESS_KEY = "kpssProgress";
const KPSS_DAILY_STATS_KEY = "kpssDailyStats";

function getKpssProgressFromStorage(): Promise<KpssProgress[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KPSS_PROGRESS_KEY], (result) => {
      resolve((result[KPSS_PROGRESS_KEY] as KpssProgress[]) || []);
    });
  });
}

function setKpssProgressToStorage(progressList: KpssProgress[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [KPSS_PROGRESS_KEY]: progressList }, resolve);
  });
}

function getKpssDailyStatsFromStorage(): Promise<KpssDailyStats[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KPSS_DAILY_STATS_KEY], (result) => {
      resolve((result[KPSS_DAILY_STATS_KEY] as KpssDailyStats[]) || []);
    });
  });
}

function setKpssDailyStatsToStorage(stats: KpssDailyStats[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [KPSS_DAILY_STATS_KEY]: stats }, resolve);
  });
}

export const kpssService = {
  /**
   * Retrieves user's KPSS topic checkmark progress.
   */
  getKpssProgress(): Promise<KpssProgress[]> {
    return getKpssProgressFromStorage();
  },

  /**
   * Sets the complete list of KPSS topic progress.
   */
  setKpssProgress(progressList: KpssProgress[]): Promise<void> {
    return setKpssProgressToStorage(progressList);
  },

  /**
   * Retrieves question history records.
   */
  getKpssDailyStats(): Promise<KpssDailyStats[]> {
    return getKpssDailyStatsFromStorage();
  },

  /**
   * Sets question history records.
   */
  setKpssDailyStats(stats: KpssDailyStats[]): Promise<void> {
    return setKpssDailyStatsToStorage(stats);
  },

  /**
   * Toggles the status of a specific subject topic.
   */
  async updateTopicStatus(
    subject: string,
    topic: string,
    status: 0 | 1 | 2,
    score?: number,
  ): Promise<void> {
    const progressList = await this.getKpssProgress();
    const index = progressList.findIndex(
      (p) => p.subject === subject && p.topic === topic,
    );

    if (index !== -1) {
      if (status === 0 && score === undefined) {
        progressList.splice(index, 1);
      } else {
        progressList[index].status = status;
        if (score !== undefined) {
          progressList[index].score = score;
        }
      }
    } else {
      progressList.push({ subject, topic, status, score });
    }

    await this.setKpssProgress(progressList);
  },

  /**
   * Appends or updates a day's KPSS question and video count stats.
   */
  async saveKpssDailyStats(
    questions: number,
    videos: number,
    subject: string,
  ): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const stats = await this.getKpssDailyStats();

    const existingIdx = stats.findIndex((s) => s.date === today);
    if (existingIdx !== -1) {
      stats[existingIdx].questions += questions;
      stats[existingIdx].videos = (stats[existingIdx].videos || 0) + videos;
      stats[existingIdx].subject = subject;
    } else {
      stats.push({ date: today, questions, videos, subject });
    }

    // Keep only last 30 days
    if (stats.length > 30) {
      stats.shift();
    }

    await this.setKpssDailyStats(stats);
  },

  /**
   * Deletes a specific day's record from history.
   */
  async deleteKpssDailyStat(date: string): Promise<void> {
    const stats = await this.getKpssDailyStats();
    const filtered = stats.filter((s) => s.date !== date);
    await this.setKpssDailyStats(filtered);
  },

  /**
   * Retrieves dynamic progress percentage for a subject.
   */
  async getSubjectProgressPercentage(
    subject: string,
    totalTopics: number,
  ): Promise<number> {
    const progressList = await this.getKpssProgress();
    const subjectProgress = progressList.filter(
      (p) => p.subject === subject && p.status === 2,
    );
    return totalTopics > 0
      ? Math.round((subjectProgress.length / totalTopics) * 100)
      : 0;
  },

  /**
   * Resets all KPSS related user statistics, progress, SRS data, and past quiz records.
   */
  async resetAllKpssData(): Promise<void> {
    await new Promise<void>((resolve) => {
      chrome.storage.sync.remove(
        [
          KPSS_PROGRESS_KEY,
          KPSS_DAILY_STATS_KEY,
          "kpssSrsProgress",
          "kpssGoalType",
          "kpssTargetNet",
          "kpssTargetScore",
        ],
        () => resolve(),
      );
    });
    await new Promise<void>((resolve) => {
      chrome.storage.local.remove(["kpss_past_quizzes"], () => resolve());
    });
  },
};
