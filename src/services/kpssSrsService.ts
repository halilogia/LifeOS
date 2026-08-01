/**
 * kpssSrsService.ts
 * Helper service for loading SRS queues and saving review qualities for KPSS flashcards.
 * Persistence goes through ISrsProgressRepository.
 */

import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import { kpssDummyFlashcards } from "@/domain/constants/kpssFlashcards.js";
import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";

export function createKpssSrsService(srsRepo: ISrsProgressRepository) {
  return {
    /** Loads enriched SRS flashcard queue from Chrome synced storage. */
    async loadSrsQueue(): Promise<WordReviewData[]> {
      const progress: Record<string, unknown>[] = await srsRepo.getAll();

      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) =>
        progressMap.set(p.wordId as string, p as unknown as WordReviewData),
      );

      const srsUniverse: SRSWordWithInfo[] = kpssDummyFlashcards.map((w) => {
        const p =
          progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
        return { ...p, level: w.category, listType: "kpss", freq: 0 };
      });

      const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
        const wInfo = kpssDummyFlashcards.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.category || "Tarih",
          listType: "kpss",
          freq: 0,
        } as unknown as SRSWordWithInfo;
      });

      return prepareSRSQueue(enrichedProgress, {
        dailyGoal: 10,
        isCustomMode: true,
        filters: { listType: "kpss", levels: [] },
        universe: srsUniverse,
      });
    },

    /** Processes review quality rating with SM-2 algorithm and persists. */
    async saveSrsReview(
      reviewData: WordReviewData,
      quality: ReviewQuality,
    ): Promise<void> {
      const outcome = calculateSM2(reviewData, quality, new Date());

      const progress = await srsRepo.getAll();
      const idx = progress.findIndex((p) => p.wordId === outcome.wordId);
      if (idx >= 0) {
        progress[idx] = outcome as unknown as Record<string, unknown>;
      } else {
        progress.push(outcome as unknown as Record<string, unknown>);
      }

      await srsRepo.saveAll(progress);
    },
  };
}

export type KpssSrsService = ReturnType<typeof createKpssSrsService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageSrsProgressRepository } from "@/infrastructure/persistence/ChromeStorageSrsProgressRepository.js";

const _defaultSrsRepo = new ChromeStorageSrsProgressRepository();
const _defaultSrsService = createKpssSrsService(_defaultSrsRepo);

export const kpssSrsService = _defaultSrsService;
