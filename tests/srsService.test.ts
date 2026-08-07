/**
 * srsService.test.ts
 * Unit tests for SM-2 Spaced Repetition calculation logic.
 */

import { describe, it, expect } from "vitest";
import {
  calculateSM2,
  createInitialSRSWord,
  type WordReviewData,
} from "@/domain/services/SrsService.js";

describe("SM-2 Spaced Repetition Algorithm", () => {
  const initialWord: WordReviewData = createInitialSRSWord("word_123", "vocabulary");

  it("initial word has default SM-2 settings", () => {
    expect(initialWord.interval).toBe(0);
    expect(initialWord.reviewCount).toBe(0);
    expect(initialWord.easeFactor).toBe(2.5);
  });

  it("easy quality review increases interval and review count", () => {
    const next = calculateSM2(initialWord, "easy", new Date("2026-01-01T00:00:00Z"));
    expect(next.reviewCount).toBe(1);
    expect(next.interval).toBeGreaterThan(0);
    expect(next.easeFactor).toBeGreaterThanOrEqual(2.5);
    expect(next.xpEarned).toBeGreaterThan(0);
  });

  it("second consecutive successful review increases interval further", () => {
    const rev1 = calculateSM2(initialWord, "easy", new Date("2026-01-01T00:00:00Z"));
    const rev2 = calculateSM2(rev1, "easy", new Date("2026-01-02T00:00:00Z"));
    expect(rev2.reviewCount).toBe(2);
    expect(rev2.interval).toBeGreaterThan(rev1.interval);
  });

  it("hard quality review reduces ease factor", () => {
    const rev1 = calculateSM2(initialWord, "easy", new Date("2026-01-01T00:00:00Z"));
    const failed = calculateSM2(rev1, "hard", new Date("2026-01-02T00:00:00Z"));
    expect(failed.easeFactor).toBeLessThan(rev1.easeFactor);
  });

  it("easeFactor never drops below minimum threshold 1.3", () => {
    let word = initialWord;
    for (let i = 0; i < 10; i++) {
      word = calculateSM2(word, "hard", new Date());
    }
    expect(word.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
