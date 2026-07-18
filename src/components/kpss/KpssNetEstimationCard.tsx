import { Language } from "@/types/types.js";

interface KpssNetEstimationCardProps {
  lang: Language;
  targetScore: number;
  overallNet: number;
  maxNet: number;
  estimatedScore: number;
  scorePercentage: number;
  isTargetAchieved: boolean;
  onTargetScoreChange: (val: number) => void;
  getSubjectNets: (subKey: string) => { net: number; max: number };
  labels: Record<string, string>;
  subjectsList: string[];
}

export function KpssNetEstimationCard({
  lang,
  targetScore,
  overallNet,
  maxNet,
  estimatedScore,
  scorePercentage,
  isTargetAchieved,
  onTargetScoreChange,
  getSubjectNets,
  labels,
  subjectsList,
}: KpssNetEstimationCardProps) {
  return (
    <div className="mini-tool-card" style={{ marginTop: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ color: "var(--accent-color)" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>
            {lang === "tr" ? "KPSS Lisans Tahmini Net Skoru" : "KPSS Estimated Net Score"}
          </span>
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--accent-color)" }}>
          {overallNet} / {maxNet} Net
        </div>
      </div>

      {/* Puan Hedefi Takibi */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "14px 18px", alignItems: "center" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            {lang === "tr" ? "Puan Hedefi:" : "Score Target:"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", height: "30px" }}>
              <button
                type="button"
                onClick={() => onTargetScoreChange(targetScore - 1)}
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
                  userSelect: "none"
                }}
              >
                -
              </button>
              <input
                type="number"
                min="50"
                max="100"
                value={targetScore}
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
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => onTargetScoreChange(targetScore + 1)}
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
                  userSelect: "none"
                }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{lang === "tr" ? "Puan" : "Points"}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
            📈 {lang === "tr" ? "Tahmini P3 Puanı:" : "Estimated P3 Score:"}
          </span>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", color: isTargetAchieved ? "#10b981" : "white" }}>
            {estimatedScore} Puan {isTargetAchieved && "👑"}
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: "200px", marginLeft: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600" }}>
            <span style={{ color: "var(--text-secondary)" }}>{lang === "tr" ? "Hedef İlerleme" : "Target Progress"}</span>
            <span style={{ color: isTargetAchieved ? "#10b981" : "var(--accent-color)" }}>%{scorePercentage}</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scorePercentage}%`, background: isTargetAchieved ? "linear-gradient(90deg, #10b981, #34d399)" : "var(--accent-color)", borderRadius: "4px" }}></div>
          </div>
          {isTargetAchieved && (
            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: "700", textAlign: "right" }}>
              🎉 {lang === "tr" ? "Tebrikler! Puan hedefinize ulaştınız." : "Congrats! You achieved your target."}
            </span>
          )}
        </div>

      </div>

      {/* Subject level breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginTop: "8px" }}>
        {subjectsList.map((subKey) => {
          const { net, max } = getSubjectNets(subKey);
          const percentage = max > 0 ? Math.round((net / max) * 100) : 0;
          return (
            <div key={subKey} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                {labels[subKey] || subKey}
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>{net} <span style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-secondary)" }}>/ {max}</span></span>
                <span style={{ fontSize: "0.7rem", color: "var(--accent-color)", fontWeight: "700" }}>%{percentage}</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percentage}%`, background: "var(--accent-color)", borderRadius: "2px" }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
