/**
 * KpssQuizResultStep.tsx
 * KPSS Sınavı tamamlanma ekranı (Skor yüzdesi, soru inceleme listesi, TXT rapor aktarımı).
 * Premium tipografi ile güncellendi.
 */

import { MathRenderer } from "@/components/kpss/MathRenderer.js";
import type { QuizQuestion } from "@/components/kpss/KpssQuizQuestionsStep.js";

interface KpssQuizResultStepProps {
  lang: string;
  t: Record<string, string>;
  currentSubject: string;
  activeQuizTopic: string | null;
  quizResultScore: number;
  quizQuestions: QuizQuestion[];
  selectedAnswers: number[];
  subjectNames: Record<string, string>;
  onRetakeQuiz: () => void;
  onClose: () => void;
}

function getScoreColor(score: number): string {
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

function getScoreEmoji(score: number): string {
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

export function KpssQuizResultStep({
  lang,
  t,
  currentSubject,
  activeQuizTopic,
  quizResultScore,
  quizQuestions,
  selectedAnswers,
  subjectNames,
  onRetakeQuiz,
  onClose,
}: KpssQuizResultStepProps) {
  const scoreColor = getScoreColor(quizResultScore);
  const emoji = getScoreEmoji(quizResultScore);

  const handleExportTxt = () => {
    let text = `KPSS Sınav Raporu\n`;
    text += `Ders: ${subjectNames[currentSubject] || currentSubject}\n`;
    text += `Konu: ${activeQuizTopic}\n`;
    text += `Skor: %${quizResultScore}\n`;
    text += `Tarih: ${new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}\n`;
    text += `=========================================\n\n`;

    quizQuestions.forEach((q, idx) => {
      const userAnsIdx = selectedAnswers[idx];
      const correctAnsIdx = q.correctAnswer;
      const letters = ["A", "B", "C", "D", "E"];

      text += `Soru ${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        text += `${letters[oIdx]}) ${opt}\n`;
      });
      text += `-----------------------------------------\n`;
      text += `Sizin Cevabınız: ${userAnsIdx !== -1 ? letters[userAnsIdx] : "Boş"}\n`;
      text += `Doğru Cevap: ${letters[correctAnsIdx]}\n`;
      text += `Çözüm: ${q.solution || "Açıklama bulunmuyor."}\n`;
      text += `=========================================\n\n`;
    });

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KPSS_Sinav_${currentSubject}_${activeQuizTopic?.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === quizQuestions[idx]?.correctAnswer,
  ).length;
  const totalQuestions = quizQuestions.length;

  return (
    <div style={{ padding: "4px" }}>
      {/* ─── Score Hero ─── */}
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
          %{quizResultScore}
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

      {/* ─── Scrollable Questions Review ─── */}
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
        {quizQuestions.map((q, qIdx) => {
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

      {/* ─── Actions ─── */}
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
            onClick={handleExportTxt}
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
    </div>
  );
}
