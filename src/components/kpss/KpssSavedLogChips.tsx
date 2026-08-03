import type { KpssDailyStats } from "@/types/types.js";

interface KpssSavedLogChipsProps {
  t: Record<string, string>;
  dailyStats: KpssDailyStats[];
  onDeleteStat?: (date: string) => void;
}

export function KpssSavedLogChips({
  t,
  dailyStats,
  onDeleteStat,
}: KpssSavedLogChipsProps) {
  return (
    <div
      style={{
        marginTop: "6px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700 }}>
        {t.kpss_saved_logs}
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
            <span style={{ color: "#a855f7", fontWeight: 700 }}>
              {stat.date}
            </span>
            <span style={{ color: "#cbd5e1" }}>
              {stat.questions > 0 && `${stat.questions} ${t.kpss_filter_questions} `}
              {stat.videos ? `${stat.videos} ${t.kpss_filter_videos}` : ""}
            </span>
            {onDeleteStat && (
              <button
                type="button"
                onClick={() => onDeleteStat(stat.date)}
                title={t.kpss_delete_day}
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
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
