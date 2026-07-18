import { Language } from "@/types/types.js";

interface KpssDailyStatsCardProps {
  lang: Language;
  questionsInput: string;
  videosInput: string;
  subjectInput: string;
  chartDays: 7 | 30;
  canvasRef: any;
  onQuestionsInputChange: (val: string) => void;
  onVideosInputChange: (val: string) => void;
  onSubjectInputChange: (val: string) => void;
  onSaveStats: () => void;
  onResetStats: () => void;
  onChartDaysChange: (val: 7 | 30) => void;
  labels: Record<string, string>;
  subjectsList: string[];
}

export function KpssDailyStatsCard({
  lang,
  questionsInput,
  videosInput,
  subjectInput,
  chartDays,
  canvasRef,
  onQuestionsInputChange,
  onVideosInputChange,
  onSubjectInputChange,
  onSaveStats,
  onResetStats,
  onChartDaysChange,
  labels,
  subjectsList,
}: KpssDailyStatsCardProps) {
  return (
    <div className="kpss-daily-stats-section" style={{ marginTop: "28px" }}>
      <div className="kpss-daily-input">
        <h3>{labels.stats_title}</h3>
        <div className="kpss-stats-inputs">
          <div className="kpss-input-group">
            <label for="kpss-questions-input">{labels.stat_questions}</label>
            <input
              type="number"
              id="kpss-questions-input"
              value={questionsInput}
              onInput={(e) => onQuestionsInputChange((e.target as HTMLInputElement).value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="kpss-input-group">
            <label for="kpss-videos-input">{lang === "tr" ? "İzlenen Video" : "Videos Watched"}</label>
            <input
              type="number"
              id="kpss-videos-input"
              value={videosInput}
              onInput={(e) => onVideosInputChange((e.target as HTMLInputElement).value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="kpss-input-group">
            <label for="kpss-subject-select">{labels.stat_subject}</label>
            <select
              id="kpss-subject-select"
              value={subjectInput}
              onChange={(e) => onSubjectInputChange((e.target as HTMLSelectElement).value)}
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
            <button id="kpss-reset-stats-btn" className="secondary" onClick={onResetStats}>
              {labels.reset}
            </button>
          </div>
        </div>
      </div>

      <div className="kpss-chart-container" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            📊 {lang === "tr" ? "İlerleme Grafiği" : "Progress Chart"}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => onChartDaysChange(7)}
              style={{
                background: chartDays === 7 ? "var(--accent-color)" : "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
            >
              {lang === "tr" ? "7 Gün" : "7 Days"}
            </button>
            <button
              onClick={() => onChartDaysChange(30)}
              style={{
                background: chartDays === 30 ? "var(--accent-color)" : "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "white",
                fontSize: "0.65rem",
                padding: "2px 8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
            >
              {lang === "tr" ? "30 Gün" : "30 Days"}
            </button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          id="kpss-history-chart"
          style={{ display: "block", width: "100%", height: "200px" }}
        ></canvas>
      </div>
    </div>
  );
}
