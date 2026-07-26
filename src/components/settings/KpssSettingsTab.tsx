import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface KpssSettingsTabProps {
  lang: Language;
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onKpssGoalTypeChange: (type: "net" | "score") => void;
  onKpssTargetNetChange: (val: number) => void;
  onKpssTargetScoreChange: (val: number) => void;
}

export function KpssSettingsTab({
  lang,
  kpssGoalType,
  kpssTargetNet,
  kpssTargetScore,
  onKpssGoalTypeChange,
  onKpssTargetNetChange,
  onKpssTargetScoreChange,
}: KpssSettingsTabProps) {
  const t = getTranslation(lang);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="settings-group">
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            opacity: 0.8,
          }}
        >
          {t.settings_kpss_title}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "16px 14px",
          }}
        >
          {/* Goal Type Pill Selector */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}
            >
              {t.settings_kpss_goal_type}
            </span>
            <div
              style={{
                display: "flex",
                gap: "2px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "2px",
                borderRadius: "6px",
                border: "1px solid var(--card-border)",
              }}
            >
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("net")}
                style={{
                  background:
                    kpssGoalType === "net"
                      ? "var(--accent-color)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
              >
                {t.settings_kpss_target_net_short}
              </button>
              <button
                type="button"
                onClick={() => onKpssGoalTypeChange("score")}
                style={{
                  background:
                    kpssGoalType === "score"
                      ? "var(--accent-color)"
                      : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
              >
                {t.settings_kpss_target_score_short}
              </button>
            </div>
          </div>

          {/* Target Tuning Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "0.85rem", color: "white", fontWeight: "600" }}
            >
              {kpssGoalType === "net"
                ? t.settings_kpss_target_net
                : t.settings_kpss_target_score}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                overflow: "hidden",
                height: "30px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.max(10, kpssTargetNet - 1));
                  } else {
                    onKpssTargetScoreChange(Math.max(40, kpssTargetScore - 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                -
              </button>
              <input
                type="number"
                value={kpssGoalType === "net" ? kpssTargetNet : kpssTargetScore}
                readOnly
                style={{
                  width: "30px",
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "0.95rem",
                  padding: 0,
                  fontWeight: "700",
                  textAlign: "center",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (kpssGoalType === "net") {
                    onKpssTargetNetChange(Math.min(120, kpssTargetNet + 1));
                  } else {
                    onKpssTargetScoreChange(Math.min(100, kpssTargetScore + 1));
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  padding: "0 10px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  userSelect: "none",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Premium Info Explanation Note */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "10px 12px",
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
              borderRadius: "8px",
              fontSize: "0.78rem",
              lineHeight: 1.4,
              color: "var(--text-secondary)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-color)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style={{ flexShrink: 0, marginTop: "1px" }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>
              {lang === "tr"
                ? "KPSS GK-GY puan türlerinde 80 Puan alabilmek için ortalama sınav zorluğuna göre 70-75 Net yapılması yeterli olabilmektedir. Net ve Puan birebir eşit değildir, standart sapma formüllere dahildir."
                : "To score 80 Points in KPSS GK-GY, achieving around 70-75 Nets can be sufficient depending on average difficulty. Score and Net are not 1-to-1 equal due to standard deviation."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
