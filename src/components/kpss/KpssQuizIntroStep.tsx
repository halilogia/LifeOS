/**
 * KpssQuizIntroStep.tsx
 * KPSS Quiz başlama ekranı (Soru sayısı gridi ve AI anahtarı kontrolü).
 */

interface KpssQuizIntroStepProps {
  t: Record<string, string>;
  selectedQuizCount: number;
  aiApiKey: string;
  aiEndpoint: string;
  onSetSelectedQuizCount: (count: number) => void;
  onStartQuiz: () => void;
}

export function KpssQuizIntroStep({
  t,
  selectedQuizCount,
  aiApiKey,
  aiEndpoint,
  onSetSelectedQuizCount,
  onStartQuiz,
}: KpssQuizIntroStepProps) {
  const isAiConfigured =
    aiApiKey ||
    (aiEndpoint &&
      (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1")));

  return (
    <div style={{ textAlign: "center", padding: "12px" }}>
      <h4 style={{ color: "var(--accent-color)", marginBottom: "12px" }}>
        {t.kpss_quiz_proficiency}
      </h4>
      <p style={{ fontSize: "0.95rem", opacity: 0.8, lineHeight: 1.5 }}>
        {t.kpss_quiz_proficiency}
      </p>

      <div className="kpss-question-count-grid">
        {[5, 10, 15, 20, 25].map((count) => (
          <button
            key={count}
            className={`kpss-qcount-btn ${selectedQuizCount === count ? "active" : ""}`}
            onClick={() => onSetSelectedQuizCount(count)}
          >
            {count} {t.kpss_quiz_questions}
          </button>
        ))}
      </div>

      {!isAiConfigured && (
        <div
          className="halka-arz-fallback-notice"
          style={{
            marginTop: "16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {t.kpss_quiz_proficiency}
        </div>
      )}

      <div
        className="settings-footer"
        style={{ padding: "16px 0 0 0", marginTop: "24px" }}
      >
        <button
          className="settings-add-btn"
          style={{ width: "100%" }}
          disabled={!isAiConfigured}
          onClick={onStartQuiz}
        >
          {t.kpss_quiz_proficiency}
        </button>
      </div>
    </div>
  );
}
