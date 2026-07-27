/**
 * kpssChartDrawer.ts
 * Pure Canvas 2D drawing utility for KPSS daily study progress charts (line & bar modes).
 */

import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpssService.js";

export interface KpssChartParams {
  lang: Language;
  dailyStats: KpssDailyStats[];
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  kpssProgress: KpssProgress[];
  kpssTargetDate: number;
}

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

export function drawKpssStatsChart(
  canvas: HTMLCanvasElement,
  params: KpssChartParams,
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
    goalType,
    targetNet,
    targetScore,
    kpssProgress,
    kpssTargetDate,
  } = params;

  const stats = dailyStats || [];
  const lastNDays = stats.slice(-chartDays);

  // Calculate daily target score details
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

  const maxQuestions = Math.max(
    ...lastNDays.map((s) => s.questions),
    dailyQuestionsTarget,
    10,
  );
  const maxVideos = Math.max(
    ...lastNDays.map((s) => s.videos || 0),
    dailyVideosTarget,
    1,
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
    const yTargetQ = getYQ(dailyQuestionsTarget);
    const yTargetV = getYV(dailyVideosTarget);

    ctx.strokeStyle = "rgba(107, 114, 128, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, yTargetQ);
    ctx.lineTo(width - padding, yTargetQ);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, yTargetV);
    ctx.lineTo(width - padding, yTargetV);
    ctx.stroke();

    ctx.setLineDash([]); // Reset

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "bold 9px Inter";

    ctx.textAlign = "left";
    ctx.fillText(
      `${lang === "tr" ? "Hedef Soru" : "Target Q"}: ${dailyQuestionsTarget}`,
      padding + 4,
      yTargetQ - 4,
    );

    ctx.textAlign = "right";
    ctx.fillText(
      `${lang === "tr" ? "Hedef Video" : "Target V"}: ${dailyVideosTarget}`,
      width - padding - 4,
      yTargetV - 4,
    );
  };

  // --- CASE A: EMPTY STATE ---
  if (lastNDays.length === 0) {
    if (chartType === "bar") {
      const barWidth = 70;
      const barGap = 50;
      const centerX = padding + chartWidth / 2;
      const xQ = centerX - barWidth - barGap / 2;
      const xV = centerX + barGap / 2;

      const hQ = chartHeight * 0.65;
      const hV = chartHeight * 0.55;
      const yQ = height - padding - hQ;
      const yV = height - padding - hV;

      const gradQ = ctx.createLinearGradient(xQ, yQ, xQ, height - padding);
      gradQ.addColorStop(0, "#6b7280");
      gradQ.addColorStop(1, "rgba(107, 114, 128, 0.1)");
      ctx.fillStyle = gradQ;
      ctx.beginPath();
      ctx.roundRect(xQ, yQ, barWidth, hQ, [8, 8, 0, 0]);
      ctx.fill();

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
      ctx.fillText(
        `${dailyQuestionsTarget} Soru`,
        xQ + barWidth / 2,
        yQ - 10,
      );
      ctx.fillText(`${dailyVideosTarget} Video`, xV + barWidth / 2, yV - 10);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "600 10px Inter";
      ctx.fillText(
        lang === "tr" ? "Günlük Soru Hedefi" : "Daily Questions Target",
        xQ + barWidth / 2,
        height - padding + 18,
      );
      ctx.fillText(
        lang === "tr" ? "Günlük Video Hedefi" : "Daily Videos Target",
        xV + barWidth / 2,
        height - padding + 18,
      );
    } else {
      const yTargetQ = getYQ(dailyQuestionsTarget);
      const yTargetV = getYV(dailyVideosTarget);

      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(padding, yTargetQ);
      ctx.lineTo(width - padding, yTargetQ);
      ctx.stroke();

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padding, yTargetV);
      ctx.lineTo(width - padding, yTargetV);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = "white";
      ctx.font = "bold 10px Inter";
      ctx.textAlign = "left";
      ctx.fillText(
        `${lang === "tr" ? "Günlük Soru Hedefi" : "Daily Questions Target"}: ${dailyQuestionsTarget} Soru`,
        padding + 10,
        yTargetQ - 6,
      );

      ctx.textAlign = "right";
      ctx.fillText(
        `${lang === "tr" ? "Günlük Video Hedefi" : "Daily Videos Target"}: ${dailyVideosTarget} Video`,
        width - padding - 10,
        yTargetV - 6,
      );

      for (let i = 0; i < chartDays; i++) {
        if (chartDays <= 7 || i % 5 === 0) {
          const x = getX(i, chartDays);
          const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
          const dateLabel = `${date.getDate()}/${date.getMonth() + 1}`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "500 10px Inter";
          ctx.textAlign = "center";
          ctx.fillText(dateLabel, x, height - padding + 18);
        }
      }
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 11px Inter";
    ctx.textAlign = "center";
    ctx.fillText(
      lang === "tr"
        ? `Kalan Süreye Göre Günlük Çalışma Hedefiniz (${daysRemaining} Gün Kaldı)`
        : `Daily Study Target by Remaining Days (${daysRemaining} Days Left)`,
      padding + chartWidth / 2,
      padding - 12,
    );
    return;
  }

  // --- CASE B: BAR CHART ---
  if (chartType === "bar") {
    const slotWidth = chartWidth / lastNDays.length;
    const barGap = 2;
    const slotPadding = lastNDays.length > 10 ? 2 : 6;
    const barWidth = (slotWidth - slotPadding * 2 - barGap) / 2;

    lastNDays.forEach((stat, i) => {
      const slotX = padding + i * slotWidth;
      const xQ = slotX + slotPadding;
      const xV = xQ + barWidth + barGap;

      const hQ = (stat.questions / maxQuestions) * (chartHeight - 30);
      const hV = ((stat.videos || 0) / maxVideos) * (chartHeight - 30);

      const yQ = height - padding - Math.max(hQ, 0);
      const yV = height - padding - Math.max(hV, 0);

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

      if (lastNDays.length <= 7) {
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Inter";
        ctx.textAlign = "center";
        if (stat.questions > 0) {
          ctx.fillText(stat.questions.toString(), xQ + barWidth / 2, yQ - 6);
        }
        if ((stat.videos || 0) > 0) {
          ctx.fillText(
            (stat.videos || 0).toString(),
            xV + barWidth / 2,
            yV - 6,
          );
        }
      }

      if (lastNDays.length <= 7 || i % 5 === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "500 10px Inter";
        ctx.textAlign = "center";
        const dateParts = stat.date.split("-");
        const dateLabel = `${dateParts[2]}/${dateParts[1]}`;
        ctx.fillText(dateLabel, slotX + slotWidth / 2, height - padding + 18);
      }
    });

    drawTargetReferenceLines();
    return;
  }

  // --- CASE C: LINE CHART ---
  if (lastNDays.length > 1) {
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
    gradQ.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    gradQ.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = gradQ;
    ctx.fill();

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
    gradV.addColorStop(0, "rgba(59, 130, 246, 0.15)");
    gradV.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = gradV;
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

  lastNDays.forEach((stat, i) => {
    const x = getX(i, lastNDays.length);
    const yQ = getYQ(stat.questions);
    const yV = getYV(stat.videos || 0);

    ctx.fillStyle = "#10b981";
    ctx.strokeStyle = "#0d0d12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, yQ, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(x, yV, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (lastNDays.length <= 7) {
      ctx.fillStyle = "white";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "center";
      if (stat.questions > 0) {
        ctx.fillText(stat.questions.toString(), x, yQ - 8);
      }
      if ((stat.videos || 0) > 0) {
        ctx.fillText((stat.videos || 0).toString(), x, yV - 8);
      }
    }

    if (lastNDays.length <= 7 || i % 5 === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 10px Inter";
      ctx.textAlign = "center";
      const dateParts = stat.date.split("-");
      const dateLabel = `${dateParts[2]}/${dateParts[1]}`;
      ctx.fillText(dateLabel, x, height - padding + 18);
    }
  });

  drawTargetReferenceLines();
}
