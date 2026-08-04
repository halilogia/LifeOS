/**
 * kpssSrsService.ts
 * Service for loading SRS queues and saving review qualities for KPSS flashcards.
 * Kaynak: yalnızca tarih çıkmış sorular (kpssOsymHistoryFlashcards).
 */

import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import { kpssOsymHistoryFlashcards } from "@/domain/constants/kpssOsymHistoryFlashcards.js";
import { KpssFlashcard } from "@/services/kpss/kpssService.js";
import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";

export function createKpssSrsService(srsRepo: ISrsProgressRepository) {
  return {
    /** Loads enriched SRS flashcard queue from tarih çıkmış soruları. */
    async loadSrsQueue(chapter: string = "all"): Promise<{
      queue: WordReviewData[];
      universe: KpssFlashcard[];
      chapters: string[];
    }> {
      const progress: Record<string, unknown>[] = await srsRepo.getAll();

      // Benzersiz bölüm listesi (ÖSYM çıkmış'taki ünite seçici gibi)
      const chapters = Array.from(
        new Set(kpssOsymHistoryFlashcards.map((c) => c.category)),
      ).sort();

      let activeUniverseCards: KpssFlashcard[];
      if (chapter === "all") {
        activeUniverseCards = kpssOsymHistoryFlashcards;
      } else {
        activeUniverseCards = kpssOsymHistoryFlashcards.filter(
          (c) => c.category === chapter,
        );
      }

      // Eski kayıtları temizle: universe'te olmayan (notlardan gelen) kartlar atılır
      const validIds = new Set(activeUniverseCards.map((c) => c.id));
      const filteredProgress = progress.filter((p) =>
        validIds.has(p.wordId as string),
      );
      if (filteredProgress.length !== progress.length) {
        await srsRepo.saveAll(filteredProgress);
      }

      const progressMap = new Map<string, WordReviewData>();
      filteredProgress.forEach((p) =>
        progressMap.set(p.wordId as string, p as unknown as WordReviewData),
      );

      const srsUniverse: SRSWordWithInfo[] = activeUniverseCards.map((w) => {
        const p =
          progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
        return { ...p, level: w.category, listType: "kpss", freq: 0 };
      });

      const enrichedProgress: SRSWordWithInfo[] = filteredProgress.map((p) => {
        const wInfo = activeUniverseCards.find((w) => w.id === p.wordId);
        return {
          ...p,
          level: wInfo?.category || "Tarih",
          listType: "kpss",
          freq: 0,
        } as unknown as SRSWordWithInfo;
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 15,
        isCustomMode: true,
        filters: { listType: "kpss", levels: [] },
        universe: srsUniverse,
      });

      return { queue, universe: activeUniverseCards, chapters };
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

import { ChromeStorageSrsProgressRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSrsProgressRepository.js";

const _defaultSrsRepo = new ChromeStorageSrsProgressRepository();
const _defaultSrsService = createKpssSrsService(_defaultSrsRepo);

export const kpssSrsService = _defaultSrsService;
