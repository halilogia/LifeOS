/**
 * KpssCalculatorService
 * Domain service for KPSS calculation utilities.
 * Pure functions — no external dependencies beyond domain types.
 * Clean Architecture: Domain layer has zero external dependencies.
 */

import type { KpssTopic } from "@/domain/constants/kpssCurriculum.js";

/**
 * KpssProgress type — defined locally in domain layer
 * to avoid dependency on @/types/types.ts
 */
export interface KpssProgress {
  subject: string;
  topic: string;
  status: 0 | 1 | 2; // 0: reset, 1: working, 2: finished
  score?: number; // test percentage score (0-100)
}

/** Raw countdown result — no formatting, no translation dependency */
export interface KpssCountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculates the KPSS countdown.
 * Returns raw time data or null if exam date has passed.
 * Domain layer — pure function, no external dependencies.
 */
export function calculateKpssCountdown(
  targetDate: number,
  now: number,
): KpssCountdownResult | null {
  const diffKpss = targetDate - now;
  if (diffKpss <= 0) {
    return null;
  }
  return {
    days: Math.floor(diffKpss / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffKpss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffKpss % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffKpss % (1000 * 60)) / 1000),
  };
}

/**
 * Calculates estimated completion time based on remaining count.
 * Returns raw time data or null if already completed.
 * Domain layer — pure function, no external dependencies.
 */
export function calculateEstimatedCompletionTime(
  remainingCount: number,
  now: number,
): KpssCountdownResult | null {
  if (remainingCount === 0) {
    return null;
  }
  const estimatedRemainingDays = remainingCount * 2;
  const estimatedTargetDate =
    now + estimatedRemainingDays * 24 * 60 * 60 * 1000;
  const diffEst = estimatedTargetDate - now;

  return {
    days: Math.floor(diffEst / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffEst % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffEst % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diffEst % (1000 * 60)) / 1000),
  };
}

/**
 * Formats a KpssCountdownResult into a localized string.
 * This is a presentation-layer helper, NOT part of the domain service.
 * It's kept here for convenience but callers should use their own i18n.
 */
export function formatKpssCountdown(
  result: KpssCountdownResult,
  timeFormat: string,
): string {
  return timeFormat
    .replace("{days}", String(result.days))
    .replace("{hours}", String(result.hours))
    .replace("{mins}", String(result.minutes))
    .replace("{secs}", String(result.seconds));
}

/**
 * Calculates subject net scores.
 * Pure function — no external dependencies.
 */
export function getSubjectNets(
  subKey: string,
  kpssData: Record<string, KpssTopic[]>,
  kpssProgress: KpssProgress[],
): { net: number; max: number } {
  const tList = kpssData[subKey] || [];
  let totalNet = 0;
  let totalQuestions = 0;

  tList.forEach((t) => {
    totalQuestions += t.questionsCount;
    const prog = kpssProgress.find(
      (p) => p.subject === subKey && p.topic === t.title,
    );
    if (prog) {
      if (prog.score !== undefined) {
        totalNet += (prog.score / 100) * t.questionsCount;
      } else if (prog.status === 2) {
        totalNet += 0.8 * t.questionsCount;
      } else if (prog.status === 1) {
        totalNet += 0.4 * t.questionsCount;
      }
    }
  });
  return { net: Math.round(totalNet * 10) / 10, max: totalQuestions };
}

/**
 * Calculates overall net scores across all subjects.
 * Pure function — no external dependencies.
 */
export function getOverallNets(
  kpssData: Record<string, KpssTopic[]>,
  kpssProgress: KpssProgress[],
): { net: number; max: number } {
  let totalNet = 0;
  let totalMax = 0;
  Object.keys(kpssData).forEach((subKey) => {
    const { net, max } = getSubjectNets(subKey, kpssData, kpssProgress);
    totalNet += net;
    totalMax += max;
  });
  return { net: Math.round(totalNet * 10) / 10, max: totalMax };
}
