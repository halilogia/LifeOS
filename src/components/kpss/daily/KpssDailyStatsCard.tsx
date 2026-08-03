import { useRef, useEffect, useState } from "preact/hooks";
import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { drawKpssStatsChart } from "@/utils/kpssChartDrawer.js";
import { KpssStatsInputForm } from "./KpssStatsInputForm.js";
import { KpssChartToolbar } from "./KpssChartToolbar.js";
import { KpssSavedLogChips } from "./KpssSavedLogChips.js";

interface KpssDailyStatsCardProps {
  lang: Language;
  t: Record<string, string>;
  questionsInput: string;
  videosInput: string;
  subjectInput: string;
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  onQuestionsInputChange: (val: string) => void;
  onVideosInputChange: (val: string) => void;
  onSubjectInputChange: (val: string) => void;
  onSaveStats: () => void;
  onResetStats: () => void;
  onDeleteStat?: (date: string) => void;
  onChartDaysChange: (val: 7 | 30) => void;
  onChartTypeChange: (val: "line" | "bar") => void;
  labels: Record<string, string>;
  subjectsList: string[];
  // Chart calculation dependencies
  dailyStats: KpssDailyStats[];
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  kpssProgress: KpssProgress[];
  kpssTargetDate: number;
}

export function KpssDailyStatsCard({
  lang,
  t,
  questionsInput,
  videosInput,
  subjectInput,
  chartDays,
  chartType,
  onQuestionsInputChange,
  onVideosInputChange,
  onSubjectInputChange,
  onSaveStats,
  onResetStats,
  onDeleteStat,
  onChartDaysChange,
  onChartTypeChange,
  labels,
  subjectsList,
  dailyStats,
  goalType,
  targetNet,
  targetScore,
  kpssProgress,
  kpssTargetDate,
}: KpssDailyStatsCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [chartMetric, setChartMetric] = useState<
    "all" | "questions" | "videos"
  >("all");

  useEffect(() => {
    chrome.storage.sync.get(["kpss_chart_metric_mode"], (res) => {
      const mode = res?.kpss_chart_metric_mode;
      if (mode === "all" || mode === "questions" || mode === "videos") {
        setChartMetric(mode);
      }
    });
  }, []);

  const handleMetricModeChange = (mode: "all" | "questions" | "videos") => {
    setChartMetric(mode);
    chrome.storage.sync.set({ kpss_chart_metric_mode: mode });
  };

  useEffect(() => {
    if (canvasRef.current) {
      drawKpssStatsChart(canvasRef.current, {
        lang,
        dailyStats,
        chartDays,
        chartType,
        metricMode: chartMetric,
        goalType,
        targetNet,
        targetScore,
        kpssProgress,
        kpssTargetDate,
      });
    }
  }, [
    dailyStats,
    chartDays,
    chartType,
    chartMetric,
    goalType,
    targetNet,
    targetScore,
    kpssProgress,
    kpssTargetDate,
    lang,
  ]);

  return (
    <div className="kpss-daily-stats-section">
      <KpssStatsInputForm
        t={t}
        labels={labels}
        questionsInput={questionsInput}
        videosInput={videosInput}
        subjectInput={subjectInput}
        subjectsList={subjectsList}
        onQuestionsInputChange={onQuestionsInputChange}
        onVideosInputChange={onVideosInputChange}
        onSubjectInputChange={onSubjectInputChange}
        onSaveStats={onSaveStats}
        onResetStats={onResetStats}
      />

      <div
        className="kpss-chart-container"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <KpssChartToolbar
          t={t}
          chartMetric={chartMetric}
          chartDays={chartDays}
          chartType={chartType}
          onMetricChange={handleMetricModeChange}
          onDaysChange={onChartDaysChange}
          onTypeChange={onChartTypeChange}
        />
        <canvas
          ref={canvasRef}
          id="kpss-history-chart"
          style={{ display: "block", width: "100%", height: "200px" }}
        ></canvas>

        {/* Saved Daily Logs - Glassmorphic Pill Chips with SVG Delete Button */}
        {dailyStats && dailyStats.length > 0 && (
          <KpssSavedLogChips
            t={t}
            dailyStats={dailyStats}
            onDeleteStat={onDeleteStat}
          />
        )}
      </div>
    </div>
  );
}
