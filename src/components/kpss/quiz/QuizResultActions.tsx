interface QuizResultActionsProps {
  t: Record<string, string>;
  hasPastQuestions?: boolean;
  onReviewQuestions: () => void;
  onRetakeQuiz: () => void;
}

export function QuizResultActions({
  t,
  hasPastQuestions = true,
  onReviewQuestions,
  onRetakeQuiz,
}: QuizResultActionsProps) {
  return (
    <div
      className="settings-footer"
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "12px",
      }}
    >
      {/* Ana Aksiyon: Geçmiş Testleri İncele */}
      {hasPastQuestions && (
        <button
          className="kpss-external-open-btn"
          style={{
            width: "100%",
            padding: "13px",
            fontSize: "0.95rem",
            fontWeight: 700,
            justifyContent: "center",
            background: "rgba(139, 92, 246, 0.2)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            color: "#e2e8f0",
          }}
          onClick={onReviewQuestions}
        >
          Geçmiş Testleri İncele
        </button>
      )}

      {/* İkincil Aksiyon: Seviyeni Tekrar Çöz */}
      <button
        className="kpss-qcount-btn"
        style={{
          width: "100%",
          padding: "12px 0",
          fontWeight: 600,
          fontSize: "0.88rem",
        }}
        onClick={onRetakeQuiz}
      >
        {t.kpss_quiz_retake || "Seviyeni Tekrar Çöz"}
      </button>
    </div>
  );
}
