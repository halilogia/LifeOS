/**
 * KpssCalculatorService
 * Domain service for KPSS calculation utilities.
 * Pure functions — no external dependencies beyond domain types.
 */

import type { KpssTopic } from "@/domain/constants/kpssCurriculum.js";
import { KpssProgress } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export function calculateKpssCountdown(
  targetDate: number,
  now: number,
  lang: string,
): string {
  const t = getTranslation(lang as Language);
  const diffKpss = targetDate - now;
  if (diffKpss <= 0) {
    return t.kpss_exam_started;
  }
  const days = Math.floor(diffKpss / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffKpss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const mins = Math.floor((diffKpss % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffKpss % (1000 * 60)) / 1000);
  return t.kpss_time_format
    .replace("{days}", String(days))
    .replace("{hours}", String(hours))
    .replace("{mins}", String(mins))
    .replace("{secs}", String(secs));
}

export function calculateEstimatedCompletionTime(
  remainingCount: number,
  now: number,
  lang: string,
): string {
  const t = getTranslation(lang as Language);
  if (remainingCount === 0) {
    return t.kpss_completed;
  }
  const estimatedRemainingDays = remainingCount * 2;
  const estimatedTargetDate =
    now + estimatedRemainingDays * 24 * 60 * 60 * 1000;
  const diffEst = estimatedTargetDate - now;

  const days = Math.floor(diffEst / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffEst % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const mins = Math.floor((diffEst % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffEst % (1000 * 60)) / 1000);
  return t.kpss_time_format
    .replace("{days}", String(days))
    .replace("{hours}", String(hours))
    .replace("{mins}", String(mins))
    .replace("{secs}", String(secs));
}

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
