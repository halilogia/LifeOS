import { Language } from "@/types/types.js";

interface KpssNetEstimationCardProps {
  lang: Language;
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  overallNet: number;
  maxNet: number;
  estimatedScore: number;
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
  getSubjectNets,
  labels,
  subjectsList,
}: KpssNetEstimationCardProps) {
  const isNetMode = goalType === "net";
  const activeTarget = isNetMode ? targetNet : targetScore;
  const currentValue = isNetMode ? overallNet : estimatedScore;
  const percentage = Math.min(100, Math.round((currentValue / activeTarget) * 100));
  const isTargetAchieved = currentValue >= activeTarget;

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
        
        {/* Active Target Score / Net Display */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            {isNetMode ? (lang === "tr" ? "Net Hedefi:" : "Net Target:") : (lang === "tr" ? "Puan Hedefi:" : "Score Target:")}
          </span>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", color: "white" }}>
            {activeTarget} {isNetMode ? (lang === "tr" ? "Net" : "Nets") : (lang === "tr" ? "Puan" : "Points")}
          </span>
        </div>

        {/* Current State Indicator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "24px" }}>
          {isNetMode ? (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                {lang === "tr" ? "Mevcut Toplam Net:" : "Current Total Net:"}
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", color: isTargetAchieved ? "#10b981" : "white" }}>
                {overallNet} Net {isTargetAchieved && "👑"}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                {lang === "tr" ? "Tahmini P3 Puanı:" : "Estimated P3 Score:"}
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", color: isTargetAchieved ? "#10b981" : "white" }}>
                {estimatedScore} Puan {isTargetAchieved && "👑"}
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
