/**
 * useKpssQuiz — facade over the Zustand singleton store.
 * Signature unchanged; consumer components are untouched.
 */

import { useEffect } from "preact/hooks";
import { useKpssQuizStore, useCurrentQuestionInCollection } from "@/presentation/store/kpssQuizStore.js";
import type { KpssQuizCallbacks } from "@/presentation/store/kpssQuizStore.js";

export function useKpssQuiz(options: KpssQuizCallbacks) {
  const s = useKpssQuizStore;
  const currentQuestionInCollection = useCurrentQuestionInCollection();

  // Inject callbacks on every render. options (esp. aiConfig, prepared inline in the
  // view) is a fresh object each render and it carries live currentSubject()/t — a
  // stale closure here would show old-language errors and stale currentSubject().
  // Module-level assignment is cheap; no effect/dep needed.
  s.getState().configure(options);

  useEffect(() => {
    void s.getState().loadPastQuizzes();
    void s.getState().loadCollection();
  }, []);

  return {
    activeQuizTopic: s((st) => st.activeQuizTopic),
    setActiveQuizTopic: s((st) => st.setActiveQuizTopic),
    quizStep: s((st) => st.quizStep),
    setQuizStep: s((st) => st.setQuizStep),
    selectedQuizCount: s((st) => st.selectedQuizCount),
    setSelectedQuizCount: s((st) => st.setSelectedQuizCount),
    quizLoading: s((st) => st.quizLoading),
    setQuizLoading: s((st) => st.setQuizLoading),
    isBackgroundLoading: s((st) => st.isBackgroundLoading),
    setCurrentQuestionIndex: s((st) => st.setCurrentQuestionIndex),
    currentQuestionIndex: s((st) => st.currentQuestionIndex),
    quizQuestions: s((st) => st.quizQuestions),
    setQuizQuestions: s((st) => st.setQuizQuestions),
    quizResultScore: s((st) => st.quizResultScore),
    quizError: s((st) => st.quizError),
    setQuizError: s((st) => st.setQuizError),
    pastQuizzes: s((st) => st.pastQuizzes),
    cumulative: s((st) => st.cumulative),
    currentQuestionInCollection,
    setSelectedAnswers: s((st) => st.setSelectedAnswers),
    selectedAnswers: s((st) => st.selectedAnswers),
    handleToggleCollection: s((st) => st.handleToggleCollection),
    fetchQuizFromAI: s((st) => st.fetchQuizFromAI),
    handleFinishQuiz: s((st) => st.handleFinishQuiz),
    handleSaveExternalResult: s((st) => st.handleSaveExternalResult),
    handleStartQuiz: s((st) => st.handleStartQuiz),
    handleStartPastExam: s((st) => st.handleStartPastExam),
    handleReviewPastQuiz: s((st) => st.handleReviewPastQuiz),
    loadPastQuizzes: s((st) => st.loadPastQuizzes),
  };
}