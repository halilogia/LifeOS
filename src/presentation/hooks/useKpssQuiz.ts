import { useState } from "preact/hooks";
import {
  kpssQuizFlowService,
  AIConfig,
} from "@/services/kpssQuizFlowService.js";
import {
  getPastExamQuestions,
  KpssPastQuiz,
} from "@/services/kpssQuizService.js";
import { QuizQuestion } from "@/services/kpssAiService.js";
import { logger } from "@/utils/logger.js";

interface UseKpssQuizOptions {
  currentSubject: () => string;
  t: Record<string, string>;
  aiConfig: AIConfig;
  onQuizCompleted: () => Promise<void> | void;
  onLoadPastQuizzes: () => Promise<Record<string, KpssPastQuiz>>;
  onSubjectChange?: (subject: string) => void;
  onCloseDetail?: () => void;
}

export function useKpssQuiz({
  currentSubject,
  t,
  aiConfig,
  onQuizCompleted,
  onLoadPastQuizzes,
  onSubjectChange,
  onCloseDetail,
}: UseKpssQuizOptions) {
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState<"intro" | "questions" | "result">(
    "intro",
  );
  const [selectedQuizCount, setSelectedQuizCount] = useState(5);
  const [quizLoading, setQuizLoading] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResultScore, setQuizResultScore] = useState(0);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [pastQuizzes, setPastQuizzes] = useState<Record<string, KpssPastQuiz>>(
    {},
  );

  const fetchQuizFromAI = async (
    subjectKey: string,
    topicName: string,
    count: number,
  ) => {
    setQuizLoading(true);
    setIsBackgroundLoading(false);
    setQuizError(null);
    setQuizStep("questions");
    setQuizQuestions([]);

    try {
      // Geçmişte çözülen AI soruları (pastQuizzes) — tekrar sorulmaması için exclude
      const quizKey = `${subjectKey}_${topicName}`;
      const pastQuiz = pastQuizzes[quizKey];
      const pastQuestions: QuizQuestion[] = pastQuiz?.questions ?? [];

      // İlk soru AI'dan beklenir (boş ekran görünmez), kalanlar arka planda üretilir
      const firstList = await kpssQuizFlowService.fetchQuestionsSubsetFromAI(
        subjectKey,
        topicName,
        1,
        aiConfig,
        pastQuestions,
        pastQuestions.length > 0 ? pastQuestions : [],
      );
      if (firstList.length === 0) {
        throw new Error("Soru üretilemedi.");
      }

      const firstQuestion = firstList[0];
      setQuizQuestions([firstQuestion]);
      setCurrentQuestionIndex(0);
      setSelectedAnswers(new Array(count).fill(-1));
      setQuizLoading(false);

      if (count > 1) {
        setIsBackgroundLoading(true);
        kpssQuizFlowService
          .fetchQuestionsSubsetFromAI(
            subjectKey,
            topicName,
            count - 1,
            aiConfig,
            [...pastQuestions, firstQuestion],
            pastQuestions.length > 0 ? pastQuestions : [firstQuestion],
          )
          .then((remainingQuestions) => {
            if (remainingQuestions.length > 0) {
              setQuizQuestions((prev) => {
                const updated = [...prev, ...remainingQuestions];
                return updated.slice(0, count);
              });
            }
          })
          .catch((err) => {
            logger.error("Background questions pre-fetch failed:", err);
          })
          .finally(() => {
            setIsBackgroundLoading(false);
          });
      }
    } catch (err: unknown) {
      logger.error("AI quiz generation error:", err);
      setQuizError(t.kpss_quiz_error);
      setQuizLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const handleFinishQuiz = async () => {
    try {
      const { scorePercentage, updatedPastQuizzes } =
        await kpssQuizFlowService.evaluateAndSaveQuizResult({
          currentSubject: currentSubject(),
          activeQuizTopic: activeQuizTopic!,
          quizQuestions,
          selectedAnswers,
          pastQuizzes,
        });

      setQuizResultScore(scorePercentage);
      setQuizStep("result");
      setPastQuizzes(updatedPastQuizzes);
      await onQuizCompleted();
    } catch (err) {
      logger.error(
        "Failed to update status and save stats on quiz completion:",
        err,
      );
    }
  };

  const handleSaveExternalResult = async (correct: number, total: number) => {
    try {
      const { scorePercentage, updatedPastQuizzes } =
        await kpssQuizFlowService.saveExternalQuizResult({
          currentSubject: currentSubject(),
          activeQuizTopic: activeQuizTopic!,
          correctCount: correct,
          totalCount: total,
          pastQuizzes,
        });

      setQuizResultScore(scorePercentage);
      setQuizQuestions([]);
      setSelectedAnswers([]);
      setQuizStep("result");
      setPastQuizzes(updatedPastQuizzes);
      await onQuizCompleted();
    } catch (err) {
      logger.error("Failed to save external quiz result:", err);
    }
  };

  const handleStartQuiz = (topic: string, subject?: string) => {
    const targetSubject = subject || currentSubject();
    if (subject && subject !== currentSubject()) {
      onSubjectChange?.(subject);
    }
    setActiveQuizTopic(topic);
    // Detail modal'ı kapat (çakışmaması için)
    onCloseDetail?.();
    const quizKey = `${targetSubject}_${topic}`;
    const pastQuiz = pastQuizzes[quizKey];
    if (pastQuiz) {
      setQuizQuestions(pastQuiz.questions);
      setSelectedAnswers(pastQuiz.selectedAnswers);
      setQuizResultScore(pastQuiz.score);
      setQuizStep("result");
    } else {
      setQuizStep("intro");
      setSelectedQuizCount(5);
      setQuizQuestions([]);
      setSelectedAnswers([]);
      setQuizError(null);
    }
  };

  const handleStartPastExam = (year: string, subject: string) => {
    const questions = getPastExamQuestions(year, subject);

    if (questions.length === 0) {
      setQuizError(t.kpss_quiz_no_past);
      setQuizStep("questions");
      setActiveQuizTopic(t.kpss_quiz_error_title);
      return;
    }

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setSelectedQuizCount(questions.length);
    setQuizStep("questions");

    const subjectName =
      subject === "all"
        ? t.kpss_subject_mixed
        : subject === "cografya"
          ? t.kpss_subject_geography
          : subject === "tarih"
            ? t.kpss_subject_history
            : "Matematik";

    const yearName = year === "karma" ? t.kpss_exam_mixed_years : year;

    setActiveQuizTopic(`${yearName} KPSS Past Questions (${subjectName})`);
    setQuizLoading(false);
    setIsBackgroundLoading(false);
  };

  const loadPastQuizzes = async () => {
    const loaded = await onLoadPastQuizzes();
    setPastQuizzes(loaded);
  };

  return {
    activeQuizTopic,
    setActiveQuizTopic,
    quizStep,
    setQuizStep,
    selectedQuizCount,
    setSelectedQuizCount,
    quizLoading,
    setQuizLoading,
    isBackgroundLoading,
    quizQuestions,
    setQuizQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswers,
    setSelectedAnswers,
    quizResultScore,
    quizError,
    setQuizError,
    pastQuizzes,
    fetchQuizFromAI,
    handleFinishQuiz,
    handleSaveExternalResult,
    handleStartQuiz,
    handleStartPastExam,
    loadPastQuizzes,
  };
}
