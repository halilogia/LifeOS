import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { DetoxMotivationCard } from "@/components/detox/DetoxMotivationCard.js";

interface DetoxUsageCardProps {
  lang: Language;
  totalScreenTimeSeconds: number;
  visibleScreenTimeSites: [string, number][];
  sortedScreenTimeSites: [string, number][];
  showAllStats: boolean;
  formatDurationText: (secs: number) => string;
  onToggleShowAllStats: () => void;
}

export function DetoxUsageCard({
  lang,
  totalScreenTimeSeconds,
  visibleScreenTimeSites,
  sortedScreenTimeSites,
  showAllStats,
  formatDurationText,
  onToggleShowAllStats,
}: DetoxUsageCardProps) {
  const t = translations[lang];

  return (
    <div className="detox-card" style={{ padding: "2rem" }}>
      <div
        className="detox-status-header"
        style={{ borderBottom: "none", paddingBottom: 0 }}
      >
        <div className="detox-title-group">
          <h2>{t.detox_usage_today}</h2>
          <p>{t.detox_usage_desc}</p>
        </div>
        <div
          className="detox-status-badge active"
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            borderColor: "rgba(139, 92, 246, 0.2)",
            color: "var(--accent-color)",
          }}
        >
          <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>
            {formatDurationText(totalScreenTimeSeconds)}
          </span>
        </div>
      </div>

      {sortedScreenTimeSites.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            fontStyle: "italic",
          }}
        >
          {t.detox_no_activity}
        </div>
      ) : (
        <div
          className="screen-time-stats-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginTop: "1rem",
          }}
        >
          {visibleScreenTimeSites.map(([domain, secs]) => {
            const percentage =
              totalScreenTimeSeconds > 0
                ? Math.round((secs / totalScreenTimeSeconds) * 100)
                : 0;
            return (
              <div
                key={domain}
                className="screen-time-item"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {domain}
                  </span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: "500",
                    }}
                  >
                    {formatDurationText(secs)}{" "}
                    <span
                      style={{
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        marginLeft: "6px",
                      }}
                    >
                      ({percentage}%)
                    </span>
                  </span>
                </div>
                {/* Glassmorphic progress bar */}
                <div
                  className="screen-time-bar-track"
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="screen-time-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, var(--accent-color) 0%, #a78bfa 100%)",
                      borderRadius: "10px",
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  ></div>
                </div>
              </div>
            );
          })}

          {sortedScreenTimeSites.length > 5 && (
            <button
              className="text-btn"
              onClick={onToggleShowAllStats}
              style={{
                alignSelf: "center",
                marginTop: "10px",
                fontSize: "0.8rem",
                color: "var(--accent-color)",
                fontWeight: "600",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {showAllStats
                ? t.detox_show_less
                : t.detox_show_all.replace(
                    "{count}",
                    String(sortedScreenTimeSites.length),
                  )}
            </button>
          )}
        </div>
      )}

      {/* Motivational Achievements Section under Screen Time */}
      {totalScreenTimeSeconds > 60 && (
        <div style={{ marginTop: "1.5rem" }}>
          <DetoxMotivationCard
            durationMinutes={Math.round(totalScreenTimeSeconds / 60)}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}
