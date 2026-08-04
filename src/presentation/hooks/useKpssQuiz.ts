import { useState, useEffect } from "preact/hooks";
import {
  kpssQuizFlowService,
  AIConfig,
} from "@/services/kpss/kpssQuizFlowService.js";
import {
  getPastExamQuestions,
  KpssPastQuiz,
} from "@/services/kpss/kpssQuizService.js";
import { QuizQuestion } from "@/services/kpss/kpssAiService.js";
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
  // Birikimli başarı: konuda çözülen toplam soru / doğru (min 100 soru + %80 şartı)
  const [cumulative, setCumulative] = useState<{
    totalQuestions: number;
    totalCorrect: number;
  }>({ totalQuestions: 0, totalCorrect: 0 });

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
      // GeÃ§miÅŸte Ã§Ã¶zÃ¼len AI sorularÄ± (pastQuizzes) â€” tekrar sorulmamasÄ± iÃ§in exclude
      const quizKey = `${subjectKey}_${topicName}`;
      const pastQuiz = pastQuizzes[quizKey];
      const pastQuestions: QuizQuestion[] = pastQuiz?.questions ?? [];

      // Ä°lk soru AI'dan beklenir (boÅŸ ekran gÃ¶rÃ¼nmez), kalanlar arka planda Ã¼retilir
      const firstList = await kpssQuizFlowService.fetchQuestionsSubsetFromAI(
        subjectKey,
        topicName,
        1,
        aiConfig,
        pastQuestions,
        pastQuestions.length > 0 ? pastQuestions : [],
      );
      if (firstList.length === 0) {
        throw new Error("Soru Ã¼retilemedi.");
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
      const {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: cum,
      } = await kpssQuizFlowService.evaluateAndSaveQuizResult({
        currentSubject: currentSubject(),
        activeQuizTopic: activeQuizTopic!,
        quizQuestions,
        selectedAnswers,
        pastQuizzes,
      });

      setQuizResultScore(scorePercentage);
      setCumulative(cum);
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
      const {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: cum,
      } = await kpssQuizFlowService.saveExternalQuizResult({
        currentSubject: currentSubject(),
        activeQuizTopic: activeQuizTopic!,
        correctCount: correct,
        totalCount: total,
        pastQuizzes,
      });

      setQuizResultScore(scorePercentage);
      setCumulative(cum);
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
    // Detail modal'ını kapat
    onCloseDetail?.();
    setQuizStep("intro");
    setSelectedQuizCount(5);
    setQuizQuestions([]);
    setSelectedAnswers([]);
    setQuizError(null);
    setCumulative({ totalQuestions: 0, totalCorrect: 0 });
  };

  const handleStartPastExam = (
    year: string,
    subject: string,
    countLimit?: number,
    selectedChapter?: string,
  ) => {
    const questions = getPastExamQuestions(
      year,
      subject,
      countLimit,
      selectedChapter,
    );

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

    const yearName =
      year === "karma"
        ? t.kpss_exam_mixed_years || "Karma Deneme"
        : year === "tarih_arsivi"
          ? `Tarih Soru Arşivi (${selectedChapter && selectedChapter !== "all" ? selectedChapter : "Tüm Üniteler"})`
          : year;

    setActiveQuizTopic(`${yearName} (${questions.length} Soru)`);
    setQuizLoading(false);
    setIsBackgroundLoading(false);
  };

  const handleReviewPastQuiz = async (topic: string, subject?: string) => {
    const targetSubject = subject || currentSubject();
    if (subject && subject !== currentSubject()) {
      onSubjectChange?.(subject);
    }
    setActiveQuizTopic(topic);
    onCloseDetail?.();
    const quizKey = `${targetSubject}_${topic}`;
    // Esnek quizKey araması (Tam eşleşme veya normalize eşleşme)
    let pastQuiz = pastQuizzes[quizKey];
    if (!pastQuiz) {
      const normTopic = topic.toLowerCase().trim();
      const matchedKey = Object.keys(pastQuizzes).find((k) => {
        const [s, t] = k.split("_");
        return s === targetSubject && t && t.toLowerCase().trim() === normTopic;
      });
      if (matchedKey) {
        pastQuiz = pastQuizzes[matchedKey];
      }
    }

    // Cumulative verisini veritabanından çek
    let rec:
      | { totalQuestions?: number; totalCorrect?: number; score?: number }
      | undefined;
    try {
      const progressList = await kpssQuizFlowService.getKpssProgress();
      rec = progressList.find(
        (p) => p.subject === targetSubject && p.topic === topic,
      );
      setCumulative({
        totalQuestions: rec?.totalQuestions ?? 0,
        totalCorrect: rec?.totalCorrect ?? 0,
      });
    } catch {
      // fallback
    }

    if (pastQuiz) {
      setQuizQuestions(pastQuiz.questions || []);
      setSelectedAnswers(pastQuiz.selectedAnswers || []);
      setQuizResultScore(pastQuiz.score);
      setQuizStep("result");
    } else if (
      rec &&
      ((rec.totalQuestions ?? 0) > 0 ||
        (rec.score !== undefined && rec.score > 0))
    ) {
      // Eğer geçmiş sınav kaydı detay soru içermiyorsa ama konu çözülmüşse yine de Sonuç/İnceleme ekranını aç
      setQuizQuestions([]);
      setSelectedAnswers([]);
      setQuizResultScore(rec.score ?? 0);
      setQuizStep("result");
    } else {
      setQuizStep("intro");
      setSelectedQuizCount(5);
      setQuizQuestions([]);
      setSelectedAnswers([]);
    }
  };

  const loadPastQuizzes = async () => {
    const loaded = await onLoadPastQuizzes();
    setPastQuizzes(loaded);
  };

  // Başlangıçta geçmiş testleri yükle — aynı konuya tekrar girilince sonuç/sorular görünsün
  useEffect(() => {
    void loadPastQuizzes();
  }, []);

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
    cumulative,
    fetchQuizFromAI,
    handleFinishQuiz,
    handleSaveExternalResult,
    handleStartQuiz,
    handleReviewPastQuiz,
    handleStartPastExam,
    loadPastQuizzes,
  };
}
