/**
 * kpssChartRenderLine.ts
 * Line chart renderer — Case C.
 * Parça: kpssChartDrawer orkestratörü çağırır.
 */

import { KpssDailyStats } from "@/types/types.js";
import { getFormattedDateLabel } from "./kpssChartCalculations.js";

interface LineChartConfig {
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
  targetLineDrawer: () => void;
}

export function renderLineChart(config: LineChartConfig): void {
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
    targetLineDrawer,
  } = config;

  const getX = (index: number, count: number) => {
    if (count === 1) {
      return padding + cw / 2;
    }
    return padding + (index / (count - 1)) * cw;
  };

  const getYQ = (qVal: number) => {
    const scaledH = (qVal / maxQuestions) * (ch - 30);
    return height - padding - Math.max(scaledH, 0);
  };

  const getYV = (vVal: number) => {
    const scaledH = ((vVal || 0) / maxVideos) * (ch - 30);
    return height - padding - Math.max(scaledH, 0);
  };

  /* ---- Line body ---- */
  if (lastNDays.length > 1) {
    if (showQuestions) {
      ctx.beginPath();
      ctx.moveTo(getX(0, lastNDays.length), height - padding);
      for (let i = 0; i < lastNDays.length; i++) {
        ctx.lineTo(getX(i, lastNDays.length), getYQ(lastNDays[i].questions));
      }
      ctx.lineTo(
        getX(lastNDays.length - 1, lastNDays.length),
        height - padding,
      );
      ctx.closePath();
      const gradQ = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradQ.addColorStop(0, "rgba(16, 185, 129, 0.2)");
      gradQ.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = gradQ;
      ctx.fill();

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < lastNDays.length; i++) {
        const x = getX(i, lastNDays.length);
        const y = getYQ(lastNDays[i].questions);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    if (showVideos) {
      ctx.beginPath();
      ctx.moveTo(getX(0, lastNDays.length), height - padding);
      for (let i = 0; i < lastNDays.length; i++) {
        ctx.lineTo(getX(i, lastNDays.length), getYV(lastNDays[i].videos || 0));
      }
      ctx.lineTo(
        getX(lastNDays.length - 1, lastNDays.length),
        height - padding,
      );
      ctx.closePath();
      const gradV = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradV.addColorStop(0, "rgba(59, 130, 246, 0.2)");
      gradV.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradV;
      ctx.fill();

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < lastNDays.length; i++) {
        const x = getX(i, lastNDays.length);
        const y = getYV(lastNDays[i].videos || 0);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }

  /* ---- Dots and labels ---- */
  lastNDays.forEach((stat, i) => {
    const x = getX(i, lastNDays.length);

    if (showQuestions) {
      const yQ = getYQ(stat.questions);
      ctx.fillStyle = "#10b981";
      ctx.strokeStyle = "#0d0d12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, yQ, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (lastNDays.length <= 7 && stat.questions > 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        ctx.fillText(stat.questions.toString(), x, yQ - 8);
      }
    }

    if (showVideos) {
      const yV = getYV(stat.videos || 0);
      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#0d0d12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, yV, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (lastNDays.length <= 7 && (stat.videos || 0) > 0) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        ctx.fillText((stat.videos || 0).toString(), x, yV - 8);
      }
    }

    if (lastNDays.length <= 7 || i % 5 === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 10px Inter";
      ctx.textAlign = "center";
      const dateLabel = getFormattedDateLabel(stat.date);
      ctx.fillText(dateLabel, x, height - padding + 18);
    }
  });

  targetLineDrawer();
}
