import type { KpssProgress } from "@/types/types.js";

interface PlannerTopicItem {
  subjectKey: string;
  subjectLabel: string;
  topicTitle: string;
  description: string;
  questionsCount: number;
}

interface KpssTodayTopicsListProps {
  t: Record<string, string>;
  todaysTopics: PlannerTopicItem[];
  kpssProgress: KpssProgress[];
  onStartQuiz: (subject: string, topicTitle: string) => void;
}

export function KpssTodayTopicsList({
  t,
  todaysTopics,
  kpssProgress,
  onStartQuiz,
}: KpssTodayTopicsListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {todaysTopics.map((item, idx) => {
        const prog = kpssProgress.find(
          (p) => p.subject === item.subjectKey && p.topic === item.topicTitle,
        );
        const status = prog ? prog.status : 0;
        return (
          <div
            key={idx}
            onClick={() => onStartQuiz(item.subjectKey, item.topicTitle)}
            className="kpss-topic-recommendation-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  padding: "2px 6px",
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  color: "var(--accent-color)",
                  borderRadius: "4px",
                  fontWeight: "700",
                }}
              >
                {item.subjectLabel}
              </span>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  color: "white",
                }}
              >
                {item.topicTitle}
              </span>
            </div>
            <div>
              {status === 1 ? (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#ffc107",
                    background: "rgba(255, 193, 7, 0.1)",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  {t.kpss_status_working}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(255,255,255,0.4)",
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  {t.kpss_status_not_started}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
