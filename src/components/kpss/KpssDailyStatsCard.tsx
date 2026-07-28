import { useRef, useEffect, useState } from "preact/hooks";
import { Language, KpssDailyStats, KpssProgress } from "@/types/types.js";
import { drawKpssStatsChart } from "@/utils/kpssChartDrawer.js";

interface KpssDailyStatsCardProps {
  lang: Language;
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
  const [chartMetric, setChartMetric] = useState<"all" | "questions" | "videos">("all");

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
      <div className="kpss-daily-input">
        <h3>{labels.stats_title}</h3>
        <div className="kpss-stats-inputs">
          <div className="kpss-input-group">
            <label htmlFor="kpss-questions-input">{labels.stat_questions}</label>
            <input
              type="number"
              id="kpss-questions-input"
              value={questionsInput}
              onInput={(e) =>
                onQuestionsInputChange((e.target as HTMLInputElement).value)
              }
              placeholder="0"
              min="0"
            />
          </div>
          <div className="kpss-input-group">
            <label htmlFor="kpss-videos-input">
              {lang === "tr" ? "İzlenen Video" : "Videos Watched"}
            </label>
            <input
              type="number"
              id="kpss-videos-input"
              value={videosInput}
              onInput={(e) =>
                onVideosInputChange((e.target as HTMLInputElement).value)
              }
              placeholder="0"
              min="0"
            />
          </div>
          <div className="kpss-input-group">
            <label htmlFor="kpss-subject-select">{labels.stat_subject}</label>
            <select
              id="kpss-subject-select"
              value={subjectInput}
              onChange={(e) =>
                onSubjectInputChange((e.target as HTMLSelectElement).value)
              }
            >
              {subjectsList.map((subKey) => (
                <option key={subKey} value={subKey}>
                  {labels[subKey] || subKey}
                </option>
              ))}
            </select>
          </div>
          <div className="kpss-action-btns">
            <button id="kpss-save-stats-btn" onClick={onSaveStats}>
              {labels.save}
            </button>
            <button
              id="kpss-reset-stats-btn"
              className="secondary"
              onClick={onResetStats}
            >
              {labels.reset}
            </button>
          </div>
        </div>
      </div>

      <div
        className="kpss-chart-container"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-color)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            {lang === "tr" ? "İlerleme Grafiği" : "Progress Chart"}
          </span>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Metric Mode Filter Pills: Tümü / Soru / Video (Clean Text, No Emojis) */}
            <div style={{ display: "flex", background: "rgba(0, 0, 0, 0.3)", padding: "2px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <button
                type="button"
                onClick={() => setChartMetric("all")}
                style={{
                  background: chartMetric === "all" ? "var(--accent-color, #2563eb)" : "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                }}
              >
                {lang === "tr" ? "Tümü" : "All"}
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("questions")}
                style={{
                  background: chartMetric === "questions" ? "#10b981" : "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                }}
              >
                {lang === "tr" ? "Soru" : "Questions"}
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("videos")}
                style={{
                  background: chartMetric === "videos" ? "#3b82f6" : "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                }}
              >
                {lang === "tr" ? "Video" : "Videos"}
              </button>
            </div>

            {/* Range & View Type Buttons */}
            <button
              onClick={() => onChartDaysChange(7)}
              style={{
                background:
                  chartDays === 7 ? "var(--accent-color)" : "transparent",
                border: "none",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.2s",
              }}
            >
              7 G
            </button>
            <button
              onClick={() => onChartDaysChange(30)}
              style={{
                background:
                  chartDays === 30 ? "var(--accent-color)" : "transparent",
                border: "none",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.2s",
              }}
            >
              30 G
            </button>
            <button
              onClick={() => onChartTypeChange("line")}
              style={{
                background:
                  chartType === "line" ? "var(--accent-color)" : "transparent",
                border: "none",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.2s",
              }}
            >
              {lang === "tr" ? "Çizgi" : "Line"}
            </button>
            <button
              onClick={() => onChartTypeChange("bar")}
              style={{
                background:
                  chartType === "bar" ? "var(--accent-color)" : "transparent",
                border: "none",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "background 0.2s",
              }}
            >
              {lang === "tr" ? "Sütun" : "Bar"}
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          id="kpss-history-chart"
          style={{ display: "block", width: "100%", height: "200px" }}
        ></canvas>

        {/* Saved Daily Logs - Glassmorphic Pill Chips with SVG Delete Button */}
        {dailyStats && dailyStats.length > 0 && (
          <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700 }}>
              {lang === "tr" ? "Kaydedilen Günlük Veriler:" : "Saved Daily Logs:"}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {dailyStats.map((stat) => (
                <div
                  key={stat.date}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1px solid rgba(139, 92, 246, 0.25)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "#a855f7", fontWeight: 700 }}>{stat.date}</span>
                  <span style={{ color: "#cbd5e1" }}>
                    {stat.questions > 0 && `${stat.questions} Soru `}
                    {stat.videos ? `${stat.videos} Video` : ""}
                  </span>
                  {onDeleteStat && (
                    <button
                      type="button"
                      onClick={() => onDeleteStat(stat.date)}
                      title={lang === "tr" ? "Bu günü sil" : "Delete day"}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "none",
                        color: "#ef4444",
                        borderRadius: "4px",
                        width: "18px",
                        height: "18px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                        marginLeft: "2px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
