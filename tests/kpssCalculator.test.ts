/**
 * kpssCalculator.test.ts
 * Unit tests for KPSS net calculations and countdown formatting formulas.
 */

import { describe, it, expect } from "vitest";
import {
  getSubjectNets,
  getOverallNets,
  formatKpssCountdown,
  calculateEstimatedCompletionTime,
  type KpssProgress,
} from "@/domain/services/KpssCalculatorService.js";
import type { KpssTopic } from "@/domain/constants/kpssCurriculum.js";

describe("KPSS Calculator Service", () => {
  const dummyKpssData: Record<string, KpssTopic[]> = {
    turkce: [{ title: "Dil Bilgisi", questionsCount: 30, description: "Konu tanımı" }],
    tarih: [{ title: "Osmanlı Tarihi", questionsCount: 27, description: "Konu tanımı" }],
  };

  it("calculates subject nets correctly", () => {
    const progress: KpssProgress[] = [
      { subject: "turkce", topic: "Dil Bilgisi", score: 80, status: 2 },
    ];
    const res = getSubjectNets("turkce", dummyKpssData, progress);
    expect(res.net).toBe(24); // 80% of 30 = 24
    expect(res.max).toBe(30);
  });

  it("calculates overall nets across multiple subjects", () => {
    const progress: KpssProgress[] = [
      { subject: "turkce", topic: "Dil Bilgisi", score: 80, status: 2 },
      { subject: "tarih", topic: "Osmanlı Tarihi", score: 100, status: 2 },
    ];
    const overall = getOverallNets(dummyKpssData, progress);
    expect(overall.net).toBe(51); // 24 + 27 = 51
    expect(overall.max).toBe(57); // 30 + 27 = 57
  });

  it("formats completion countdown string correctly", () => {
    const countdown = calculateEstimatedCompletionTime(5, Date.now());
    expect(countdown).not.toBeNull();
    if (countdown) {
      const formatted = formatKpssCountdown(countdown, "{days} gün {hours} saat");
      expect(formatted).toContain("gün");
    }
  });
});
