/**
 * kpssChartDrawer.ts
 * KPSS çalışma ilerleme grafiği orkestratörü.
 * Hesaplamalar, bar ve line render alt modüllere dağıtılmıştır.
 * Tüketici: KpssDailyStatsCard.tsx (import değişmez).
 */

import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  getLastNDays,
  calculateDailyTargets,
} from "./kpssChartCalculations.js";
import { renderBarChart } from "./kpssChartRenderBar.js";
import { renderLineChart } from "./kpssChartRenderLine.js";

export { getSubjectNets, getOverallNets } from "./kpssChartCalculations.js";

export interface KpssChartParams {
  lang: Language;
  dailyStats: KpssDailyStats[];
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  metricMode?: "all" | "questions" | "videos";
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  kpssProgress: KpssProgress[];
  kpssTargetDate: number;
}

export function drawKpssStatsChart(
  canvas: HTMLCanvasElement,
  params: KpssChartParams,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.clearRect(0, 0, width, height);

  // Ortak grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const { lang, dailyStats, chartDays, chartType, metricMode = "all" } = params;

  const t = getTranslation(lang);

  const showQuestions = metricMode === "all" || metricMode === "questions";
  const showVideos = metricMode === "all" || metricMode === "videos";

  const lastNDays = getLastNDays(dailyStats, chartDays);
  const targets = calculateDailyTargets(params);

  const maxQuestions = Math.max(
    ...lastNDays.map((s) => s.questions),
    targets.dailyQuestionsTarget,
    10,
  );
  const maxVideos = Math.max(
    ...lastNDays.map((s) => s.videos || 0),
    targets.dailyVideosTarget,
    1,
  );

  const drawTargetRef = () => {
    ctx.setLineDash([4, 4]);

    if (showQuestions) {
      const yQ =
        height -
        padding -
        Math.max(
          (targets.dailyQuestionsTarget / maxQuestions) * (chartHeight - 30),
          0,
        );
      ctx.strokeStyle = "rgba(107, 114, 128, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, yQ);
      ctx.lineTo(width - padding, yQ);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "left";
      ctx.fillText(
        `${t.kpss_chart_target_q}: ${targets.dailyQuestionsTarget}`,
        padding + 4,
        yQ - 4,
      );
    }

    if (showVideos) {
      const yV =
        height -
        padding -
        Math.max(
          (targets.dailyVideosTarget / maxVideos) * (chartHeight - 30),
          0,
        );
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, yV);
      ctx.lineTo(width - padding, yV);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "right";
      ctx.fillText(
        `${t.kpss_chart_target_v}: ${targets.dailyVideosTarget}`,
        width - padding - 4,
        yV - 4,
      );
    }

    ctx.setLineDash([]);
  };

  if (chartType === "bar") {
    renderBarChart({
      canvas,
      ctx,
      height,
      padding,
      chartWidth,
      chartHeight,
      lastNDays,
      showQuestions,
      showVideos,
      maxQuestions,
      maxVideos,
      dailyQuestionsTarget: targets.dailyQuestionsTarget,
      dailyVideosTarget: targets.dailyVideosTarget,
      targetLineDrawer: drawTargetRef,
    });
  } else {
    renderLineChart({
      canvas,
      ctx,
      height,
      padding,
      chartWidth,
      chartHeight,
      lastNDays,
      showQuestions,
      showVideos,
      maxQuestions,
      maxVideos,
      targetLineDrawer: drawTargetRef,
    });
  }
}
