import { Language, KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpssService.js";

interface KpssAutoPlannerCardProps {
  lang: Language;
  kpssProgress: KpssProgress[];
  onToggleTopic: (subject: string, topicTitle: string) => void;
  labels: Record<string, string>;
}

export function KpssAutoPlannerCard({
  lang,
  kpssProgress,
  onToggleTopic,
  labels,
}: KpssAutoPlannerCardProps) {
  // 1. Calculate remaining days until exam (September 6, 2026 10:15)
  const examDate = new Date("2026-09-06T10:15:00").getTime();
  const diffTime = examDate - Date.now();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // 2. Map all uncompleted topics across all subjects in standard order
  const subjectsOrder = ["turkce", "matematik", "geometri", "tarih", "cografya", "vatandaslik"];
  const flatUncompleted: Array<{
    subjectKey: string;
    subjectLabel: string;
    topicTitle: string;
    description: string;
    questionsCount: number;
  }> = [];

  subjectsOrder.forEach((subKey) => {
    const list = kpssData[subKey] || [];
    const subLabel = labels[subKey] || subKey;
    list.forEach((t) => {
      // Find if this topic is completed (status === 2)
      const prog = kpssProgress.find((p) => p.subject === subKey && p.topic === t.title);
      const isCompleted = prog ? prog.status === 2 : false;
      if (!isCompleted) {
        flatUncompleted.push({
          subjectKey: subKey,
          subjectLabel: subLabel,
          topicTitle: t.title,
          description: t.description,
          questionsCount: t.questionsCount,
        });
      }
    });
  });

  const totalUncompleted = flatUncompleted.length;
  const workloadRate = totalUncompleted / daysRemaining;

  // 3. Select today's topics: those distributed to the first day segment (dayIndex === 0)
  const todaysTopics = flatUncompleted.filter(
    (_, idx) => Math.floor((idx / totalUncompleted) * daysRemaining) === 0
  );

  const getWorkloadWarning = () => {
    if (workloadRate > 3.0) {
      return {
        text: lang === "tr" ? "Yoğun Çalışma Gerekli (Hızlanmalısınız)" : "Heavy Study Required (Speed up)",
        color: "#ef4444",
      };
    }
    if (workloadRate > 1.5) {
      return {
        text: lang === "tr" ? "Orta Düzey Çalışma Hızı" : "Moderate Study Pace",
        color: "var(--accent-color)",
      };
    }
    return {
      text: lang === "tr" ? "İdeal Çalışma Hızı" : "Optimal Study Pace",
      color: "#10b981",
    };
  };

  const warning = getWorkloadWarning();

  return (
    <div className="mini-tool-card" style={{ marginTop: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ color: "var(--accent-color)" }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span style={{ fontSize: "0.95rem", fontWeight: "700" }}>
          {lang === "tr" ? "KPSS Günlük Konu Planlayıcı" : "KPSS Daily Auto-Planner"}
        </span>
      </div>

      {totalUncompleted === 0 ? (
        <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "10px", textAlign: "center", color: "#10b981", fontWeight: "600", fontSize: "0.85rem" }}>
          🎉 {lang === "tr" ? "Tebrikler! Tüm KPSS konularını başarıyla tamamladınız." : "Congrats! You successfully completed all KPSS topics."}
        </div>
      ) : (
        <>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            {lang === "tr"
              ? "Sınava kalan süreye ve konu yükünüze göre bugün tamamlamanız önerilen konular:"
              : "Recommended topics to review today based on remaining time and topic density:"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {todaysTopics.map((item, idx) => {
              const prog = kpssProgress.find((p) => p.subject === item.subjectKey && p.topic === item.topicTitle);
              const status = prog ? prog.status : 0;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "10px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        background: "rgba(139, 92, 246, 0.15)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "var(--accent-color)",
                        borderRadius: "4px",
                        fontWeight: "700"
                      }}
                    >
                      {item.subjectLabel}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "white" }}>
                      {item.topicTitle}
                    </span>
                  </div>
                  <div
                    onClick={() => onToggleTopic(item.subjectKey, item.topicTitle)}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "6px",
                      border: `2px solid ${status === 2 ? "var(--accent-color)" : "rgba(255, 255, 255, 0.2)"}`,
                      background: status === 2 ? "var(--accent-color)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0
                    }}
                  >
                    {status === 2 && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Planner Stats Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.01)",
              border: "1px solid var(--card-border)",
              padding: "10px 14px",
              borderRadius: "10px",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", gap: "12px", color: "var(--text-secondary)" }}>
              <span>
                <strong>{lang === "tr" ? "Kalan Gün:" : "Days Left:"}</strong> {daysRemaining}
              </span>
              <span>
                <strong>{lang === "tr" ? "Kalan Konu:" : "Topics Left:"}</strong> {totalUncompleted}
              </span>
              <span>
                <strong>{lang === "tr" ? "Günlük Hız:" : "Daily Rate:"}</strong> {workloadRate.toFixed(1)}/gün
              </span>
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                padding: "2px 8px",
                background: `${warning.color}15`,
                border: `1px solid ${warning.color}30`,
                color: warning.color,
                borderRadius: "50px",
                fontWeight: "700"
              }}
            >
              {warning.text}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
