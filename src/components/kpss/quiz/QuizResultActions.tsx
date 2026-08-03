interface QuizResultActionsProps {
  t: Record<string, string>;
  onRetakeQuiz: () => void;
  onExport: () => void;
  onClose: () => void;
}

export function QuizResultActions({
  t,
  onRetakeQuiz,
  onExport,
  onClose,
}: QuizResultActionsProps) {
  return (
    <div
      className="settings-footer"
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
        <button
          className="kpss-qcount-btn"
          style={{
            flex: 1,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
          onClick={onRetakeQuiz}
        >
          {t.kpss_quiz_retake}
        </button>
        <button
          className="kpss-qcount-btn"
          style={{
            flex: 1,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
          onClick={onExport}
        >
          {t.kpss_quiz_export}
        </button>
      </div>
      <button
        className="settings-add-btn"
        style={{
          width: "100%",
          padding: "14px 20px",
          fontSize: "1rem",
          fontWeight: 700,
        }}
        onClick={onClose}
      >
        {t.kpss_quiz_close}
      </button>
    </div>
  );
}
