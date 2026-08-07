/**
 * KpssQuizQuestionsStep.tsx
 * KPSS Sınavı sorularının gösterim ekranı (İlerleme çubuğu, Canvas, Harita, Şıklar, Çözüm kutusu ve Navigasyon).
 */

import { useEffect, useState } from "preact/hooks";
import { KpssQuestionCanvas } from "@/components/kpss/topics/KpssQuestionCanvas.js";
import { KpssQuestionMap } from "@/components/kpss/exams/KpssQuestionMap.js";
import { MathRenderer } from "@/components/kpss/quiz/MathRenderer.js";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  solution: string;
  chart?: {
    type: "bar" | "line" | "geometry";
    title?: string;
    labels?: string[];
    values?: (number | string)[];
    shape?: "triangle" | "circle" | "parallel_lines";
    angles?: Record<string, string>;
    sides?: Record<string, string>;
  };
  map?: {
    highlightRegions?: string[];
    markers?: Array<{ x: number; y: number; label: string }>;
  };
}

interface KpssQuizQuestionsStepProps {
  t: Record<string, string>;
  quizLoading: boolean;
  quizError: string | null;
  quizQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: number[];
  totalQuizLength: number;
  isInCollection: boolean;
  onToggleCollection: (q: QuizQuestion) => void;
  onStartQuiz: () => void;
  onSelectAnswer: (oIdx: number) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
}

export function KpssQuizQuestionsStep({
  t,
  quizLoading,
  quizError,
  quizQuestions,
  currentQuestionIndex,
  selectedAnswers,
  totalQuizLength,
  isInCollection,
  onToggleCollection,
  onStartQuiz,
  onSelectAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onFinishQuiz,
}: KpssQuizQuestionsStepProps) {
  // Zamanlayıcı: her soru için 1 dk (5 soru=5dk, 10=10dk...). Süre bitince otomatik sonuç.
  const [remainingSec, setRemainingSec] = useState(totalQuizLength * 60);

  useEffect(() => {
    setRemainingSec(totalQuizLength * 60);
  }, [totalQuizLength]);

  useEffect(() => {
    if (quizLoading || quizError || quizQuestions.length === 0) {
      return;
    }
    if (remainingSec <= 0) {
      onFinishQuiz();
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSec, quizLoading, quizError, quizQuestions.length]);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (quizLoading) {
    return (
      <div className="ha-loading" style={{ minHeight: "200px" }}>
        <div className="ha-spinner" />
        <span style={{ fontSize: "0.95rem" }}>{t.kpss_quiz_generating}</span>
      </div>
    );
  }

  if (quizError) {
    return (
      <div className="ha-error" style={{ minHeight: "200px" }}>
        <span>{quizError}</span>
        <button className="ha-retry-btn" onClick={onStartQuiz}>
          {t.kpss_quiz_retry}
        </button>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return null;
  }

  const currentQ = quizQuestions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== -1;

  return (
    <div>
      <div className="kpss-quiz-progress-bar-container">
        <div
          className="kpss-quiz-progress-fill"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuizLength) * 100}%`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.85rem",
          opacity: 0.6,
          marginBottom: "8px",
        }}
      >
        <span>
          {`${t.kpss_quiz_questions} ${currentQuestionIndex + 1} / ${totalQuizLength}`}
        </span>
        {/* Zamanlayıcı — süre bitince otomatik sonuç */}
        <span
          style={{
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: remainingSec <= 60 ? "#f87171" : "inherit",
          }}
        >
          ⏱ {fmt(remainingSec)}
        </span>
      </div>

      {currentQ.chart && <KpssQuestionCanvas chart={currentQ.chart} />}
      {currentQ.map && <KpssQuestionMap map={currentQ.map} />}

      <div className="kpss-quiz-question-container">
        <div className="kpss-quiz-question-text">
          <MathRenderer text={currentQ.question} />
        </div>
        <button
          className={`koleksiyon-btn ${isInCollection ? "saved" : ""}`}
          onClick={() => onToggleCollection(currentQ)}
          title={
            isInCollection
              ? t.kpss_koleksiyon_remove
              : t.kpss_koleksiyon_add
          }
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.35rem",
            filter: isInCollection ? "none" : "grayscale(1) opacity(0.5)",
            transition: "all 0.2s ease",
          }}
        >
          {isInCollection ? "💎" : "💎"}
        </button>
      </div>

      <div className="kpss-quiz-options-grid">
        {currentQ.options.map((opt, oIdx) => {
          const letter = ["A", "B", "C", "D", "E"][oIdx];
          const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
          const isCorrect = oIdx === currentQ.correctAnswer;

          let cardStyle: Record<string, string | number> = {
            transition: "all 0.2s ease",
          };

          if (isAnswered) {
            if (isCorrect) {
              cardStyle = {
                ...cardStyle,
                border: "1px solid rgba(16, 185, 129, 0.4)",
                background: "rgba(16, 185, 129, 0.08)",
                color: "#34d399",
                cursor: "default",
              };
            } else if (isSelected) {
              cardStyle = {
                ...cardStyle,
                border: "1px solid rgba(239, 68, 68, 0.4)",
                background: "rgba(239, 68, 68, 0.08)",
                color: "#f87171",
                cursor: "default",
              };
            } else {
              cardStyle = {
                ...cardStyle,
                opacity: 0.4,
                cursor: "default",
              };
            }
          }

          return (
            <div
              key={oIdx}
              className={`kpss-quiz-option-card ${isSelected && !isAnswered ? "selected" : ""}`}
              style={cardStyle}
              onClick={() => onSelectAnswer(oIdx)}
            >
              <div
                className="kpss-quiz-option-letter"
                style={
                  isAnswered && isCorrect
                    ? { background: "#10b981", color: "white" }
                    : isAnswered && isSelected
                      ? { background: "#ef4444", color: "white" }
                      : {}
                }
              >
                {letter}
              </div>
              <span>
                <MathRenderer text={opt} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Solution display box */}
      {isAnswered && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.03)",
            borderLeft: "4px solid var(--accent-color)",
            borderRadius: "8px",
            fontSize: "0.82rem",
            lineHeight: 1.5,
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              color: "var(--accent-color)",
              marginBottom: "4px",
            }}
          >
            {t.kpss_quiz_solution}
          </div>
          <MathRenderer text={currentQ.solution || t.kpss_quiz_no_solution} />
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          className="kpss-qcount-btn"
          style={{ flex: 1 }}
          disabled={currentQuestionIndex === 0}
          onClick={onPreviousQuestion}
        >
          {t.kpss_quiz_previous}
        </button>
        {currentQuestionIndex < totalQuizLength - 1 ? (
          <button
            className={`settings-add-btn ${currentQuestionIndex >= quizQuestions.length - 1 ? "loading" : ""}`}
            style={{ flex: 1, padding: 0 }}
            disabled={
              selectedAnswers[currentQuestionIndex] === -1 ||
              currentQuestionIndex >= quizQuestions.length - 1
            }
            onClick={onNextQuestion}
          >
            {currentQuestionIndex >= quizQuestions.length - 1 ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span className="kpss-btn-loader" />
                {t.kpss_quiz_next_loading}
              </span>
            ) : (
              t.kpss_quiz_next
            )}
          </button>
        ) : (
          <button
            className="settings-add-btn"
            style={{ flex: 1, padding: 0 }}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
            onClick={onFinishQuiz}
          >
            {t.kpss_quiz_finish}
          </button>
        )}
      </div>
    </div>
  );
}
