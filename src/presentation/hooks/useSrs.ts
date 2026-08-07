import { useState, useEffect, useCallback } from "preact/hooks";
import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type WordReviewData,
  type ReviewQuality,
} from "@/domain/services/SrsService.js";
import { getAllWords } from "@/services/vocabularyService.js";
import { Word } from "@/types/word.js";
import { logger } from "@/utils/logger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

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

/**
 * SRS flashcard state + SM2 review mantığı (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder.
 */
export function useSrs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wordsData, setWordsData] = useState<Word[]>([]);
  const [currentQueue, setCurrentQueue] = useState<WordReviewData[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fadeState, setFadeState] = useState<"normal" | "slide-out">("normal");

  const loadSrsQueue = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAllWords();
      setWordsData(data);
      const progress: WordReviewData[] = await new Promise((resolve) =>
        chrome.storage.local.get(["srsProgress"], (res) =>
          resolve((res.srsProgress as WordReviewData[]) || []),
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

      setCurrentQueue(queue);
      setCurrentWordIndex(0);
      setLoading(false);
    } catch (e) {
      logger.error("[SrsView] loadSrsQueue:", e);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSrsQueue();
  }, [loadSrsQueue]);

  const handleReview = async (quality: ReviewQuality) => {
    const reviewData = currentQueue[currentWordIndex];
    if (!reviewData) {
      return;
    }

    const outcome = calculateSM2(reviewData, quality, new Date());

    const progress: WordReviewData[] = await new Promise((resolve) =>
      chrome.storage.local.get(["srsProgress"], (res) =>
        resolve((res.srsProgress as WordReviewData[]) || []),
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
      chrome.storage.local.set({ srsProgress: progress }, resolve),
    );
    scheduleCloudBackup();
    setFadeState("slide-out");
    setTimeout(() => {
      setCurrentWordIndex((prev) => prev + 1);
      setIsFlipped(false);
      setFadeState("normal");
    }, 400);
  };

  return {
    loading,
    error,
    wordsData,
    currentQueue,
    currentWordIndex,
    setCurrentWordIndex,
    isFlipped,
    setIsFlipped,
    fadeState,
    loadSrsQueue,
    handleReview,
  };
}
