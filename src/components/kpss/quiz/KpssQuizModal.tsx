/**
 * KpssQuizModal.tsx
 * KPSS Seviye Tespit Sınavı Modal Bileşeni.
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 * Hem Yerel AI hem Harici AI (Gemini, ChatGPT, Claude, Copilot) modunu destekler.
 */

import { useState } from "preact/hooks";
import { KpssQuizInfoModal } from "@/components/kpss/quiz/KpssQuizInfoModal.js";
import { KpssQuizIntroStep } from "@/components/kpss/quiz/KpssQuizIntroStep.js";
import {
  KpssQuizQuestionsStep,
  QuizQuestion,
} from "@/components/kpss/quiz/KpssQuizQuestionsStep.js";
import { KpssQuizResultStep } from "@/components/kpss/quiz/KpssQuizResultStep.js";
import { KpssExternalQuizLauncher } from "@/components/kpss/quiz/KpssExternalQuizLauncher.js";
import { KpssExternalResultModal } from "@/components/kpss/quiz/KpssExternalResultModal.js";
import { Language } from "@/types/types.js";

interface KpssQuizModalProps {
  lang: Language;
  t: Record<string, string>;
  currentSubject: string;
  activeQuizTopic: string | null;
  quizStep: "intro" | "questions" | "result";
  selectedQuizCount: number;
  quizLoading: boolean;
  isBackgroundLoading: boolean;
  quizQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: number[];
  quizResultScore: number;
  quizError: string | null;
  cumulative: { totalQuestions: number; totalCorrect: number };
  aiApiKey: string;
  aiEndpoint: string;
  onClose: () => void;
  onSetSelectedQuizCount: (count: number) => void;
  onStartQuiz: () => void;
  onSelectAnswer: (oIdx: number) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
  onRetakeQuiz: () => void;
  onSaveExternalResult: (correct: number, total: number) => void;
  subjectNames: Record<string, string>;
}

export function KpssQuizModal({
  lang,
  t,
  currentSubject,
  activeQuizTopic,
  quizStep,
  selectedQuizCount,
  quizLoading,
  isBackgroundLoading,
  quizQuestions,
  currentQuestionIndex,
  selectedAnswers,
  quizResultScore,
  quizError,
  cumulative,
  aiApiKey,
  aiEndpoint,
  onClose,
  onSetSelectedQuizCount,
  onStartQuiz,
  onSelectAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onFinishQuiz,
  onRetakeQuiz,
  onSaveExternalResult,
  subjectNames,
}: KpssQuizModalProps) {
  if (!activeQuizTopic) {
    return null;
  }

  const [showInfo, setShowInfo] = useState(false);
  // "local-intro" | "external-launcher" | "external-result"
  const [internalMode, setInternalMode] = useState<
    "local-intro" | "external-launcher" | "external-result"
  >("local-intro");
  // Launcher'dan seçilen soru sayısı (harici akış için)
  const [externalQuizCount, setExternalQuizCount] = useState(selectedQuizCount);

  const totalQuizLength = isBackgroundLoading
    ? selectedQuizCount
    : quizQuestions.length;

  // Mevcut quiz adımı değişince (yani sınav başladı / bitti), iç modu sıfırla
  const isInExternalFlow =
    internalMode === "external-launcher" || internalMode === "external-result";

  return (
    <div className="settings-panel active" onClick={onClose}>
      <div
        className="settings-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px", width: "95%" }}
      >
        {/* Header */}
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3>{activeQuizTopic}</h3>
            <button
                onClick={() => setShowInfo(true)}
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-color)",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                }}
                title={t.kpss_quiz_new_gen_info}
                className="kpss-info-toggle-btn"
              >
                !
              </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Reform Milatları Bilgilendirme Modal'ı */}
        {showInfo && (
          <KpssQuizInfoModal t={t} onClose={() => setShowInfo(false)} />
        )}

        {/* Body Content */}
        <div className="settings-body" style={{ padding: "20px" }}>
          {/* ── Harici AI Launcher ── */}
          {isInExternalFlow && internalMode === "external-launcher" && (
            <KpssExternalQuizLauncher
              t={t}
              lang={lang}
              subjectKey={currentSubject}
              topicName={activeQuizTopic}
              questionCount={selectedQuizCount}
              onEnterResult={(count) => {
                setExternalQuizCount(count);
                setInternalMode("external-result");
              }}
              onBack={() => setInternalMode("local-intro")}
            />
          )}

          {/* ── Harici AI Sonuç Girişi ── */}
          {isInExternalFlow && internalMode === "external-result" && (
            <KpssExternalResultModal
              t={t}
              totalCount={externalQuizCount}
              onSave={(correct, total) => {
                onSaveExternalResult(correct, total);
                setInternalMode("local-intro");
              }}
              onBack={() => setInternalMode("external-launcher")}
            />
          )}

          {/* ── Yerel AI Akışı ── */}
          {!isInExternalFlow && (
            <>
              {quizStep === "intro" && (
                <KpssQuizIntroStep
                  t={t}
                  selectedQuizCount={selectedQuizCount}
                  aiApiKey={aiApiKey}
                  aiEndpoint={aiEndpoint}
                  onSetSelectedQuizCount={onSetSelectedQuizCount}
                  onStartQuiz={onStartQuiz}
                  onOpenExternal={() => setInternalMode("external-launcher")}
                />
              )}

              {quizStep === "questions" && (
                <KpssQuizQuestionsStep
                  t={t}
                  quizLoading={quizLoading}
                  quizError={quizError}
                  quizQuestions={quizQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  selectedAnswers={selectedAnswers}
                  totalQuizLength={totalQuizLength}
                  onStartQuiz={onStartQuiz}
                  onSelectAnswer={onSelectAnswer}
                  onPreviousQuestion={onPreviousQuestion}
                  onNextQuestion={onNextQuestion}
                  onFinishQuiz={onFinishQuiz}
                />
              )}

              {quizStep === "result" && (
                <KpssQuizResultStep
                  lang={lang}
                  t={t}
                  currentSubject={currentSubject}
                  activeQuizTopic={activeQuizTopic}
                  quizResultScore={quizResultScore}
                  cumulative={cumulative}
                  quizQuestions={quizQuestions}
                  selectedAnswers={selectedAnswers}
                  subjectNames={subjectNames}
                  onRetakeQuiz={onRetakeQuiz}
                  onClose={onClose}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
