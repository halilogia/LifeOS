/**
 * KpssQuizResultStep.tsx
 * KPSS Sınavı tamamlanma ekranı (Skor yüzdesi, pop-up soru inceleme butonu, aksiyonlar).
 */
import { useState } from "preact/hooks";
import type { QuizQuestion } from "@/components/kpss/quiz/KpssQuizQuestionsStep.js";
import { QuizResultHero } from "./QuizResultHero.js";
import { QuizResultActions } from "./QuizResultActions.js";
import { KpssQuizReviewModal } from "./KpssQuizReviewModal.js";

import { KpssPastQuizSession } from "@/services/kpss/kpssQuizService.js";

interface KpssQuizResultStepProps {
  lang: string;
  t: Record<string, string>;
  currentSubject: string;
  activeQuizTopic: string | null;
  quizResultScore: number;
  cumulative: { totalQuestions: number; totalCorrect: number };
  quizQuestions: QuizQuestion[];
  selectedAnswers: number[];
  historySessions?: KpssPastQuizSession[];
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
  cumulative,
  quizQuestions,
  selectedAnswers,
  historySessions,
  subjectNames,
  onRetakeQuiz,
  onClose,
}: KpssQuizResultStepProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleExportTxt = () => {
    let text = `Sınav Raporu\n`;
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
    link.download = `Sinav_${currentSubject}_${activeQuizTopic?.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === quizQuestions[idx]?.correctAnswer,
  ).length;
  const totalQuestions = quizQuestions.length;

  // Birikimli başarı: konu tamamlanması için min 100 soru + %80 şartı
  const cumTotal = cumulative?.totalQuestions ?? 0;
  const cumCorrect = cumulative?.totalCorrect ?? 0;
  const cumPercent =
    cumTotal >= 100
      ? Math.round((cumCorrect / cumTotal) * 100)
      : cumTotal > 0
        ? Math.round((cumCorrect / cumTotal) * 100)
        : 0;
  const cumPassed = cumTotal >= 100 && cumPercent >= 80;
  const barPct = Math.min(100, Math.round((cumTotal / 100) * 100));

  return (
    <div style={{ padding: "4px" }}>
      {/* ─── Unified Score & Dual Progress Hero ─── */}
      <QuizResultHero
        t={t}
        score={quizResultScore}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        cumulative={cumulative}
      />

      {/* ─── Actions ─── */}
      <QuizResultActions
        t={t}
        hasPastQuestions={
          quizQuestions.length > 0 ||
          (historySessions && historySessions.length > 0)
        }
        onReviewQuestions={() => setShowReviewModal(true)}
        onRetakeQuiz={onRetakeQuiz}
      />

      {/* ─── Soruları İncele Pop-up Modali ─── */}
      {showReviewModal && (
        <KpssQuizReviewModal
          lang={lang}
          t={t}
          subjectTitle={subjectNames[currentSubject] || currentSubject}
          topicTitle={activeQuizTopic || ""}
          score={quizResultScore}
          quizQuestions={quizQuestions}
          selectedAnswers={selectedAnswers}
          historySessions={historySessions}
          onClose={() => setShowReviewModal(false)}
          onRetake={onRetakeQuiz}
          onExport={handleExportTxt}
        />
      )}
    </div>
  );
}
