/**
 * kpssChartCalculations.ts
 * KPSS grafik hesaplamaları — net, hedef günlükleri, son N gün verisi.
 * Parça: kpssChartDrawer orkestratörü çağırır.
 */

import { KpssDailyStats, KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpss/kpssService.js";

export function getSubjectNets(subKey: string, kpssProgress: KpssProgress[]) {
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

export function getOverallNets(kpssProgress: KpssProgress[]) {
  let totalNet = 0;
  let totalMax = 0;
  Object.keys(kpssData).forEach((subKey) => {
    const { net, max } = getSubjectNets(subKey, kpssProgress);
    totalNet += net;
    totalMax += max;
  });
  return { net: Math.round(totalNet * 10) / 10, max: totalMax };
}

export interface ChartTargetResult {
  dailyQuestionsTarget: number;
  dailyVideosTarget: number;
  maxQuestions: number;
  maxVideos: number;
}

export interface CalculateTargetsInput {
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  kpssProgress: KpssProgress[];
  kpssTargetDate: number;
}

export function calculateDailyTargets(
  input: CalculateTargetsInput,
): ChartTargetResult {
  const { goalType, targetNet, targetScore, kpssProgress, kpssTargetDate } =
    input;
  const overallNetObj = getOverallNets(kpssProgress);
  const overallNet = overallNetObj.net;
  const estimatedScore = Math.round((40 + overallNet * 0.5) * 10) / 10;
  const daysRemaining = Math.max(
    1,
    Math.round((kpssTargetDate - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  let remainingQuestions: number;
  let remainingVideos: number;

  if (goalType === "net") {
    const netDiff = Math.max(0, targetNet - overallNet);
    remainingQuestions = netDiff * 50;
    remainingVideos = netDiff * 1.5;
  } else {
    const scoreDiff = Math.max(0, targetScore - estimatedScore);
    remainingQuestions = scoreDiff * 100;
    remainingVideos = scoreDiff * 3.0;
  }

  const dailyQuestionsTarget = Math.max(
    10,
    Math.round(remainingQuestions / daysRemaining),
  );
  const dailyVideosTarget = Math.max(
    1,
    Math.round(remainingVideos / daysRemaining),
  );

  return {
    dailyQuestionsTarget,
    dailyVideosTarget,
    maxQuestions: 10,
    maxVideos: 1,
  };
}

export function getLastNDays(
  dailyStats: KpssDailyStats[],
  chartDays: 7 | 30,
): KpssDailyStats[] {
  const statsMap = new Map<string, KpssDailyStats>();
  (dailyStats || []).forEach((s) => {
    if (!s.date) {
      return;
    }
    let key = s.date;
    if (s.date.includes("-")) {
      const parts = s.date.split("-");
      if (parts.length === 3) {
        key = `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}`;
      }
    }
    statsMap.set(key, s);
    statsMap.set(s.date, s);
  });

  const lastNDays: KpssDailyStats[] = [];
  const today = new Date();

  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    const isoStr = d.toISOString().split("T")[0];

    const existing = statsMap.get(isoStr) || statsMap.get(dayStr);
    if (existing) {
      lastNDays.push({
        date: dayStr,
        questions: existing.questions || 0,
        videos: existing.videos || 0,
        subject: existing.subject,
      });
    } else {
      lastNDays.push({ date: dayStr, questions: 0, videos: 0, subject: "" });
    }
  }

  return lastNDays;
}

export function getFormattedDateLabel(dateStr?: string): string {
  if (!dateStr) {
    return "";
  }
  if (dateStr.includes("/")) {
    return dateStr;
  }
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2] || "01"}/${parts[1] || "01"}`;
  }
  return dateStr;
}
