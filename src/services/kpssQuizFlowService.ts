/**
 * kpssQuizFlowService.ts
 * Business logic helper for fetching AI & local quiz questions, evaluating answers, and saving records.
 * Persistence goes through IKpssRepository.
 */

import { Language } from "@/types/types.js";
import { kpssService } from "@/services/kpssService.js";
import { kpssData } from "@/domain/constants/kpssCurriculum.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";
import { getLocalQuestionsForTopic, KpssPastQuiz } from "@/services/kpssQuizService.js";
import { fetchQuestionsSubsetFromAI as fetchQuestionsSubsetFromAI_service, QuizQuestion } from "@/services/kpssAiService.js";
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

    /** Evaluates quiz score, updates topic status, saves past quiz to repo. */
    async evaluateAndSaveQuizResult(params: {
      currentSubject: string;
      activeQuizTopic: string;
      quizQuestions: QuizQuestion[];
      selectedAnswers: number[];
      pastQuizzes: Record<string, KpssPastQuiz>;
    }): Promise<{ scorePercentage: number; updatedPastQuizzes: Record<string, KpssPastQuiz> }> {
      const { currentSubject, activeQuizTopic, quizQuestions, selectedAnswers, pastQuizzes } = params;

      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) { correctCount++; }
      });

      const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);
      const newStatus: 0 | 1 | 2 = scorePercentage >= 80 ? 2 : scorePercentage >= 40 ? 1 : 0;

      const isRegularTopic = (kpssData[currentSubject] || []).some((t) => t.title === activeQuizTopic);
      if (isRegularTopic) {
        await kpssService.updateTopicStatus(currentSubject, activeQuizTopic, newStatus, scorePercentage);
      }

      const quizKey = `${currentSubject}_${activeQuizTopic}`;
      const newQuizRecord: KpssPastQuiz = {
        subject: currentSubject,
        topic: activeQuizTopic,
        score: scorePercentage,
        questions: quizQuestions,
        selectedAnswers: selectedAnswers,
        date: new Date().toISOString().split("T")[0],
      };

      const updatedPastQuizzes = { ...pastQuizzes, [quizKey]: newQuizRecord };

      await kpssRepo.savePastQuizzes(updatedPastQuizzes as unknown as Record<string, unknown>);

      await kpssService.saveKpssDailyStats(quizQuestions.length, 0, currentSubject);

      return { scorePercentage, updatedPastQuizzes };
    },
  };
}

export type KpssQuizFlowService = ReturnType<typeof createKpssQuizFlowService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageKpssRepository } from "@/infrastructure/persistence/ChromeStorageKpssRepository.js";

const _defaultKpssRepo = new ChromeStorageKpssRepository();
const _defaultQuizFlowService = createKpssQuizFlowService(_defaultKpssRepo);

export const kpssQuizFlowService = _defaultQuizFlowService;
