/**
 * kpssQuizService.ts
 * Service module for querying local KPSS past questions archives and handling exam subsets.
 * Clean Architecture - Service Layer.
 */

import { KPSS_YEARLY_DATA } from "@/data/kpss/kpssDataRegistry.js";
import { QuizQuestion } from "@/services/kpssAiService.js";

export interface KpssPastQuiz {
  subject: string;
  topic: string;
  score: number;
  questions: QuizQuestion[];
  selectedAnswers: number[];
  date: string;
}

/**
 * Aggregates questions for a specific topic across yearly exam archives.
 */
export function getLocalQuestionsForTopic(
  subjectKey: string,
  topicName: string,
): QuizQuestion[] {
  const aggregated: QuizQuestion[] = [];
  Object.values(KPSS_YEARLY_DATA).forEach((yearData) => {
    const list = yearData[subjectKey];
    if (Array.isArray(list)) {
      list.forEach((q: unknown) => {
        const quizQ = q as KpssPastQuiz;
        if (quizQ.topic === topicName) {
          aggregated.push(quizQ as unknown as QuizQuestion);
        }
      });
    }
  });
  return aggregated;
}

/**
 * Generates questions list for specific exam year or mixed GY-GK past exams.
 */
export function getPastExamQuestions(
  year: string,
  subject: string,
): QuizQuestion[] {
  let questions: QuizQuestion[] = [];

  if (year === "karma") {
    Object.keys(KPSS_YEARLY_DATA).forEach((y) => {
      const yearData = KPSS_YEARLY_DATA[y];
      if (subject === "all") {
        Object.values(yearData).forEach((list: unknown) => {
          if (Array.isArray(list)) {
            questions.push(...(list as unknown as QuizQuestion[]));
          }
        });
      } else {
        const list = yearData[subject];
        if (Array.isArray(list)) {
          questions.push(...(list as unknown as QuizQuestion[]));
        }
      }
    });
    questions = [...questions].sort(() => Math.random() - 0.5);
  } else {
    const yearData = KPSS_YEARLY_DATA[year];
    if (yearData) {
      if (subject === "all") {
        Object.values(yearData).forEach((list: unknown) => {
          if (Array.isArray(list)) {
            questions.push(...(list as unknown as QuizQuestion[]));
          }
        });
      } else {
        questions = (yearData[subject] || []) as unknown as QuizQuestion[];
      }
    }
  }

  return questions;
}
