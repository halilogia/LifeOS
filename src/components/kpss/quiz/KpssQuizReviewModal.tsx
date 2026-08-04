/**
 * KpssQuizReviewModal.tsx
 * KPSS Sınavı tamamlandıktan veya geçmiş sınav seçildikten sonra
 * detaylı soru inceleme pop-up modali.
 * 
 * Temiz Kod Standartı: Sıfır düşük kaliteli emoji, sade anlaşılır başlıklar.
 */

import { useState } from "preact/hooks";
import { QuizQuestion } from "@/components/kpss/quiz/KpssQuizQuestionsStep.js";
import { KpssPastQuizSession } from "@/services/kpss/kpssQuizService.js";
import { QuizReviewList } from "./QuizReviewList.js";

interface KpssQuizReviewModalProps {
  lang: string;
  t: Record<string, string>;
  subjectTitle: string;
  topicTitle: string;
  score: number;
  quizQuestions: QuizQuestion[];
  selectedAnswers: number[];
  historySessions?: KpssPastQuizSession[];
  onClose: () => void;
  onRetake: () => void;
  onExport: () => void;
}

export function KpssQuizReviewModal({
  lang,
  t,
  subjectTitle,
  topicTitle,
  score: initialScore,
  quizQuestions: initialQuestions,
  selectedAnswers: initialAnswers,
  historySessions = [],
  onClose,
  onRetake,
  onExport,
}: KpssQuizReviewModalProps) {
  // Seçili oturum index'i (eğer history varsa en sonuncusu varsayılan)
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number>(
    historySessions.length > 0 ? historySessions.length - 1 : -1,
  );

  const activeSession =
    selectedSessionIdx !== -1 && historySessions[selectedSessionIdx]
      ? historySessions[selectedSessionIdx]
      : null;

  const currentQuestions = activeSession?.questions?.length
    ? activeSession.questions
    : initialQuestions;
  const currentAnswers = activeSession?.selectedAnswers?.length
    ? activeSession.selectedAnswers
    : initialAnswers;
  const currentScore = activeSession ? activeSession.score : initialScore;

  const correctCount = currentAnswers.filter(
    (ans, idx) => ans === currentQuestions[idx]?.correctAnswer,
  ).length;
  const totalQuestions = currentQuestions.length;

  const scoreColor =
    currentScore >= 80
      ? "#10b981"
      : currentScore >= 50
        ? "var(--accent-color)"
        : "#ef4444";

  const handleCustomExport = () => {
    let text = `Sınav Raporu\n`;
    text += `Ders: ${subjectTitle}\n`;
    text += `Konu: ${topicTitle}\n`;
    if (activeSession) {
      text += `Oturum: ${activeSession.questionCount} Soruluk Test (${activeSession.date})\n`;
    }
    text += `Skor: %${currentScore}\n`;
    text += `=========================================\n\n`;

    currentQuestions.forEach((q, idx) => {
      const userAnsIdx = currentAnswers[idx];
      const correctAnsIdx = q.correctAnswer;
      const letters = ["A", "B", "C", "D", "E"];

      text += `Soru ${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        text += `${letters[oIdx]}) ${opt}\n`;
      });
      text += `-----------------------------------------\n`;
      text += `Sizin Cevabınız: ${userAnsIdx !== -1 && userAnsIdx !== undefined ? letters[userAnsIdx] : "Boş"}\n`;
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
    link.download = `Sinav_${subjectTitle}_${topicTitle?.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="kpss-modal-overlay"
      style={{ zIndex: 1100 }}
      onClick={onClose}
    >
      <div
        className="kpss-modal-content"
        style={{
          maxWidth: "680px",
          width: "95%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          background: "rgba(18, 18, 26, 0.98)",
          border: "1px solid var(--card-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="kpss-modal-header"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--card-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
              Soruları İncele — {topicTitle}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {subjectTitle}
            </span>
          </div>
          <button
            className="kpss-close-btn"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {/* Body — Soru İnceleme Listesi */}
        <div
          style={{
            padding: "16px 20px",
            overflowY: "auto",
            flex: 1,
            maxHeight: "calc(90vh - 140px)",
          }}
        >
          {/* Geçmiş Test Oturum Seçicisi */}
          {historySessions.length > 0 && (
            <div
              style={{
                marginBottom: "16px",
                background: "rgba(139, 92, 246, 0.08)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#c084fc",
                }}
              >
                Geçmiş Test Oturumları ({historySessions.length})
              </span>
              <select
                value={selectedSessionIdx}
                onChange={(e) =>
                  setSelectedSessionIdx(
                    parseInt((e.target as HTMLSelectElement).value, 10),
                  )
                }
                style={{
                  background: "#161622",
                  border: "1px solid var(--card-border)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  cursor: "pointer",
                  outline: "none",
                  maxWidth: "280px",
                }}
              >
                {historySessions.map((sess, idx) => (
                  <option key={sess.id || idx} value={idx}>
                    Oturum #{idx + 1}: {sess.questionCount || sess.questions?.length || 5} Soru · %{sess.score} ({sess.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Seviye / Skor Özeti Barı */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--card-border)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  display: "block",
                }}
              >
                Seviye Değerlendirmesi
              </span>
              <strong style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>
                {totalQuestions > 0
                  ? `${correctCount} / ${totalQuestions} Doğru Cevap`
                  : "Harici Sınav Kaydı"}
              </strong>
            </div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "800",
                color: scoreColor,
                background: `${scoreColor}15`,
                border: `1px solid ${scoreColor}40`,
                padding: "4px 12px",
                borderRadius: "8px",
              }}
            >
              %{currentScore}
            </div>
          </div>

          {currentQuestions.length > 0 ? (
            <QuizReviewList
              t={t}
              questions={currentQuestions}
              selectedAnswers={currentAnswers}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px 10px",
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Bu sınav harici AI sitesinde çözülmüş ve sonucu %{currentScore} olarak kaydedilmiştir.
            </div>
          )}
        </div>

        {/* Footer — Aksiyon Butonları (Dışarı Aktar, Seviyeni Değerlendir, Tekrar Çöz) */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--card-border)",
            display: "flex",
            gap: "10px",
            background: "rgba(0, 0, 0, 0.2)",
            flexWrap: "wrap",
          }}
        >
          {/* Dışarı Aktar */}
          <button
            className="kpss-qcount-btn"
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "12px 0",
              fontSize: "0.88rem",
              fontWeight: 600,
            }}
            onClick={handleCustomExport}
          >
            Dışarı Aktar
          </button>

          {/* Tekrar Çöz */}
          <button
            className="kpss-qcount-btn"
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "12px 0",
              fontSize: "0.88rem",
              fontWeight: 600,
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              color: "#e2e8f0",
            }}
            onClick={() => {
              onClose();
              onRetake();
            }}
          >
            Tekrar Çöz
          </button>
        </div>
      </div>
    </div>
  );
}
