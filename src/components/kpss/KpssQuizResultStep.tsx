/**
 * KpssQuizResultStep.tsx
 * KPSS Sınavı tamamlanma ekranı (Skor yüzdesi, soru inceleme listesi, TXT rapor aktarımı).
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

  return (
    <div style={{ textAlign: "center", padding: "12px" }}>
      <h4
        style={{
          color: "var(--accent-color)",
          fontSize: "1.4rem",
          marginBottom: "16px",
        }}
      >
        {t.kpss_quiz_completed}
      </h4>
      <div
        style={{
          fontSize: "3.5rem",
          fontWeight: 800,
          color:
            quizResultScore >= 80
              ? "#10b981"
              : quizResultScore >= 40
                ? "#ffc107"
                : "#ef4444",
          marginBottom: "12px",
        }}
      >
        %{quizResultScore}
      </div>
      <p
        style={{
          opacity: 0.8,
          fontSize: "0.95rem",
          lineHeight: 1.5,
          marginBottom: "20px",
        }}
      >
        {t.kpss_quiz_proficiency}
        <br />
        <span
          style={{
            fontSize: "0.85rem",
            opacity: 0.6,
            marginTop: "8px",
            display: "inline-block",
          }}
        >
          {quizResultScore >= 80
            ? t.kpss_srs_great_job
            : quizResultScore >= 40
              ? t.kpss_status_working
              : t.kpss_status_not_started}
        </span>
      </p>

      {/* Scrollable Questions Review list */}
      <div
        style={{
          maxHeight: "220px",
          overflowY: "auto",
          textAlign: "left",
          marginBottom: "24px",
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
          padding: "12px",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <h5
          style={{
            margin: "0 0 12px 0",
            fontSize: "0.88rem",
            color: "var(--accent-color)",
            fontWeight: "600",
          }}
        >
          {t.kpss_quiz_review}
        </h5>
        {quizQuestions.map((q, qIdx) => {
          const userAns = selectedAnswers[qIdx];
          return (
            <div
              key={qIdx}
              style={{
                paddingBottom: "12px",
                marginBottom: "12px",
                borderBottom:
                  qIdx < quizQuestions.length - 1
                    ? "1px solid rgba(255, 255, 255, 0.05)"
                    : "none",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: "600",
                  fontSize: "0.82rem",
                  color: "#ffffff",
                }}
              >
                {qIdx + 1}. <MathRenderer text={q.question} />
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  paddingLeft: "8px",
                  marginBottom: "8px",
                }}
              >
                {q.options.map((opt, oIdx) => {
                  const letter = ["A", "B", "C", "D", "E"][oIdx];
                  const isCorrectOpt = oIdx === q.correctAnswer;
                  const isSelectedOpt = userAns === oIdx;
                  let color = "var(--text-secondary)";
                  let weight = "normal";
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
                        fontSize: "0.78rem",
                        color,
                        fontWeight: weight,
                      }}
                    >
                      {letter}) <MathRenderer text={opt} />{" "}
                      {isSelectedOpt &&
                        t.kpss_quiz_retry}{" "}
                      {isCorrectOpt &&
                        t.kpss_quiz_solution}
                    </span>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(255, 255, 255, 0.65)",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "8px",
                  borderRadius: "6px",
                  borderLeft: "3px solid var(--accent-color)",
                }}
              >
                <strong>{t.kpss_quiz_solution_label}</strong>{" "}
                <MathRenderer
                  text={
                    q.solution ||
                    t.kpss_quiz_solution_label
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

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
            style={{ flex: 1 }}
            onClick={onRetakeQuiz}
          >
            {t.kpss_quiz_retake}
          </button>
          <button
            className="kpss-qcount-btn"
            style={{ flex: 1 }}
            onClick={handleExportTxt}
          >
            {t.kpss_quiz_export}
          </button>
        </div>
        <button
          className="settings-add-btn"
          style={{ width: "100%", padding: 0 }}
          onClick={onClose}
        >
          {t.kpss_quiz_close}
        </button>
      </div>
    </div>
  );
}
