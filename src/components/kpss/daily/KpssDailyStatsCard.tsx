import { useRef, useEffect } from "preact/hooks";
import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { drawKpssStatsChart } from "@/utils/kpssChartDrawer.js";
import { KpssStatsInputForm } from "./KpssStatsInputForm.js";
import { KpssChartToolbar } from "./KpssChartToolbar.js";
import { KpssSavedLogChips } from "./KpssSavedLogChips.js";
import { useKpssChartMetric } from "@/presentation/hooks/useKpssChartMetric.js";

interface KpssDailyStatsCardProps {
  lang: Language;
  t: Record<string, string>;
  videosInput: string;
  subjectInput: string;
  statsTopicInput: string;
  statsCorrectInput: string;
  statsWrongInput: string;
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  onVideosInputChange: (val: string) => void;
  onSubjectInputChange: (val: string) => void;
  onStatsTopicInputChange: (val: string) => void;
  onStatsCorrectInputChange: (val: string) => void;
  onStatsWrongInputChange: (val: string) => void;
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
  videosInput,
  subjectInput,
  statsTopicInput,
  statsCorrectInput,
  statsWrongInput,
  chartDays,
  chartType,
  onVideosInputChange,
  onSubjectInputChange,
  onStatsTopicInputChange,
  onStatsCorrectInputChange,
  onStatsWrongInputChange,
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
  const { chartMetric, saveChartMetric } = useKpssChartMetric();

  const handleMetricModeChange = (mode: "all" | "questions" | "videos") => {
    saveChartMetric(mode);
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
        videosInput={videosInput}
        subjectInput={subjectInput}
        statsTopicInput={statsTopicInput}
        statsCorrectInput={statsCorrectInput}
        statsWrongInput={statsWrongInput}
        subjectsList={subjectsList}
        onVideosInputChange={onVideosInputChange}
        onSubjectInputChange={onSubjectInputChange}
        onStatsTopicInputChange={onStatsTopicInputChange}
        onStatsCorrectInputChange={onStatsCorrectInputChange}
        onStatsWrongInputChange={onStatsWrongInputChange}
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
