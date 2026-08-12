/**
 * kpssChartRenderBar.ts
 * Bar chart renderer — Case A (boş) + Case B (verili).
 * Parça: kpssChartDrawer orkestratörü çağırır.
 */

import { KpssDailyStats } from "@/types/types.js";
import { getFormattedDateLabel } from "./kpssChartCalculations.js";

interface BarChartConfig {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  height: number;
  padding: number;
  chartWidth: number;
  chartHeight: number;
  lastNDays: KpssDailyStats[];
  showQuestions: boolean;
  showVideos: boolean;
  maxQuestions: number;
  maxVideos: number;
  dailyQuestionsTarget: number;
  dailyVideosTarget: number;
  targetLineDrawer: () => void;
}

export function renderBarChart(config: BarChartConfig): void {
  const {
    ctx,
    height,
    padding,
    chartWidth: cw,
    chartHeight: ch,
    lastNDays,
    showQuestions,
    showVideos,
    maxQuestions,
    maxVideos,
    dailyQuestionsTarget,
    dailyVideosTarget,
    targetLineDrawer,
  } = config;

  /* ---- CASE A: EMPTY STATE ---- */
  if (lastNDays.length === 0) {
    const barWidth = 70;
    const barGap = 50;
    const centerX = padding + cw / 2;

    if (showQuestions) {
      const xQ = showVideos
        ? centerX - barWidth - barGap / 2
        : centerX - barWidth / 2;
      const hQ = ch * 0.65;
      const yQ = height - padding - hQ;

      const gradQ = ctx.createLinearGradient(xQ, yQ, xQ, height - padding);
      gradQ.addColorStop(0, "#6b7280");
      gradQ.addColorStop(1, "rgba(107, 114, 128, 0.1)");
      ctx.fillStyle = gradQ;
      ctx.beginPath();
      ctx.roundRect(xQ, yQ, barWidth, hQ, [8, 8, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 13px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${dailyQuestionsTarget} Soru`, xQ + barWidth / 2, yQ - 10);
    }

    if (showVideos) {
      const xV = showQuestions ? centerX + barGap / 2 : centerX - barWidth / 2;
      const hV = ch * 0.55;
      const yV = height - padding - hV;

      const gradV = ctx.createLinearGradient(xV, yV, xV, height - padding);
      gradV.addColorStop(0, "#ef4444");
      gradV.addColorStop(1, "rgba(239, 68, 68, 0.1)");
      ctx.fillStyle = gradV;
      ctx.beginPath();
      ctx.roundRect(xV, yV, barWidth, hV, [8, 8, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 13px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${dailyVideosTarget} Video`, xV + barWidth / 2, yV - 10);
    }
    return;
  }

  /* ---- CASE B: DATA BAR CHART ---- */
  const slotWidth = cw / lastNDays.length;
  const barGap = 2;
  const slotPadding = lastNDays.length > 10 ? 2 : 6;
  const numBars = showQuestions && showVideos ? 2 : 1;
  const barWidth =
    (slotWidth - slotPadding * 2 - (numBars > 1 ? barGap : 0)) / numBars;

  lastNDays.forEach((stat, i) => {
    const slotX = padding + i * slotWidth;

    if (showQuestions) {
      const xQ = slotX + slotPadding;
      const hQ = (stat.questions / maxQuestions) * (ch - 30);
      const yQ = height - padding - Math.max(hQ, 0);

      const gradQ = ctx.createLinearGradient(xQ, yQ, xQ, height - padding);
      gradQ.addColorStop(0, "#10b981");
      gradQ.addColorStop(1, "rgba(16, 185, 129, 0.1)");
      ctx.fillStyle = gradQ;
      ctx.beginPath();
      if (hQ > 4) {
        ctx.roundRect(xQ, yQ, barWidth, hQ, [4, 4, 0, 0]);
      } else {
        ctx.rect(xQ, yQ, barWidth, Math.max(hQ, 2));
      }
      ctx.fill();

      if (lastNDays.length <= 7 && stat.questions > 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        ctx.fillText(stat.questions.toString(), xQ + barWidth / 2, yQ - 6);
      }
    }

    if (showVideos) {
      const xV = showQuestions
        ? slotX + slotPadding + barWidth + barGap
        : slotX + slotPadding;
      const hV = ((stat.videos || 0) / maxVideos) * (ch - 30);
      const yV = height - padding - Math.max(hV, 0);

      const gradV = ctx.createLinearGradient(xV, yV, xV, height - padding);
      gradV.addColorStop(0, "#3b82f6");
      gradV.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = gradV;
      ctx.beginPath();
      if (hV > 4) {
        ctx.roundRect(xV, yV, barWidth, hV, [4, 4, 0, 0]);
      } else {
        ctx.rect(xV, yV, barWidth, Math.max(hV, 2));
      }
      ctx.fill();

      if (lastNDays.length <= 7 && (stat.videos || 0) > 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        ctx.fillText((stat.videos || 0).toString(), xV + barWidth / 2, yV - 6);
      }
    }

    if (lastNDays.length <= 7 || i % 5 === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 10px Inter";
      ctx.textAlign = "center";
      const dateLabel = getFormattedDateLabel(stat.date);
      ctx.fillText(dateLabel, slotX + slotWidth / 2, height - padding + 18);
    }
  });

  targetLineDrawer();
}
