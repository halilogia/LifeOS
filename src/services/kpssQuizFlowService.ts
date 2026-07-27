/**
 * kpssQuizFlowService.ts
 * Business logic helper for fetching AI & local quiz questions, evaluating answers, and saving records.
 */

import { Language } from "@/types/types.js";
import { kpssService } from "@/services/kpssService.js";
import { kpssData } from "@/domain/constants/kpssCurriculum.js";
import { SUBJECT_NAMES } from "@/domain/constants/kpssConstants.js";
import {
  getLocalQuestionsForTopic,
  KpssPastQuiz,
} from "@/services/kpssQuizService.js";
import {
  fetchQuestionsSubsetFromAI as fetchQuestionsSubsetFromAI_service,
  QuizQuestion,
} from "@/services/kpssAiService.js";

export interface AIConfig {
  aiProvider: string;
  aiModel: string;
  aiApiKey: string;
  aiEndpoint: string;
  lang: Language;
}

export const kpssQuizFlowService = {
  /**
   * Fetches questions subset from AI service wrapper.
   */
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
   * Evaluates quiz score percentage, updates topic status if regular topic,
   * saves past quiz record to local storage, and appends daily stats.
   */
  async evaluateAndSaveQuizResult(params: {
    currentSubject: string;
    activeQuizTopic: string;
    quizQuestions: QuizQuestion[];
    selectedAnswers: number[];
    pastQuizzes: Record<string, KpssPastQuiz>;
  }): Promise<{ scorePercentage: number; updatedPastQuizzes: Record<string, KpssPastQuiz> }> {
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

    let newStatus: 0 | 1 | 2;
    if (scorePercentage >= 80) {
      newStatus = 2;
    } else if (scorePercentage >= 40) {
      newStatus = 1;
    } else {
      newStatus = 0;
    }

    const isRegularTopic = (kpssData[currentSubject] || []).some(
      (t) => t.title === activeQuizTopic,
    );

    if (isRegularTopic) {
      await kpssService.updateTopicStatus(
        currentSubject,
        activeQuizTopic,
        newStatus,
        scorePercentage,
      );
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

    const updatedPastQuizzes = {
      ...pastQuizzes,
      [quizKey]: newQuizRecord,
    };

    chrome.storage.local.set({ kpss_past_quizzes: updatedPastQuizzes });

    await kpssService.saveKpssDailyStats(
      quizQuestions.length,
      0,
      currentSubject,
    );

    return { scorePercentage, updatedPastQuizzes };
  },
};
