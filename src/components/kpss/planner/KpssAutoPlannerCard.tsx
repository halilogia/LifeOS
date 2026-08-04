import { useState } from "preact/hooks";
import { KpssProgress } from "@/types/types.js";
import { kpssData } from "@/services/kpss/kpssService.js";
import { KpssPlannerHeader } from "./KpssPlannerHeader.js";
import { KpssTodayTopicsList } from "./KpssTodayTopicsList.js";
import { KpssPlannerInfoModal } from "./KpssPlannerInfoModal.js";

interface KpssAutoPlannerCardProps {
  t: Record<string, string>;
  kpssProgress: KpssProgress[];
  onStartQuiz: (subject: string, topicTitle: string) => void;
  labels: Record<string, string>;
}

export function KpssAutoPlannerCard({
  t,
  kpssProgress,
  onStartQuiz,
  labels,
}: KpssAutoPlannerCardProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 1. Calculate remaining days until exam (September 6, 2026 10:15)
  const examDate = new Date("2026-09-06T10:15:00").getTime();
  const diffTime = examDate - Date.now();
  const daysRemaining = Math.max(
    1,
    Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
  );

  // 2. Map all uncompleted topics across all subjects in standard order
  const subjectsOrder = [
    "turkce",
    "matematik",
    "geometri",
    "tarih",
    "cografya",
    "vatandaslik",
  ];
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
      const prog = kpssProgress.find(
        (p) => p.subject === subKey && p.topic === t.title,
      );
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

  // 3. Select today's topics: distributed to the first day segment (dayIndex === 0)
  const todaysTopics = flatUncompleted.filter(
    (_, idx) => Math.floor((idx / totalUncompleted) * daysRemaining) === 0,
  );

  const getWorkloadWarning = () => {
    if (workloadRate > 3.0) {
      return {
        text: t.kpss_pace_heavy,
        color: "#ef4444",
      };
    }
    if (workloadRate > 1.5) {
      return {
        text: t.kpss_pace_moderate,
        color: "var(--accent-color)",
      };
    }
    return {
      text: t.kpss_pace_optimal,
      color: "#10b981",
    };
  };

  const warning = getWorkloadWarning();

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
      <KpssPlannerHeader t={t} onShowInfo={() => setShowInfoModal(true)} />

      {totalUncompleted === 0 ? (
        <div
          style={{
            padding: "12px",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "10px",
            textAlign: "center",
            color: "#10b981",
            fontWeight: "600",
            fontSize: "0.85rem",
          }}
        >
          {t.kpss_planner_all_done}
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {t.kpss_planner_desc}
          </p>

          <KpssTodayTopicsList
            t={t}
            todaysTopics={todaysTopics}
            kpssProgress={kpssProgress}
            onStartQuiz={onStartQuiz}
          />

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
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <span>
                <strong>{t.kpss_days_left}</strong> {daysRemaining}
              </span>
              <span>
                <strong>{t.kpss_topics_left}</strong> {totalUncompleted}
              </span>
              <span>
                <strong>{t.kpss_daily_rate}</strong> {workloadRate.toFixed(1)}
                /gün
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
                fontWeight: "700",
              }}
            >
              {warning.text}
            </span>
          </div>
        </>
      )}

      {/* Info Explanation Modal */}
      {showInfoModal && (
        <KpssPlannerInfoModal t={t} onClose={() => setShowInfoModal(false)} />
      )}
    </div>
  );
}
