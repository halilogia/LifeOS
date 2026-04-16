import {
  type ReviewQuality,
  type WordReviewData,
  type WordStatus,
} from "../types/word.js";

export interface SRSOutcome extends WordReviewData {
  xpEarned: number;
}
export function calculateSM2(
  current: WordReviewData,
  quality: ReviewQuality,
  now: Date = new Date(),
): SRSOutcome {
  let newInterval: number;
  let newEaseFactor = current.easeFactor;
  let newStatus: WordStatus = current.status;
  let xpEarned = 0;

  switch (quality) {
    case "easy":
      newEaseFactor = Math.min(2.5, current.easeFactor + 0.15);
      if (current.interval === 0) {
        newInterval = 1;
      } else if (current.interval === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(current.interval * newEaseFactor);
      }
      newStatus = "learned";
      xpEarned = 15;
      break;

    case "medium":
      if (current.interval === 0) {
        newInterval = 0.007;
      } else if (current.interval < 1) {
        newInterval = 1;
      } else {
        newInterval = Math.round(current.interval * 1.2);
      }
      newStatus = "learning";
      xpEarned = 10;
      break;

    case "hard":
      newInterval = 0.0007;
      newEaseFactor = Math.max(1.3, current.easeFactor - 0.2);
      newStatus = "learning";
      xpEarned = 0;
      break;

    default:
      newInterval = current.interval;
  }

  const nextReviewDate = new Date(
    now.getTime() + newInterval * 24 * 60 * 60 * 1000,
  );

  return {
    ...current,
    interval: newInterval,
    easeFactor: newEaseFactor,
    status: newStatus,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: now.toISOString(),
    reviewCount: current.reviewCount + 1,
    correctCount:
      quality === "easy" ? current.correctCount + 1 : current.correctCount,
    incorrectCount:
      quality === "hard" ? current.incorrectCount + 1 : current.incorrectCount,
    xpEarned,
  };
}
export function createInitialSRSWord(
  wordId: string,
  wordType: "vocabulary" | "verb" | "phrasal" | "idiom",
): WordReviewData {
  return {
    wordId,
    wordType,
    status: "new",
    nextReviewDate: new Date().toISOString(),
    lastReviewDate: "",
    reviewCount: 0,
    easeFactor: 2.5,
    interval: 0,
    correctCount: 0,
    incorrectCount: 0,
  };
}
export interface SRSWordWithInfo extends WordReviewData {
  level: string;
  listType: "ox3k" | "ox5k" | string;
  freq?: number;
}

export interface SRSQueueOptions {
  now?: Date;
  dailyGoal: number;
  isCustomMode: boolean;
  filters: {
    listType: string;
    levels: string[];
  };
  universe?: SRSWordWithInfo[];
}
export function prepareSRSQueue(
  allWords: SRSWordWithInfo[],
  options: SRSQueueOptions,
): WordReviewData[] {
  const now = options.now || new Date();
  const goal = options.dailyGoal || 10;
  const dueWords = allWords.filter((w) => {
    if (!w.nextReviewDate) {
      return true;
    }
    const nextReview = new Date(w.nextReviewDate);
    return nextReview <= now;
  });
  const filteredDue = dueWords.filter((w) => {
    const { isCustomMode, filters } = options;
    const isIdiomOrSlang = w.level === "idioms" || w.level === "slang";

    const isAllowedType = isCustomMode || !isIdiomOrSlang;

    return (
      isAllowedType &&
      (filters.listType === "all" || w.listType === filters.listType) &&
      (filters.levels.length === 0 || filters.levels.includes(w.level))
    );
  });
  let queue = [...filteredDue];
  if (queue.length < goal) {
    if (options.universe && options.universe.length > 0) {
      const existingIds = new Set(
        allWords.map((w) => String(w.wordId).toLowerCase()),
      );
      const filteredCandidates = options.universe.filter((w) => {
        const { isCustomMode, filters } = options;
        const normalizedId = String(w.wordId).toLowerCase();
        const isNotUsed = !existingIds.has(normalizedId);

        const isIdiomOrSlang = w.level === "idioms" || w.level === "slang";
        const isAllowedType = isCustomMode || !isIdiomOrSlang;

        const matchesFilters =
          isAllowedType &&
          (filters.listType === "all" || w.listType === filters.listType) &&
          (filters.levels.length === 0 || filters.levels.includes(w.level));

        return isNotUsed && matchesFilters;
      });

      const discoveryItems = filteredCandidates.slice(0, goal - queue.length);
      queue = [...queue, ...discoveryItems];
    }

    if (!options.isCustomMode && queue.length < goal) {
      const usedInSession = new Set(
        queue.map((q) => String(q.wordId).toLowerCase()),
      );
      const reservoir = [...allWords, ...(options.universe || [])];

      const remainingCharacters = reservoir.filter((w) => {
        const normalizedId = String(w.wordId).toLowerCase();

        const isNotUsed = !usedInSession.has(normalizedId);
        const isIdiomOrSlang = w.level === "idioms" || w.level === "slang";
        const isAllowedType = !isIdiomOrSlang;

        return isNotUsed && isAllowedType;
      });

      const uniqueRemaining = Array.from(
        new Map(
          remainingCharacters.map((c: SRSWordWithInfo) => [
            String(c.wordId).toLowerCase(),
            c,
          ]),
        ).values(),
      );

      const emergencyItems = uniqueRemaining.slice(0, goal - queue.length);
      queue = [...queue, ...emergencyItems];
    }
  }

  if (queue.length > goal) {
    // Optimized selection: Fisher-Yates shuffle only up to 'goal' to avoid O(N log N)
    for (let i = 0; i < goal; i++) {
      const j = i + Math.floor(Math.random() * (queue.length - i));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    queue = queue.slice(0, goal);
  } else {
    // If we have fewer than goal, still shuffle them for variety
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }

  return queue;
}
