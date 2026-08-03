/**
 * KpssQuizResultStep.tsx
 * KPSS Sınavı tamamlanma ekranı (Skor yüzdesi, soru inceleme listesi, TXT rapor aktarımı).
 * Tuval: TXT export + skor hesapları + QuizResultHero/QuizReviewList/QuizResultActions.
 */
import type { QuizQuestion } from "@/components/kpss/quiz/KpssQuizQuestionsStep.js";
import { QuizResultHero } from "./QuizResultHero.js";
import { QuizReviewList } from "./QuizReviewList.js";
import { QuizResultActions } from "./QuizResultActions.js";

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

  const correctCount = selectedAnswers.filter(
    (ans, idx) => ans === quizQuestions[idx]?.correctAnswer,
  ).length;
  const totalQuestions = quizQuestions.length;

  return (
    <div style={{ padding: "4px" }}>
      {/* ─── Score Hero ─── */}
      <QuizResultHero
        t={t}
        score={quizResultScore}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
      />

      {/* ─── Scrollable Questions Review ─── */}
      <QuizReviewList
        t={t}
        questions={quizQuestions}
        selectedAnswers={selectedAnswers}
      />

      {/* ─── Actions ─── */}
      <QuizResultActions
        t={t}
        onRetakeQuiz={onRetakeQuiz}
        onExport={handleExportTxt}
        onClose={onClose}
      />
    </div>
  );
}
