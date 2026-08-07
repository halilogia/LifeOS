/**
 * useSrs store
 * Zustand singleton — SRS flashcard queue + SM2 review + progress persistence.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type WordReviewData,
  type ReviewQuality,
} from "@/domain/services/SrsService.js";
import { getAllWords } from "@/services/vocabularyService.js";
import type { Word } from "@/types/word.js";
import { logger } from "@/utils/logger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const PROGRESS_KEY = "srsProgress";

/**
 * Kelimenin banka seviyesinden gerçek wordType'ı çözer.
 * AuraLingo'daki 4 ayrı koleksiyon mantığının tek-koleksiyon karşılığı:
 *   idiom → idiom, phrasal → phrasal, irregular → verb, diğerleri → vocabulary.
 */
function resolveWordType(
  word: Word,
): "vocabulary" | "verb" | "phrasal" | "idiom" {
  const level = (word.level || "").toLowerCase();
  if (level === "idiom") {
    return "idiom";
  }
  if (level === "phrasal") {
    return "phrasal";
  }
  if (level === "irregular" || word.v1 || word.class === "IRREGULAR VERB") {
    return "verb";
  }
  return "vocabulary";
}

interface SrsState {
  loading: boolean;
  error: boolean;
  wordsData: Word[];
  currentQueue: WordReviewData[];
  currentWordIndex: number;
  setCurrentWordIndex: (i: number | ((prev: number) => number)) => void;
  isFlipped: boolean;
  setIsFlipped: (v: boolean | ((prev: boolean) => boolean)) => void;
  fadeState: "normal" | "slide-out";
  setFadeState: (v: "normal" | "slide-out") => void;
  loadSrsQueue: () => Promise<void>;
  handleReview: (quality: ReviewQuality) => Promise<void>;
}

export const useSrsState = create<SrsState>()((set, get) => ({
  loading: true,
  error: false,
  wordsData: [],
  currentQueue: [],
  currentWordIndex: 0,
  setCurrentWordIndex: (i) =>
    set((s) => ({
      currentWordIndex: typeof i === "function" ? i(s.currentWordIndex) : i,
    })),
  isFlipped: false,
  setIsFlipped: (v) =>
    set((s) => ({ isFlipped: typeof v === "function" ? v(s.isFlipped) : v })),
  fadeState: "normal",
  setFadeState: (v) => set({ fadeState: v }),

  loadSrsQueue: async () => {
    set({ loading: true, error: false });
    try {
      const data = await getAllWords();
      set({ wordsData: data });
      const progress: WordReviewData[] = await new Promise((resolve) =>
        chrome.storage.local.get([PROGRESS_KEY], (res) =>
          resolve((res[PROGRESS_KEY] as WordReviewData[]) || []),
        ),
      );

      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) => progressMap.set(p.wordId, p));

      const srsUniverse: SRSWordWithInfo[] = data.slice(0, 1500).map((w) => {
        const p =
          progressMap.get(w.id) ||
          createInitialSRSWord(w.id, resolveWordType(w));
        return {
          ...p,
          level: w.level || "unknown",
          listType: "all",
          freq: w.freq || 0,
        };
      });

      const enrichedProgress: SRSWordWithInfo[] = progress.map((p) => {
        const wInfo = data.find((w) => w.id === p.wordId);
        return {
          ...p,
          // Eski kayıtlar sabit "vocabulary" ile yazılmış olabilir — gerçek tipe düzelt
          wordType: wInfo ? resolveWordType(wInfo) : p.wordType,
          level: wInfo?.level || "unknown",
          listType: "all",
          freq: wInfo?.freq || 0,
        };
      });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 10,
        isCustomMode: false,
        filters: { listType: "all", levels: [] },
        universe: srsUniverse,
      });

      set({ currentQueue: queue, currentWordIndex: 0, loading: false });
    } catch (e) {
      logger.error("[SrsView] loadSrsQueue:", e);
      set({ error: true, loading: false });
    }
  },

  handleReview: async (quality) => {
    const { currentQueue, currentWordIndex } = get();
    const reviewData = currentQueue[currentWordIndex];
    if (!reviewData) {
      return;
    }

    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress: WordReviewData[] = await new Promise((resolve) =>
      chrome.storage.local.get([PROGRESS_KEY], (res) =>
        resolve((res[PROGRESS_KEY] as WordReviewData[]) || []),
      ),
    );

    const idx = progress.findIndex(
      (p: WordReviewData) => p.wordId === outcome.wordId,
    );
    if (idx >= 0) {
      progress[idx] = outcome;
    } else {
      progress.push(outcome);
    }
    await new Promise<void>((resolve) =>
      chrome.storage.local.set({ [PROGRESS_KEY]: progress }, resolve),
    );
    scheduleCloudBackup();
    set({ fadeState: "slide-out" });
    setTimeout(() => {
      set((s) => ({
        currentWordIndex: s.currentWordIndex + 1,
        isFlipped: false,
        fadeState: "normal",
      }));
    }, 400);
  },
}));
