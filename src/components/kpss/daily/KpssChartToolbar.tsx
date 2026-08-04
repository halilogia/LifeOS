interface KpssChartToolbarProps {
  t: Record<string, string>;
  chartMetric: "all" | "questions" | "videos";
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  onMetricChange: (mode: "all" | "questions" | "videos") => void;
  onDaysChange: (val: 7 | 30) => void;
  onTypeChange: (val: "line" | "bar") => void;
}

export function KpssChartToolbar({
  t,
  chartMetric,
  chartDays,
  chartType,
  onMetricChange,
  onDaysChange,
  onTypeChange,
}: KpssChartToolbarProps) {
  return (
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
        {t.kpss_progress_chart}
      </span>

      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Metric Mode Filter Pills */}
        <div
          style={{
            display: "flex",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "2px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => onMetricChange("all")}
            style={{
              background:
                chartMetric === "all"
                  ? "var(--accent-color, #2563eb)"
                  : "transparent",
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
            {t.kpss_filter_all}
          </button>
          <button
            type="button"
            onClick={() => onMetricChange("questions")}
            style={{
              background:
                chartMetric === "questions" ? "#10b981" : "transparent",
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
            {t.kpss_filter_questions}
          </button>
          <button
            type="button"
            onClick={() => onMetricChange("videos")}
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
            {t.kpss_filter_videos}
          </button>
        </div>

        {/* Range & View Type Buttons */}
        <button
          onClick={() => onDaysChange(7)}
          style={{
            background: chartDays === 7 ? "var(--accent-color)" : "transparent",
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
          onClick={() => onDaysChange(30)}
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
          onClick={() => onTypeChange("line")}
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
          {t.kpss_chart_line}
        </button>
        <button
          onClick={() => onTypeChange("bar")}
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
          {t.kpss_chart_bar}
        </button>
      </div>
    </div>
  );
}
