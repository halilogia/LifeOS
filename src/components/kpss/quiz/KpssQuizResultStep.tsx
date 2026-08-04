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
  cumulative: { totalQuestions: number; totalCorrect: number };
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
  cumulative,
  quizQuestions,
  selectedAnswers,
  subjectNames,
  onRetakeQuiz,
  onClose,
}: KpssQuizResultStepProps) {
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
  const cumPercent = cumTotal >= 100 ? Math.round((cumCorrect / cumTotal) * 100) : cumTotal > 0 ? Math.round((cumCorrect / cumTotal) * 100) : 0;
  const cumPassed = cumTotal >= 100 && cumPercent >= 80;
  const barPct = Math.min(100, Math.round((cumTotal / 100) * 100));

  return (
    <div style={{ padding: "4px" }}>
      {/* ─── Score Hero ─── */}
      <QuizResultHero
        t={t}
        score={quizResultScore}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
      />

      {/* ─── Birikimli Başarı ─── */}
      <div
        style={{
          marginTop: "12px",
          background: "rgba(139, 92, 246, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: "10px",
          padding: "10px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 6,
          }}
        >
          <span>Konu Başarı Durumu</span>
          <span style={{ color: "#c084fc" }}>
            {cumTotal} / 100 soru · %{cumPercent} başarı
          </span>
        </div>
        {/* İlerleme çubuğu */}
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barPct}%`,
              background: cumPassed
                ? "linear-gradient(90deg,#22c55e,#4ade80)"
                : "linear-gradient(90deg,#a855f7,#c084fc)",
              borderRadius: 4,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: cumPassed ? "#4ade80" : "#94a3b8",
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          {cumPassed
            ? "✓ Konu tamamlandı! (100+ soru, %80+ başarı)"
            : cumTotal >= 100
              ? "100+ soru çözdün ama %80 başarıya henüz ulaşmadın. Daha fazla soru çözerek başarını yükselt."
              : `Bu konuda en az 100 soru çözüp %80 başarıya ulaşınca "Tamamlandı" olur. Şu an ${cumTotal} soru çözüldü.`}
        </div>
      </div>

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
