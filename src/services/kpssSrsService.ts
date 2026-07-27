/**
 * kpssSrsService.ts
 * Helper service for loading SRS queues and saving review qualities for KPSS flashcards.
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

export const kpssSrsService = {
  /**
   * Loads enriched SRS flashcard queue from Chrome synced storage.
   */
  async loadSrsQueue(): Promise<WordReviewData[]> {
    const progress: any[] = await new Promise((resolve) =>
      chrome.storage.sync.get(["kpssSrsProgress"], (res) =>
        resolve((res.kpssSrsProgress as any[]) || []),
      ),
    );

    const progressMap = new Map<string, WordReviewData>();
    progress.forEach((p) => progressMap.set(p.wordId, p));

    const srsUniverse: SRSWordWithInfo[] = kpssDummyFlashcards.map((w) => {
      const p =
        progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
      return {
        ...p,
        level: w.category,
        listType: "kpss",
        freq: 0,
      };
    });

    const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
      const wInfo = kpssDummyFlashcards.find((w) => w.id === p.wordId);
      return {
        ...p,
        level: wInfo?.category || "Tarih",
        listType: "kpss",
        freq: 0,
      };
    });

    return prepareSRSQueue(enrichedProgress, {
      dailyGoal: 10,
      isCustomMode: true,
      filters: { listType: "kpss", levels: [] },
      universe: srsUniverse,
    });
  },

  /**
   * Processes review quality rating with SM-2 algorithm and persists to storage.
   */
  async saveSrsReview(
    reviewData: WordReviewData,
    quality: ReviewQuality,
  ): Promise<void> {
    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress: any[] = await new Promise((resolve) =>
      chrome.storage.sync.get(["kpssSrsProgress"], (res) =>
        resolve((res.kpssSrsProgress as any[]) || []),
      ),
    );

    const idx = progress.findIndex((p: any) => p.wordId === outcome.wordId);
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }

    await new Promise<void>((resolve) =>
      chrome.storage.sync.set({ kpssSrsProgress: progress }, resolve),
    );
  },
};
