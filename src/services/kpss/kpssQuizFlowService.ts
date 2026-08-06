/**
 * kpssQuizFlowService.ts
 * Business logic helper for fetching AI & local quiz questions, evaluating answers, and saving records.
 * Persistence goes through IKpssRepository.
 */

import { Language } from "@/types/types.js";
import { kpssService } from "@/services/kpss/kpssService.js";
import { kpssData } from "@/domain/constants/kpssCurriculum.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";
import {
  KpssPastQuiz,
  KpssPastQuizSession,
} from "@/services/kpss/kpssQuizService.js";
import { fetchQuestionsSubsetFromAI as fetchQuestionsSubsetFromAI_service } from "@/services/kpss/kpssAiService.js";
import { QuizQuestion } from "@/services/kpss/kpssAiService.js";
import { addWrongQuestions } from "@/services/kpss/kpssQuestionBankService.js";
import type { IKpssRepository } from "@/domain/repositories/IKpssRepository.js";

export interface AIConfig {
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  aiEndpoint: string;
  lang: Language;
}

export function createKpssQuizFlowService(kpssRepo: IKpssRepository) {
  return {
    getKpssProgress() {
      return kpssService.getKpssProgress();
    },
    /** Fetches questions subset from AI service wrapper. */
    fetchQuestionsSubsetFromAI(
      subjectKey: string,
      topicName: string,
      count: number,
      config: AIConfig,
      excludeQuestions: QuizQuestion[] = [],
      fewShotExamples: QuizQuestion[] = [],
    ): Promise<QuizQuestion[]> {
      return fetchQuestionsSubsetFromAI_service(
        subjectKey,
        topicName,
        count,
        {
          aiProvider: config.aiProvider,
          aiModel: config.aiModel,
          aiApiKey: config.aiApiKey,
          aiEndpoint: config.aiEndpoint,
          lang: config.lang,
          SUBJECT_NAMES,
        },
        excludeQuestions,
        fewShotExamples,
      );
    },

    /**
     * Saves result from an externally-taken quiz (Gemini, ChatGPT, Claude…).
     * No question array — only correct / total counts and score are persisted.
     */
    async saveExternalQuizResult(params: {
      currentSubject: string;
      activeQuizTopic: string;
      correctCount: number;
      totalCount: number;
      pastQuizzes: Record<string, KpssPastQuiz>;
    }): Promise<{
      scorePercentage: number;
      updatedPastQuizzes: Record<string, KpssPastQuiz>;
      cumulative: { totalQuestions: number; totalCorrect: number };
    }> {
      const {
        currentSubject,
        activeQuizTopic,
        correctCount,
        totalCount,
        pastQuizzes,
      } = params;

      const scorePercentage =
        totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const newStatus: 0 | 1 | 2 =
        scorePercentage >= 80 ? 2 : scorePercentage >= 40 ? 1 : 0;

      const isRegularTopic = (kpssData[currentSubject] || []).some(
        (t) => t.title === activeQuizTopic,
      );
      if (isRegularTopic) {
        await kpssService.updateTopicStatus(
          currentSubject,
          activeQuizTopic,
          newStatus,
          scorePercentage,
          correctCount,
          totalCount,
        );
      }

      const quizKey = `${currentSubject}_${activeQuizTopic}`;
      const existingRecord = pastQuizzes[quizKey];
      const existingHistory: KpssPastQuizSession[] = existingRecord?.history
        ? [...existingRecord.history]
        : existingRecord?.questions && existingRecord.questions.length > 0
          ? [
              {
                id: "sess_1",
                date:
                  existingRecord.date || new Date().toISOString().split("T")[0],
                questionCount: existingRecord.questions.length,
                score: existingRecord.score,
                questions: existingRecord.questions,
                selectedAnswers: existingRecord.selectedAnswers,
                mode: "local",
              },
            ]
          : [];

      const newSession: KpssPastQuizSession = {
        id: `sess_${Date.now()}`,
        date: `${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
        questionCount: totalCount,
        score: scorePercentage,
        questions: [],
        selectedAnswers: [],
        mode: "external",
      };

      const updatedHistory = [...existingHistory, newSession];
      const newQuizRecord: KpssPastQuiz = {
        subject: currentSubject,
        topic: activeQuizTopic,
        score: scorePercentage,
        questions: [],
        selectedAnswers: [],
        date: new Date().toISOString().split("T")[0],
        history: updatedHistory,
      };

      const updatedPastQuizzes = { ...pastQuizzes, [quizKey]: newQuizRecord };
      await kpssRepo.savePastQuizzes(
        updatedPastQuizzes as unknown as Record<string, unknown>,
      );
      await kpssService.saveKpssDailyStats(totalCount, 0, currentSubject);

      const progressList = await kpssService.getKpssProgress();
      const rec = progressList.find(
        (p) => p.subject === currentSubject && p.topic === activeQuizTopic,
      );

      return {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: {
          totalQuestions: rec?.totalQuestions ?? 0,
          totalCorrect: rec?.totalCorrect ?? 0,
        },
      };
    },

    /** Evaluates quiz score, updates topic status (cumulative), saves past quiz to repo. */
    async evaluateAndSaveQuizResult(params: {
      currentSubject: string;
      activeQuizTopic: string;
      quizQuestions: QuizQuestion[];
      selectedAnswers: number[];
      pastQuizzes: Record<string, KpssPastQuiz>;
    }): Promise<{
      scorePercentage: number;
      updatedPastQuizzes: Record<string, KpssPastQuiz>;
      cumulative: { totalQuestions: number; totalCorrect: number };
    }> {
      const {
        currentSubject,
        activeQuizTopic,
        quizQuestions,
        selectedAnswers,
        pastQuizzes,
      } = params;

      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });

      const scorePercentage = Math.round(
        (correctCount / quizQuestions.length) * 100,
      );
      const newStatus: 0 | 1 | 2 =
        scorePercentage >= 80 ? 2 : scorePercentage >= 40 ? 1 : 0;

      const isRegularTopic = (kpssData[currentSubject] || []).some(
        (t) => t.title === activeQuizTopic,
      );
      if (isRegularTopic) {
        await kpssService.updateTopicStatus(
          currentSubject,
          activeQuizTopic,
          newStatus,
          scorePercentage,
          correctCount,
          quizQuestions.length,
        );
      }

      const quizKey = `${currentSubject}_${activeQuizTopic}`;
      const existingRecord = pastQuizzes[quizKey];
      const existingHistory: KpssPastQuizSession[] = existingRecord?.history
        ? [...existingRecord.history]
        : existingRecord?.questions && existingRecord.questions.length > 0
          ? [
              {
                id: "sess_1",
                date:
                  existingRecord.date || new Date().toISOString().split("T")[0],
                questionCount: existingRecord.questions.length,
                score: existingRecord.score,
                questions: existingRecord.questions,
                selectedAnswers: existingRecord.selectedAnswers,
                mode: "local",
              },
            ]
          : [];

      const newSession: KpssPastQuizSession = {
        id: `sess_${Date.now()}`,
        date: `${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
        questionCount: quizQuestions.length,
        score: scorePercentage,
        questions: quizQuestions,
        selectedAnswers: selectedAnswers,
        mode: "local",
      };

      const updatedHistory = [...existingHistory, newSession];
      const newQuizRecord: KpssPastQuiz = {
        subject: currentSubject,
        topic: activeQuizTopic,
        score: scorePercentage,
        questions: quizQuestions,
        selectedAnswers: selectedAnswers,
        date: new Date().toISOString().split("T")[0],
        history: updatedHistory,
      };

      const updatedPastQuizzes = { ...pastQuizzes, [quizKey]: newQuizRecord };

      await kpssRepo.savePastQuizzes(
        updatedPastQuizzes as unknown as Record<string, unknown>,
      );

      // ❌ Yanlışları otomatik kaydet (local-first soru bankası)
      const wrongQuestions: QuizQuestion[] = quizQuestions.filter(
        (q, idx) => selectedAnswers[idx] !== q.correctAnswer,
      );
      if (wrongQuestions.length > 0) {
        await addWrongQuestions(wrongQuestions);
      }

      await kpssService.saveKpssDailyStats(
        quizQuestions.length,
        0,
        currentSubject,
      );

      // Birikimli istatistiği döndür (sonuç ekranında göstermek için)
      const progressList = await kpssService.getKpssProgress();
      const rec = progressList.find(
        (p) => p.subject === currentSubject && p.topic === activeQuizTopic,
      );

      return {
        scorePercentage,
        updatedPastQuizzes,
        cumulative: {
          totalQuestions: rec?.totalQuestions ?? 0,
          totalCorrect: rec?.totalCorrect ?? 0,
        },
      };
    },
  };
}

export type KpssQuizFlowService = ReturnType<typeof createKpssQuizFlowService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageKpssRepository } from "@/infrastructure/persistence/repositories/ChromeStorageKpssRepository.js";

const _defaultKpssRepo = new ChromeStorageKpssRepository();
const _defaultQuizFlowService = createKpssQuizFlowService(_defaultKpssRepo);

export const kpssQuizFlowService = _defaultQuizFlowService;
