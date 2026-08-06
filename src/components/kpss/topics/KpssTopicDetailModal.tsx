/**
 * KpssTopicDetailModal.tsx
 * KPSS Konu detay özet pop-up modali.
 */

interface KpssTopicDetailModalProps {
  topic: {
    title: string;
    description: string;
    questionsCount?: number;
    subtopics?: string[];
  };
  detailsTitle: string;
  t: Record<string, string>;
  onClose: () => void;
}

function IconX() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function KpssTopicDetailModal({
  topic,
  detailsTitle,
  t,
  onClose,
}: KpssTopicDetailModalProps) {
  return (
    <div className="kpss-modal-overlay" onClick={onClose}>
      <div className="kpss-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="kpss-modal-header">
          <h3>
            {detailsTitle}: {topic.title}
          </h3>
          <button className="kpss-close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>
        <div className="kpss-modal-body">
          <p>{topic.description}</p>
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: "4px",
                }}
              >
                {t.kpss_topic_subtopics}
              </span>
              {topic.subtopics.map((sub) => (
                <div
                  key={sub}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent-color)",
                    }}
                  />
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          )}
          {topic.questionsCount !== undefined && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--accent-color)",
                  fontSize: "1rem",
                }}
              >
                {Math.round(topic.questionsCount)}
              </span>
              <span>
                {t.kpss_topic_avg_questions}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
