interface KpssNetEstimationCardProps {
  t: Record<string, string>;
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  overallNet: number;
  maxNet: number;
  estimatedScore: number;
  getSubjectNets: (subKey: string) => { net: number; max: number };
  labels: Record<string, string>;
  subjectsList: string[];
  selectedSubject?: string;
  onSelectSubject?: (subKey: string) => void;
}

export function KpssNetEstimationCard({
  t,
  goalType,
  targetNet,
  targetScore,
  overallNet,
  maxNet,
  estimatedScore,
  getSubjectNets,
  labels,
  subjectsList,
  selectedSubject,
  onSelectSubject,
}: KpssNetEstimationCardProps) {
  const isNetMode = goalType === "net";
  const activeTarget = isNetMode ? targetNet : targetScore;
  const currentValue = isNetMode ? overallNet : estimatedScore;
  const percentage = Math.min(
    100,
    Math.round((currentValue / activeTarget) * 100),
  );
  const isTargetAchieved = currentValue >= activeTarget;

  return (
    <div
      className="mini-tool-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style={{ color: "var(--accent-color)" }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>
            {t.kpss_estimated_score_title}
          </span>
        </div>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            color: "var(--accent-color)",
          }}
        >
          {overallNet} / {maxNet} Net
        </div>
      </div>

      {/* Target Tracker Section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "14px 18px",
          alignItems: "center",
        }}
      >
        {/* Active Target Score / Net Display */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            {isNetMode ? t.kpss_net_target : t.kpss_score_target}
          </span>
          <span
            style={{ fontSize: "1.4rem", fontWeight: "800", color: "white" }}
          >
            {activeTarget} {isNetMode ? t.kpss_net_label : t.kpss_score_label}
          </span>
        </div>

        {/* Current State Indicator */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginLeft: "24px",
          }}
        >
          {isNetMode ? (
            <>
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
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                {t.kpss_current_total_net}
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: isTargetAchieved ? "#10b981" : "white",
                }}
              >
                {overallNet} Net {isTargetAchieved && "👑"}
              </span>
            </>
          ) : (
            <>
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
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                {t.kpss_estimated_score_label}
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  color: isTargetAchieved ? "#10b981" : "white",
                }}
              >
                ~{estimatedScore} Puan {isTargetAchieved && "👑"}
              </span>
            </>
          )}
        </div>

        {/* Progress Bar Container */}
        <div
          style={{
            flex: "1",
            minWidth: "220px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginLeft: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              fontWeight: "700",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              {t.kpss_goal_progress}
            </span>
            <span
              style={{
                color: isTargetAchieved ? "#10b981" : "var(--accent-color)",
              }}
            >
              %{percentage}
            </span>
          </div>
          <div
            style={{
              height: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentage}%`,
                background: isTargetAchieved
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "var(--accent-color)",
                borderRadius: "4px",
              }}
            ></div>
          </div>
          {isTargetAchieved && (
            <span
              style={{
                fontSize: "0.65rem",
                color: "#10b981",
                fontWeight: "700",
                textAlign: "right",
              }}
            >
              🎉 {t.kpss_goal_achieved}
            </span>
          )}
        </div>
      </div>

      {/* Subject level breakdown (Clickable Subject Cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
          marginTop: "8px",
        }}
      >
        {subjectsList.map((subKey) => {
          const { net, max } = getSubjectNets(subKey);
          const percent = max > 0 ? Math.round((net / max) * 100) : 0;
          const isSelected = selectedSubject === subKey;

          return (
            <div
              key={subKey}
              onClick={() => onSelectSubject?.(subKey)}
              title={`${t.kpss_show_topics.replace("{subject}", labels[subKey] || subKey)}`}
              style={{
                background: isSelected
                  ? "rgba(124, 58, 237, 0.14)"
                  : "rgba(255, 255, 255, 0.02)",
                border: isSelected
                  ? "1.5px solid var(--accent-color)"
                  : "1px solid var(--card-border)",
                boxShadow: isSelected
                  ? "0 0 14px rgba(124, 58, 237, 0.3)"
                  : "none",
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: isSelected ? "white" : "var(--text-secondary)",
                  fontWeight: isSelected ? "700" : "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{labels[subKey] || subKey}</span>
                {isSelected && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--accent-color)",
                      fontWeight: "800",
                    }}
                  >
                    ✓ {t.kpss_selected}
                  </span>
                )}
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  {net}{" "}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                    }}
                  >
                    / {max}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--accent-color)",
                    fontWeight: "700",
                  }}
                >
                  %{percent}
                </span>
              </div>
              <div
                style={{
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background: "var(--accent-color)",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
