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
import type { KpssFlashcard } from "@/domain/constants/kpssOsymHistoryFlashcards.js";

// Re-export constants and types for backwards compatibility
export { kpssData, type KpssTopic };
export type { KpssFlashcard };

export function createKpssService(kpssRepo: IKpssRepository) {
  return {
    /**
     * Retrieves user's KPSS topic checkmark progress.
     * 100 soru %80 kuralı migrasyonu: eski "tamamlandı" (status 2) kayıtları,
     * totalQuestions >= 100 ve birikimli başarı >= %80 sağlamıyorsa
     * "çalışılıyor" (status 1) olarak düzeltilir.
     */
    async getKpssProgress(): Promise<KpssProgress[]> {
      const progressList = await kpssRepo.getAllProgress();
      const pastQuizzes = await kpssRepo.getPastQuizzes();
      let changed = false;

      progressList.forEach((p) => {
        // Eski score'u olan fakat totalQuestions verisi boş olan kayıtları onar
        if ((p.totalQuestions === undefined || p.totalQuestions === 0) && p.score !== undefined) {
          const quizKey = `${p.subject}_${p.topic}`;
          const pastQuiz = pastQuizzes[quizKey];

          if (pastQuiz && pastQuiz.questions && pastQuiz.questions.length > 0) {
            p.totalQuestions = pastQuiz.questions.length;
            const correctCount = (pastQuiz.selectedAnswers || []).filter(
              (ans, idx) => ans === pastQuiz.questions[idx]?.correctAnswer,
            ).length;
            p.totalCorrect = correctCount;
          } else {
            // standart 5 soruluk test varsayımı
            p.totalQuestions = 5;
            p.totalCorrect = Math.round((5 * p.score) / 100);
          }
          changed = true;
        }

        // Tamamlandı (status 2) olan kayıtların 100 soru + %80 başarı kuralına uyum kontrolü
        if (p.status === 2) {
          const tq = p.totalQuestions ?? 0;
          const tc = p.totalCorrect ?? 0;
          const cumPercent = tq > 0 ? Math.round((tc / tq) * 100) : 0;
          if (tq < 100 || cumPercent < 80) {
            p.status = 1;
            changed = true;
          }
        }
      });

      if (changed) {
        await kpssRepo.saveAllProgress(progressList);
      }
      return progressList;
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
     * Birikimli kural: quiz sonucu (correctCount/totalCount) verilirse
     * konunun toplam soru/doğru sayacına eklenir. Konu yalnızca
     * toplam >= 100 soru ve birikimli başarı >= %80 ise "tamamlandı" olur.
     */
    async updateTopicStatus(
      subject: string,
      topic: string,
      status: 0 | 1 | 2,
      score?: number,
      correctCount?: number,
      totalCount?: number,
    ): Promise<void> {
      const progressList = await kpssRepo.getAllProgress();
      const index = progressList.findIndex(
        (p) => p.subject === subject && p.topic === topic,
      );

      let record: KpssProgress | undefined =
        index !== -1 ? progressList[index] : undefined;

      // Birikimli sayım
      if (correctCount !== undefined && totalCount !== undefined) {
        const prevQ = record?.totalQuestions ?? 0;
        const prevC = record?.totalCorrect ?? 0;
        const newTotalQ = prevQ + totalCount;
        const newTotalC = prevC + correctCount;

        if (!record) {
          record = { subject, topic, status: 1, totalQuestions: 0, totalCorrect: 0 };
        }
        record.totalQuestions = newTotalQ;
        record.totalCorrect = newTotalC;
        record.score = score;

        // Yeni durum: min 100 soru + %80 birikimli başarı
        const cumPercent =
          newTotalQ >= 100 ? Math.round((newTotalC / newTotalQ) * 100) : 0;
        record.status =
          newTotalQ >= 100 && cumPercent >= 80
            ? 2
            : cumPercent >= 40
              ? 1
              : record.status === 2
                ? 2
                : 1;

        if (index !== -1) {
          progressList[index] = record;
        } else {
          progressList.push(record);
        }
        await kpssRepo.saveAllProgress(progressList);
        return;
      }

      // Eski davranış: manuel tamamlama / sıfırlama (birikimli sayıma dokunmaz)
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
import { ChromeStorageKpssRepository } from "@/infrastructure/persistence/repositories/ChromeStorageKpssRepository.js";
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
