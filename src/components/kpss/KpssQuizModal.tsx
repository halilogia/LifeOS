/**
 * KpssQuizModal.tsx
 * KPSS Seviye Tespit Sınavı Modal Bileşeni.
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 */

import { useState } from "preact/hooks";
import { KpssQuizInfoModal } from "@/components/kpss/KpssQuizInfoModal.js";
import { KpssQuizIntroStep } from "@/components/kpss/KpssQuizIntroStep.js";
import {
  KpssQuizQuestionsStep,
  QuizQuestion,
} from "@/components/kpss/KpssQuizQuestionsStep.js";
import { KpssQuizResultStep } from "@/components/kpss/KpssQuizResultStep.js";

interface KpssQuizModalProps {
  lang: string;
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
  subjectNames: Record<string, string>;
}

export function KpssQuizModal({
  lang,
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
  subjectNames,
}: KpssQuizModalProps) {
  if (!activeQuizTopic) {
    return null;
  }

  const [showInfo, setShowInfo] = useState(false);
  const totalQuizLength = isBackgroundLoading
    ? selectedQuizCount
    : quizQuestions.length;

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
            {activeQuizTopic.includes("KPSS") && (
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
                title={
                  lang === "tr"
                    ? "KPSS Yeni Nesil Bilgilendirmesi"
                    : "KPSS New Generation Info"
                }
                className="kpss-info-toggle-btn"
              >
                !
              </button>
            )}
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
          <KpssQuizInfoModal lang={lang} onClose={() => setShowInfo(false)} />
        )}

        {/* Body Content */}
        <div className="settings-body" style={{ padding: "20px" }}>
          {quizStep === "intro" && (
            <KpssQuizIntroStep
              lang={lang}
              selectedQuizCount={selectedQuizCount}
              aiApiKey={aiApiKey}
              aiEndpoint={aiEndpoint}
              onSetSelectedQuizCount={onSetSelectedQuizCount}
              onStartQuiz={onStartQuiz}
            />
          )}

          {quizStep === "questions" && (
            <KpssQuizQuestionsStep
              lang={lang}
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
              currentSubject={currentSubject}
              activeQuizTopic={activeQuizTopic}
              quizResultScore={quizResultScore}
              quizQuestions={quizQuestions}
              selectedAnswers={selectedAnswers}
              subjectNames={subjectNames}
              onRetakeQuiz={onRetakeQuiz}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
