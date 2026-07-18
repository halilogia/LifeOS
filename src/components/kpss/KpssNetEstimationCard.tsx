import { Language } from "@/types/types.js";

interface KpssNetEstimationCardProps {
  lang: Language;
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  overallNet: number;
  maxNet: number;
  estimatedScore: number;
  onGoalTypeChange: (type: "net" | "score") => void;
  onTargetNetChange: (val: number) => void;
  onTargetScoreChange: (val: number) => void;
  getSubjectNets: (subKey: string) => { net: number; max: number };
  labels: Record<string, string>;
  subjectsList: string[];
}

export function KpssNetEstimationCard({
  lang,
  goalType,
  targetNet,
  targetScore,
  overallNet,
  maxNet,
  estimatedScore,
  onGoalTypeChange,
  onTargetNetChange,
  onTargetScoreChange,
  getSubjectNets,
  labels,
  subjectsList,
}: KpssNetEstimationCardProps) {
  const isNetMode = goalType === "net";
  const activeTarget = isNetMode ? targetNet : targetScore;
  const currentValue = isNetMode ? overallNet : estimatedScore;
  const percentage = Math.min(100, Math.round((currentValue / activeTarget) * 100));
  const isTargetAchieved = currentValue >= activeTarget;

  const handleDecrease = () => {
    if (isNetMode) {
      onTargetNetChange(Math.max(10, targetNet - 1));
    } else {
      onTargetScoreChange(Math.max(40, targetScore - 1));
    }
  };

  const handleIncrease = () => {
    if (isNetMode) {
      onTargetNetChange(Math.min(120, targetNet + 1));
    } else {
      onTargetScoreChange(Math.min(100, targetScore + 1));
    }
  };

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

      {/* Target Tracker Section */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "14px 18px", alignItems: "center" }}>
        
        {/* Toggle + Target Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              {lang === "tr" ? "Hedef:" : "Target:"}
            </span>
            
            {/* Goal Type Pill Selector */}
            <div style={{ display: "flex", gap: "2px", background: "rgba(255, 255, 255, 0.05)", padding: "2px", borderRadius: "6px", border: "1px solid var(--card-border)" }}>
              <button
                type="button"
                onClick={() => onGoalTypeChange("net")}
                style={{
                  background: isNetMode ? "var(--accent-color)" : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
              >
                {lang === "tr" ? "Net" : "Net"}
              </button>
              <button
                type="button"
                onClick={() => onGoalTypeChange("score")}
                style={{
                  background: !isNetMode ? "var(--accent-color)" : "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.65rem",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
              >
                {lang === "tr" ? "Puan" : "Score"}
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", borderRadius: "8px", overflow: "hidden", height: "30px" }}>
              <button
                type="button"
                onClick={handleDecrease}
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
                value={activeTarget}
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
                onClick={handleIncrease}
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
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {isNetMode ? (lang === "tr" ? "Net" : "Nets") : (lang === "tr" ? "Puan" : "Points")}
            </span>
          </div>
        </div>

        {/* Current State Indicator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "12px" }}>
          {isNetMode ? (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                📈 {lang === "tr" ? "Tahmini P3 Puanı:" : "Estimated P3 Score:"}
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", color: isTargetAchieved ? "#10b981" : "white" }}>
                {estimatedScore} Puan {isTargetAchieved && "👑"}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                📊 {lang === "tr" ? "Mevcut Toplam Net:" : "Current Total Net:"}
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", color: isTargetAchieved ? "#10b981" : "white" }}>
                {overallNet} Net {isTargetAchieved && "👑"}
              </span>
            </>
          )}
        </div>

        {/* Target Progress Bar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", minWidth: "200px", marginLeft: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600" }}>
            <span style={{ color: "var(--text-secondary)" }}>{lang === "tr" ? "Hedef İlerleme" : "Target Progress"}</span>
            <span style={{ color: isTargetAchieved ? "#10b981" : "var(--accent-color)" }}>%{percentage}</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${percentage}%`, background: isTargetAchieved ? "linear-gradient(90deg, #10b981, #34d399)" : "var(--accent-color)", borderRadius: "4px" }}></div>
          </div>
          {isTargetAchieved && (
            <span style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: "700", textAlign: "right" }}>
              🎉 {lang === "tr" ? "Tebrikler! Hedefinize ulaştınız." : "Congrats! You achieved your target."}
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
