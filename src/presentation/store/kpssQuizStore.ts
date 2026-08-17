/**
 * useKpssQuiz store
 * Zustand singleton — KPSS quiz state machine (intro/questions/result) + past exams,
 * collection, cumulative progress. Callback dependencies (currentSubject, t, aiConfig,
 * completion hooks) are injected via configure() from the component, since the hook
 * historically received them as props.
 */

import { create } from "zustand";
import {
  kpssQuizFlowService,
  AIConfig,
} from "@/services/kpss/kpssQuizFlowService.js";
import {
  getPastExamQuestions,
  KpssPastQuiz,
} from "@/services/kpss/kpssQuizService.js";
import {
  getCollection,
  toggleCollectionQuestion,
  questionKey,
  getWrongQuestions,
} from "@/services/kpss/kpssQuestionBankService.js";
import { QuizQuestion } from "@/services/kpss/kpssAiService.js";
import { logger } from "@/utils/logger.js";

export interface KpssQuizCallbacks {
  currentSubject: () => string;
  t: Record<string, string>;
  aiConfig: AIConfig;
  onQuizCompleted: () => Promise<void> | void;
  onLoadPastQuizzes: () => Promise<Record<string, KpssPastQuiz>>;
  onSubjectChange?: (subject: string) => void;
  onCloseDetail?: () => void;
}

type QuizStep = "intro" | "questions" | "result";

interface KpssQuizState {
  // State
  activeQuizTopic: string | null;
  setActiveQuizTopic: (v: string | null) => void;
  quizStep: QuizStep;
  setQuizStep: (v: QuizStep) => void;
  selectedQuizCount: number;
  setSelectedQuizCount: (v: number) => void;
  quizLoading: boolean;
  setQuizLoading: (v: boolean) => void;
  isBackgroundLoading: boolean;
  quizQuestions: QuizQuestion[];
  setQuizQuestions: (v: QuizQuestion[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (v: number) => void;
  selectedAnswers: number[];
  setSelectedAnswers: (v: number[]) => void;
  quizResultScore: number;
  quizError: string | null;
  setQuizError: (v: string | null) => void;
  pastQuizzes: Record<string, KpssPastQuiz>;
  cumulative: { totalQuestions: number; totalCorrect: number };
  collectionKeys: Set<string>;
  currentQuestionInCollection: boolean;

  // Callback injection
  configure: (c: KpssQuizCallbacks) => void;

  // Actions
  fetchQuizFromAI: (
    subjectKey: string,
    topicName: string,
    count: number,
  ) => Promise<void>;
  handleFinishQuiz: () => Promise<void>;
  handleSaveExternalResult: (correct: number, total: number) => Promise<void>;
  handleStartQuiz: (topic: string, subject?: string) => void;
  handleStartPastExam: (
    year: string,
    subject: string,
    countLimit?: number,
    selectedChapter?: string,
  ) => Promise<void>;
  handleReviewPastQuiz: (topic: string, subject?: string) => Promise<void>;
  loadPastQuizzes: () => Promise<void>;
  loadCollection: () => Promise<void>;
  handleToggleCollection: (q: QuizQuestion) => Promise<void>;
}

let cb: KpssQuizCallbacks | null = null;

export const useKpssQuizStore = create<KpssQuizState>()((set, get) => ({
  activeQuizTopic: null,
  quizStep: "intro",
  selectedQuizCount: 5,
  quizLoading: false,
  isBackgroundLoading: false,
  quizQuestions: [],
  currentQuestionIndex: 0,
  selectedAnswers: [],
  quizResultScore: 0,
  quizError: null,
  pastQuizzes: {},
  cumulative: { totalQuestions: 0, totalCorrect: 0 },
  collectionKeys: new Set<string>(),
  currentQuestionInCollection: false,

  configure: (c) => {
    cb = c;
  },

  setActiveQuizTopic: (v) => set({ activeQuizTopic: v }),
  setQuizStep: (v) => set({ quizStep: v }),
  setSelectedQuizCount: (v) => set({ selectedQuizCount: v }),
  setQuizLoading: (v) => set({ quizLoading: v }),
  setQuizQuestions: (v) => set({ quizQuestions: v }),
  setCurrentQuestionIndex: (v) => set({ currentQuestionIndex: v }),
  setSelectedAnswers: (v) => set({ selectedAnswers: v }),
  setQuizError: (v) => set({ quizError: v }),

  fetchQuizFromAI: async (subjectKey, topicName, count) => {
    const c = cb;
    if (!c) {
      return;
    }
    const state = get();
    set({
      quizLoading: true,
      isBackgroundLoading: false,
      quizError: null,
      quizStep: "questions",
      quizQuestions: [],
    });

    try {
      const quizKey = `${subjectKey}_${topicName}`;
      const pastQuiz = state.pastQuizzes[quizKey];
      const pastQuestions: QuizQuestion[] = pastQuiz?.questions ?? [];

      const firstList = await kpssQuizFlowService.fetchQuestionsSubsetFromAI(
        subjectKey,
        topicName,
        1,
        c.aiConfig,
        pastQuestions,
        pastQuestions.length > 0 ? pastQuestions : [],
      );
      if (firstList.length === 0) {
        throw new Error("Soru üretilemedi.");
      }

      const firstQuestion = firstList[0];
      set({
        quizQuestions: [firstQuestion],
        currentQuestionIndex: 0,
        selectedAnswers: new Array(count).fill(-1),
        quizLoading: false,
      });

      if (count > 1) {
        set({ isBackgroundLoading: true });
        kpssQuizFlowService
          .fetchQuestionsSubsetFromAI(
            subjectKey,
            topicName,
            count - 1,
            c.aiConfig,
            [...pastQuestions, firstQuestion],
            pastQuestions.length > 0 ? pastQuestions : [firstQuestion],
          )
          .then((remainingQuestions) => {
            if (remainingQuestions.length > 0) {
              const updated = [...get().quizQuestions, ...remainingQuestions];
              set({ quizQuestions: updated.slice(0, count) });
            }
          })
          .catch((err) => {
            logger.error("Background questions pre-fetch failed:", err);
          })
          .finally(() => {
            set({ isBackgroundLoading: false });
          });
      }
    } catch (err: unknown) {
      logger.error("AI quiz generation error:", err);
      set({
        quizError: c.t.kpss_quiz_error,
        quizLoading: false,
        isBackgroundLoading: false,
      });
    }
  },

  handleFinishQuiz: async () => {
    const c = cb;
    if (!c) {
      return;
    }
    const state = get();
    try {
      const {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: cum,
      } = await kpssQuizFlowService.evaluateAndSaveQuizResult({
        currentSubject: c.currentSubject(),
        activeQuizTopic: state.activeQuizTopic!,
        quizQuestions: state.quizQuestions,
        selectedAnswers: state.selectedAnswers,
        pastQuizzes: state.pastQuizzes,
      });

      set({
        quizResultScore: scorePercentage,
        cumulative: cum,
        quizStep: "result",
        pastQuizzes: updatedPastQuizzes,
      });
      await c.onQuizCompleted();
    } catch (err) {
      logger.error(
        "Failed to update status and save stats on quiz completion:",
        err,
      );
    }
  },

  handleSaveExternalResult: async (correct, total) => {
    const c = cb;
    if (!c) {
      return;
    }
    const state = get();
    try {
      const {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: cum,
      } = await kpssQuizFlowService.saveExternalQuizResult({
        currentSubject: c.currentSubject(),
        activeQuizTopic: state.activeQuizTopic!,
        correctCount: correct,
        totalCount: total,
        pastQuizzes: state.pastQuizzes,
      });

      set({
        quizResultScore: scorePercentage,
        cumulative: cum,
        quizQuestions: [],
        selectedAnswers: [],
        quizStep: "result",
        pastQuizzes: updatedPastQuizzes,
      });
      await c.onQuizCompleted();
    } catch (err) {
      logger.error("Failed to save external quiz result:", err);
    }
  },

  handleStartQuiz: (topic, subject) => {
    const c = cb;
    if (!c) {
      return;
    }
    if (subject && subject !== c.currentSubject()) {
      c.onSubjectChange?.(subject);
    }
    c.onCloseDetail?.();
    set({
      activeQuizTopic: topic,
      quizStep: "intro",
      selectedQuizCount: 5,
      quizQuestions: [],
      selectedAnswers: [],
      quizError: null,
      cumulative: { totalQuestions: 0, totalCorrect: 0 },
    });
  },

  handleStartPastExam: async (year, subject, countLimit, selectedChapter) => {
    const c = cb;
    if (!c) {
      return;
    }
    let questions: QuizQuestion[];

    if (year === "yanlis") {
      const wrongList = await getWrongQuestions();
      questions = [...wrongList].sort(() => Math.random() - 0.5);
      if (countLimit && countLimit > 0 && questions.length > countLimit) {
        questions = questions.slice(0, countLimit);
      }
    } else if (year === "koleksiyon") {
      const collection = await getCollection();
      questions = [...collection].sort(() => Math.random() - 0.5);
      if (countLimit && countLimit > 0 && questions.length > countLimit) {
        questions = questions.slice(0, countLimit);
      }
    } else {
      questions = await getPastExamQuestions(
        year,
        subject,
        countLimit,
        selectedChapter,
      );
    }

    if (questions.length === 0) {
      set({
        quizError: c.t.kpss_quiz_no_past,
        quizStep: "questions",
        activeQuizTopic: c.t.kpss_quiz_error_title,
      });
      return;
    }

    const yearName =
      year === "karma"
        ? c.t.kpss_exam_mixed_years || "Karma Deneme"
        : year === "tarih_arsivi" || year === "tarih_arsivi54"
          ? `Tarih Soru Arşivi (${selectedChapter && selectedChapter !== "all" ? selectedChapter : "Tüm Üniteler"})`
          : year === "yanlis"
            ? c.t.kpss_past_exams_wrong || "Yanlışlarım"
            : year === "koleksiyon"
              ? c.t.kpss_koleksiyon_cap || "Koleksiyonum"
              : year;

    set({
      quizQuestions: questions,
      currentQuestionIndex: 0,
      selectedAnswers: new Array(questions.length).fill(-1),
      selectedQuizCount: questions.length,
      quizStep: "questions",
      activeQuizTopic: `${yearName} (${questions.length} Soru)`,
      quizLoading: false,
      isBackgroundLoading: false,
    });
  },

  handleReviewPastQuiz: async (topic, subject) => {
    const c = cb;
    if (!c) {
      return;
    }
    const targetSubject = subject || c.currentSubject();
    if (subject && subject !== c.currentSubject()) {
      c.onSubjectChange?.(subject);
    }
    c.onCloseDetail?.();
    const quizKey = `${targetSubject}_${topic}`;
    let pastQuiz = get().pastQuizzes[quizKey];
    if (!pastQuiz) {
      const normTopic = topic.toLowerCase().trim();
      const matchedKey = Object.keys(get().pastQuizzes).find((k) => {
        const [s, t] = k.split("_");
        return s === targetSubject && t && t.toLowerCase().trim() === normTopic;
      });
      if (matchedKey) {
        pastQuiz = get().pastQuizzes[matchedKey];
      }
    }

    let rec:
      | { totalQuestions?: number; totalCorrect?: number; score?: number }
      | undefined;
    try {
      const progressList = await kpssQuizFlowService.getKpssProgress();
      rec = progressList.find(
        (p) => p.subject === targetSubject && p.topic === topic,
      );
      set({
        cumulative: {
          totalQuestions: rec?.totalQuestions ?? 0,
          totalCorrect: rec?.totalCorrect ?? 0,
        },
      });
    } catch {
      // fallback
    }

    if (pastQuiz) {
      set({
        quizQuestions: pastQuiz.questions || [],
        selectedAnswers: pastQuiz.selectedAnswers || [],
        quizResultScore: pastQuiz.score,
        quizStep: "result",
        activeQuizTopic: topic,
      });
    } else if (
      rec &&
      ((rec.totalQuestions ?? 0) > 0 ||
        (rec.score !== undefined && rec.score > 0))
    ) {
      set({
        quizQuestions: [],
        selectedAnswers: [],
        quizResultScore: rec.score ?? 0,
        quizStep: "result",
        activeQuizTopic: topic,
      });
    } else {
      set({
        quizStep: "intro",
        selectedQuizCount: 5,
        quizQuestions: [],
        selectedAnswers: [],
        activeQuizTopic: topic,
      });
    }
  },

  loadPastQuizzes: async () => {
    const c = cb;
    if (!c) {
      return;
    }
    const loaded = await c.onLoadPastQuizzes();
    set({ pastQuizzes: loaded });
  },

  loadCollection: async () => {
    const list = await getCollection();
    set({ collectionKeys: new Set(list.map(questionKey)) });
  },

  handleToggleCollection: async (q) => {
    const updated = await toggleCollectionQuestion(q);
    set({ collectionKeys: new Set(updated.map(questionKey)) });
  },
}));

// Derived selector: is the current question in the collection?
export function useCurrentQuestionInCollection() {
  return useKpssQuizStore((s) => {
    const q = s.quizQuestions[s.currentQuestionIndex];
    return q !== undefined ? s.collectionKeys.has(questionKey(q)) : false;
  });
}
