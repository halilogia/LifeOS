/**
 * IQuestionBankRepository.ts
 * Domain repository interface for KPSS question bank (wrong questions + collection).
 */

import type { QuizQuestion } from "@/services/kpss/kpssAiService.js";

export interface IQuestionBankRepository {
  /** Get all wrong questions. */
  getWrongQuestions(): Promise<QuizQuestion[]>;
  /** Add wrong questions (deduped). Returns updated list. */
  addWrongQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]>;
  /** Remove a wrong question by key. Returns updated list. */
  removeWrongQuestion(q: QuizQuestion): Promise<QuizQuestion[]>;
  /** Get all collected questions. */
  getCollection(): Promise<QuizQuestion[]>;
  /** Toggle a question in/out of collection. Returns updated list. */
  toggleCollectionQuestion(q: QuizQuestion): Promise<QuizQuestion[]>;
  /** Remove a question from collection by key. Returns updated list. */
  removeCollectionQuestion(q: QuizQuestion): Promise<QuizQuestion[]>;
  /** Generate stable dedupe key from question. */
  questionKey(q: QuizQuestion): string;
}
