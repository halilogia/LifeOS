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
  onOpenExternal: () => void;
}

export function KpssQuizIntroStep({
  t,
  selectedQuizCount,
  aiApiKey,
  aiEndpoint,
  onSetSelectedQuizCount,
  onStartQuiz,
  onOpenExternal,
}: KpssQuizIntroStepProps) {
  const isAiConfigured =
    aiApiKey ||
    (aiEndpoint &&
      (aiEndpoint.includes("localhost") || aiEndpoint.includes("127.0.0.1")));

  return (
    <div style={{ textAlign: "center", padding: "8px 4px" }}>
      <h4
        style={{
          color: "var(--accent-color)",
          marginBottom: "16px",
          fontSize: "1.3rem",
          fontWeight: "800",
          letterSpacing: "-0.5px",
        }}
      >
        {t.kpss_quiz_proficiency}
      </h4>
      <p
        style={{
          fontSize: "0.95rem",
          color: "var(--text-secondary)",
          lineHeight: "1.7",
          marginBottom: "20px",
          maxWidth: "420px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {t.kpss_quiz_proficiency}
      </p>

      <div className="kpss-question-count-grid">
        {[5, 10, 15, 20, 25].map((count) => (
          <button
            key={count}
            className={`kpss-qcount-btn ${selectedQuizCount === count ? "active" : ""}`}
            onClick={() => onSetSelectedQuizCount(count)}
          >
            <span>{count} {t.kpss_quiz_questions}</span>
            <span
              style={{
                display: "block",
                fontSize: "0.68rem",
                opacity: 0.65,
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              ⏱ {count} dk
            </span>
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
        style={{
          padding: "16px 0 0 0",
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <button
          className="settings-add-btn"
          style={{
            width: "100%",
            padding: "14px 20px",
            fontSize: "1rem",
            fontWeight: "700",
          }}
          disabled={!isAiConfigured}
          onClick={onStartQuiz}
        >
          {t.kpss_quiz_proficiency}
        </button>

        {/* Harici AI seçeneği — her zaman aktif */}
        <button className="kpss-external-open-btn" onClick={onOpenExternal}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {t.kpss_external_quiz_open}
        </button>
      </div>
    </div>
  );
}
