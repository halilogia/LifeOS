export function getScoreColor(score: number): string {
  if (score >= 80) {
    return "#10b981";
  }
  if (score >= 60) {
    return "#f59e0b";
  }
  if (score >= 40) {
    return "#f97316";
  }
  return "#ef4444";
}

export function getScoreEmoji(score: number): string {
  if (score >= 90) {
    return "🏆";
  }
  if (score >= 80) {
    return "🌟";
  }
  if (score >= 60) {
    return "👍";
  }
  if (score >= 40) {
    return "💪";
  }
  return "📚";
}

interface QuizResultHeroProps {
  t: Record<string, string>;
  score: number;
  correctCount: number;
  totalQuestions: number;
}

export function QuizResultHero({
  t,
  score,
  correctCount,
  totalQuestions,
}: QuizResultHeroProps) {
  const scoreColor = getScoreColor(score);
  const emoji = getScoreEmoji(score);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 16px 20px",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))",
        borderRadius: "16px",
        border: "1px solid rgba(139,92,246,0.12)",
        marginBottom: "20px",
      }}
    >
      <div style={{ fontSize: "2.2rem", marginBottom: "4px" }}>{emoji}</div>
      <div
        style={{
          fontSize: "3.8rem",
          fontWeight: 800,
          color: scoreColor,
          lineHeight: 1.1,
          letterSpacing: "-2px",
          marginBottom: "4px",
        }}
      >
        %{score}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          fontWeight: 500,
          letterSpacing: "0.3px",
        }}
      >
        {correctCount}/{totalQuestions} {t.kpss_quiz_questions}
      </div>
    </div>
  );
}
