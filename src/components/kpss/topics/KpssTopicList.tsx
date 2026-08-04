import { Language, KpssProgress } from "@/types/types.js";
import { KpssTopic } from "@/services/kpss/kpssService.js";

interface KpssTopicListProps {
  lang: Language;
  t: Record<string, string>;
  topics: KpssTopic[];
  kpssProgress: KpssProgress[];
  currentSubject: string;
  sortBy: "default" | "questions" | "status";
  onSortByChange: (val: "default" | "questions" | "status") => void;
  onStartQuiz: (topic: string) => void;
  onShowDetail: (topic: {
    title: string;
    description: string;
    questionsCount?: number;
  }) => void;
  onOpenYoutube: (topic: string) => void;
  onReviewPastQuiz?: (topic: string) => void;
}

export function KpssTopicList({
  lang,
  t,
  topics,
  kpssProgress,
  currentSubject,
  sortBy,
  onSortByChange,
  onStartQuiz,
  onShowDetail,
  onOpenYoutube,
  onReviewPastQuiz,
}: KpssTopicListProps) {
  return (
    <div className="kpss-content">
      {/* Sort Options Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          background: "rgba(255,255,255,0.01)",
          border: "1px solid var(--card-border)",
          borderRadius: "10px",
          padding: "8px 12px",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
          }}
        >
          {t.kpss_topic_syllabus}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4"></path>
              <path d="M4 10h2"></path>
              <path d="M6 6H4"></path>
            </svg>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                fontWeight: "600",
              }}
            >
              {t.kpss_sort_by}
            </span>
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                (e.target as HTMLSelectElement).value as
                  "default" | "questions" | "status",
              )
            }
            style={{
              background: "#161622",
              border: "1px solid var(--card-border)",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.75rem",
              padding: "2px 8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="default">{t.kpss_sort_syllabus}</option>
            <option value="questions">{t.kpss_topic_frequency}</option>
            <option value="status">{t.kpss_sort_completion}</option>
          </select>
        </div>
      </div>

      <div id="kpss-topic-list" className="kpss-topic-list">
        {topics.map((topic) => {
          const progress = kpssProgress.find(
            (p) => p.subject === currentSubject && p.topic === topic.title,
          );
          const status = progress ? progress.status : 0;
          return (
            <div
              key={topic.title}
              className="kpss-topic-item"
              data-status={status.toString()}
            >
              <div className="kpss-status-indicator">
                {status === 1 && (
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="white"
                    style={{ opacity: 1, transform: "scale(1)" }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                )}
                {status === 2 && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style={{ opacity: 1, transform: "scale(1)" }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span
                className="kpss-topic-name"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>{topic.title}</span>
              </span>

              {/* Seviye Tespit Sınavı button */}
              <button
                className="kpss-exam-btn"
                title={t.kpss_topic_proficiency_test}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartQuiz(topic.title);
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </button>

              {/* Geçmiş Soru İnceleme butonu — daha önce soru çözülmüşse */}
              {(progress?.totalQuestions ?? 0) > 0 && onReviewPastQuiz && (
                <button
                  className="kpss-info-btn"
                  title="Çözülmüş Soruları İncele"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewPastQuiz(topic.title);
                  }}
                  style={{ color: "var(--accent-color)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              )}

              {/* YouTube ara butonu — konu başlığını YouTube'da arar */}
              <button
                className="kpss-info-btn"
                title="YouTube'da Ara"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenYoutube(topic.title);
                }}
                style={{ color: "#ef4444" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.5 15.5v-7L15.8 12z"></path>
                </svg>
              </button>

              {/* Detail Info button */}
              <button
                className="kpss-info-btn"
                title="Detay"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetail({
                    title: topic.title,
                    description: topic.description,
                    questionsCount: topic.questionsCount,
                  });
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
