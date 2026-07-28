/**
 * kpssChartDrawer.ts
 * Pure Canvas 2D drawing utility for KPSS daily study progress charts (line & bar modes).
 * Supports metric filtering: "all" | "questions" | "videos".
 */

import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpssService.js";

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

function getFormattedDateLabel(dateStr?: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2] || "01"}/${parts[1] || "01"}`;
  }
  return dateStr;
}

export function getSubjectNets(subKey: string, kpssProgress: KpssProgress[]) {
  const tList = kpssData[subKey] || [];
  let totalNet = 0;
  let totalQuestions = 0;

  tList.forEach((t) => {
    totalQuestions += t.questionsCount;
    const prog = kpssProgress.find(
      (p) => p.subject === subKey && p.topic === t.title
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

export function drawKpssStatsChart(
  canvas: HTMLCanvasElement,
  params: KpssChartParams
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;

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

  // Draw Grid lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const {
    lang,
    dailyStats,
    chartDays,
    chartType,
    metricMode = "all",
    goalType,
    targetNet,
    targetScore,
    kpssProgress,
    kpssTargetDate,
  } = params;

  const showQuestions = metricMode === "all" || metricMode === "questions";
  const showVideos = metricMode === "all" || metricMode === "videos";

  const statsMap = new Map<string, KpssDailyStats>();
  (dailyStats || []).forEach((s) => {
    if (!s.date) return;
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
      lastNDays.push({
        date: dayStr,
        questions: 0,
        videos: 0,
        subject: "",
      });
    }
  }

  // Calculate daily target score details
  const overallNetObj = getOverallNets(kpssProgress);
  const overallNet = overallNetObj.net;
  const estimatedScore = Math.round((40 + overallNet * 0.5) * 10) / 10;
  const daysRemaining = Math.max(
    1,
    Math.round((kpssTargetDate - Date.now()) / (1000 * 60 * 60 * 24))
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
    Math.round(remainingQuestions / daysRemaining)
  );
  const dailyVideosTarget = Math.max(
    1,
    Math.round(remainingVideos / daysRemaining)
  );

  const maxQuestions = Math.max(
    ...lastNDays.map((s) => s.questions),
    dailyQuestionsTarget,
    10
  );
  const maxVideos = Math.max(
    ...lastNDays.map((s) => s.videos || 0),
    dailyVideosTarget,
    1
  );

  const getX = (index: number, count: number) => {
    if (count === 1) {
      return padding + chartWidth / 2;
    }
    return padding + (index / (count - 1)) * chartWidth;
  };

  const getYQ = (qVal: number) => {
    const scaledH = (qVal / maxQuestions) * (chartHeight - 30);
    return height - padding - Math.max(scaledH, 0);
  };

  const getYV = (vVal: number) => {
    const scaledH = ((vVal || 0) / maxVideos) * (chartHeight - 30);
    return height - padding - Math.max(scaledH, 0);
  };

  const drawTargetReferenceLines = () => {
    ctx.setLineDash([4, 4]);

    if (showQuestions) {
      const yTargetQ = getYQ(dailyQuestionsTarget);
      ctx.strokeStyle = "rgba(107, 114, 128, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, yTargetQ);
      ctx.lineTo(width - padding, yTargetQ);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "left";
      ctx.fillText(
        `${lang === "tr" ? "Hedef Soru" : "Target Q"}: ${dailyQuestionsTarget}`,
        padding + 4,
        yTargetQ - 4
      );
    }

    if (showVideos) {
      const yTargetV = getYV(dailyVideosTarget);
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, yTargetV);
      ctx.lineTo(width - padding, yTargetV);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "right";
      ctx.fillText(
        `${lang === "tr" ? "Hedef Video" : "Target V"}: ${dailyVideosTarget}`,
        width - padding - 4,
        yTargetV - 4
      );
    }

    ctx.setLineDash([]); // Reset
  };

  // --- CASE A: EMPTY STATE ---
  if (lastNDays.length === 0) {
    if (chartType === "bar") {
      const barWidth = 70;
      const barGap = 50;
      const centerX = padding + chartWidth / 2;

      if (showQuestions) {
        const xQ = showVideos ? centerX - barWidth - barGap / 2 : centerX - barWidth / 2;
        const hQ = chartHeight * 0.65;
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
        const hV = chartHeight * 0.55;
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
    }
    return;
  }

  // --- CASE B: BAR CHART ---
  if (chartType === "bar") {
    const slotWidth = chartWidth / lastNDays.length;
    const barGap = 2;
    const slotPadding = lastNDays.length > 10 ? 2 : 6;
    const numBars = showQuestions && showVideos ? 2 : 1;
    const barWidth = (slotWidth - slotPadding * 2 - (numBars > 1 ? barGap : 0)) / numBars;

    lastNDays.forEach((stat, i) => {
      const slotX = padding + i * slotWidth;

      if (showQuestions) {
        const xQ = slotX + slotPadding;
        const hQ = (stat.questions / maxQuestions) * (chartHeight - 30);
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
        const xV = showQuestions ? slotX + slotPadding + barWidth + barGap : slotX + slotPadding;
        const hV = ((stat.videos || 0) / maxVideos) * (chartHeight - 30);
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

    drawTargetReferenceLines();
    return;
  }

  // --- CASE C: LINE CHART ---
  if (lastNDays.length > 1) {
    if (showQuestions) {
      // Questions Line Gradient Area
      ctx.beginPath();
      ctx.moveTo(getX(0, lastNDays.length), height - padding);
      for (let i = 0; i < lastNDays.length; i++) {
        ctx.lineTo(getX(i, lastNDays.length), getYQ(lastNDays[i].questions));
      }
      ctx.lineTo(getX(lastNDays.length - 1, lastNDays.length), height - padding);
      ctx.closePath();
      const gradQ = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradQ.addColorStop(0, "rgba(16, 185, 129, 0.2)");
      gradQ.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = gradQ;
      ctx.fill();

      // Questions Line
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < lastNDays.length; i++) {
        const x = getX(i, lastNDays.length);
        const y = getYQ(lastNDays[i].questions);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (showVideos) {
      // Videos Line Gradient Area
      ctx.beginPath();
      ctx.moveTo(getX(0, lastNDays.length), height - padding);
      for (let i = 0; i < lastNDays.length; i++) {
        ctx.lineTo(getX(i, lastNDays.length), getYV(lastNDays[i].videos || 0));
      }
      ctx.lineTo(getX(lastNDays.length - 1, lastNDays.length), height - padding);
      ctx.closePath();
      const gradV = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradV.addColorStop(0, "rgba(59, 130, 246, 0.2)");
      gradV.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = gradV;
      ctx.fill();

      // Videos Line
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < lastNDays.length; i++) {
        const x = getX(i, lastNDays.length);
        const y = getYV(lastNDays[i].videos || 0);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  // Dots and labels on Line Chart
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

  drawTargetReferenceLines();
}
