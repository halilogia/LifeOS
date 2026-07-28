import { useRef, useEffect } from "preact/hooks";
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

  useEffect(() => {
    if (canvasRef.current) {
      drawKpssStatsChart(canvasRef.current, {
        lang,
        dailyStats,
        chartDays,
        chartType,
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
        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
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
          <div style={{ display: "flex", gap: "6px" }}>
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

        {/* History Log List with Delete Option */}
        {dailyStats && dailyStats.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "600" }}>
              {lang === "tr" ? "Kaydedilen Günlük Veriler:" : "Saved Daily Records:"}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "100px", overflowY: "auto" }}>
              {dailyStats.map((st) => (
                <div
                  key={st.date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "0.7rem",
                    color: "#f1f5f9",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--accent-color)" }}>{st.date}</span>
                  <span>{st.questions} Soru</span>
                  {st.videos ? <span>• {st.videos} Video</span> : null}
                  {onDeleteStat && (
                    <button
                      onClick={() => onDeleteStat(st.date)}
                      title={lang === "tr" ? "Bu Günü Sil" : "Delete Record"}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "0 2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
