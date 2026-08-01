/**
 * kpssService
 * Service layer for KPSS study tracker functionality.
 * Orchestrates domain constants and persistence via IKpssRepository.
 *
 * Business logic methods (updateTopicStatus, saveKpssDailyStats, etc.)
 * remain here; chrome.storage calls have been moved into the repository.
 */

import type { KpssProgress, KpssDailyStats } from "@/types/types.js";
import type { IKpssRepository } from "@/domain/repositories/IKpssRepository.js";
import { kpssData, type KpssTopic } from "@/domain/constants/kpssCurriculum.js";
import {
  kpssDummyFlashcards,
  type KpssFlashcard,
} from "@/domain/constants/kpssFlashcards.js";

// Re-export constants and types for backwards compatibility
export { kpssData, type KpssTopic };
export { kpssDummyFlashcards, type KpssFlashcard };

export function createKpssService(kpssRepo: IKpssRepository) {
  return {
    /**
     * Retrieves user's KPSS topic checkmark progress.
     */
    getKpssProgress(): Promise<KpssProgress[]> {
      return kpssRepo.getAllProgress();
    },

    /**
     * Sets the complete list of KPSS topic progress.
     */
    setKpssProgress(progressList: KpssProgress[]): Promise<void> {
      return kpssRepo.saveAllProgress(progressList);
    },

    /**
     * Retrieves question history records.
     */
    getKpssDailyStats(): Promise<KpssDailyStats[]> {
      return kpssRepo.getAllDailyStats();
    },

    /**
     * Sets question history records.
     */
    setKpssDailyStats(stats: KpssDailyStats[]): Promise<void> {
      return kpssRepo.saveAllDailyStats(stats);
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
      const progressList = await kpssRepo.getAllProgress();
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

      await kpssRepo.saveAllProgress(progressList);
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
      const stats = await kpssRepo.getAllDailyStats();

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

      await kpssRepo.saveAllDailyStats(stats);
    },

    /**
     * Deletes a specific day's record from history.
     */
    async deleteKpssDailyStat(date: string): Promise<void> {
      const stats = await kpssRepo.getAllDailyStats();
      const filtered = stats.filter((s) => s.date !== date);
      await kpssRepo.saveAllDailyStats(filtered);
    },

    /**
     * Retrieves dynamic progress percentage for a subject.
     */
    async getSubjectProgressPercentage(
      subject: string,
      totalTopics: number,
    ): Promise<number> {
      const progressList = await kpssRepo.getAllProgress();
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
      await kpssRepo.removeAll();
    },
  };
}

export type KpssService = ReturnType<typeof createKpssService>;

/**
 * Lazy singleton — infrastructure is NOT created at module import time.
 * The first property access triggers instantiation; subsequent calls reuse the instance.
 * Components that need testability can import `createKpssService` instead.
 */
import { ChromeStorageKpssRepository } from "@/infrastructure/persistence/ChromeStorageKpssRepository.js";
let _kpssServiceInstance: KpssService | null = null;
function getKpssService(): KpssService {
  if (!_kpssServiceInstance) {
    _kpssServiceInstance = createKpssService(new ChromeStorageKpssRepository());
  }
  return _kpssServiceInstance;
}
export const kpssService: KpssService = new Proxy({} as KpssService, {
  get(_, prop: keyof KpssService) {
    return getKpssService()[prop];
  },
});
