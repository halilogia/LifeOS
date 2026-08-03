import { MathRenderer } from "@/components/kpss/quiz/MathRenderer.js";
import type { QuizQuestion } from "@/components/kpss/quiz/KpssQuizQuestionsStep.js";

interface QuizReviewListProps {
  t: Record<string, string>;
  questions: QuizQuestion[];
  selectedAnswers: number[];
}

export function QuizReviewList({
  t,
  questions,
  selectedAnswers,
}: QuizReviewListProps) {
  return (
    <div
      style={{
        maxHeight: "240px",
        overflowY: "auto",
        textAlign: "left",
        marginBottom: "20px",
        background: "rgba(0, 0, 0, 0.18)",
        borderRadius: "14px",
        padding: "14px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <h5
        style={{
          margin: "0 0 14px 0",
          fontSize: "0.85rem",
          color: "var(--accent-color)",
          fontWeight: 700,
          letterSpacing: "0.3px",
          textTransform: "uppercase",
        }}
      >
        {t.kpss_quiz_review}
      </h5>
      {questions.map((q, qIdx) => {
        const userAns = selectedAnswers[qIdx];
        const isCorrect = userAns === q.correctAnswer;
        return (
          <div
            key={qIdx}
            style={{
              padding: "12px",
              marginBottom: "10px",
              background: isCorrect
                ? "rgba(16, 185, 129, 0.05)"
                : userAns === -1
                  ? "rgba(255, 255, 255, 0.01)"
                  : "rgba(239, 68, 68, 0.05)",
              borderRadius: "10px",
              borderLeft: `3px solid ${
                isCorrect
                  ? "#10b981"
                  : userAns === -1
                    ? "rgba(255,255,255,0.15)"
                    : "#ef4444"
              }`,
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#ffffff",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: "var(--accent-color)",
                  fontWeight: 700,
                  marginRight: "6px",
                }}
              >
                #{qIdx + 1}
              </span>
              <MathRenderer text={q.question} />
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                paddingLeft: "4px",
                marginBottom: "8px",
              }}
            >
              {q.options.map((opt, oIdx) => {
                const letter = ["A", "B", "C", "D", "E"][oIdx];
                const isCorrectOpt = oIdx === q.correctAnswer;
                const isSelectedOpt = userAns === oIdx;
                let color = "var(--text-secondary)";
                let weight = "400";
                if (isCorrectOpt) {
                  color = "#10b981";
                  weight = "600";
                } else if (isSelectedOpt) {
                  color = "#ef4444";
                  weight = "600";
                }
                return (
                  <span
                    key={oIdx}
                    style={{
                      fontSize: "0.8rem",
                      color,
                      fontWeight: weight,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        background: isCorrectOpt
                          ? "rgba(16,185,129,0.15)"
                          : isSelectedOpt
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(255,255,255,0.04)",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        marginRight: "6px",
                        color,
                      }}
                    >
                      {letter}
                    </span>
                    <MathRenderer text={opt} />
                  </span>
                );
              })}
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "rgba(255, 255, 255, 0.7)",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "8px 10px",
                borderRadius: "8px",
                borderLeft: "3px solid var(--accent-color)",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--accent-color)" }}>
                {t.kpss_quiz_solution_label}
              </strong>{" "}
              <MathRenderer text={q.solution || t.kpss_quiz_solution_label} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
