/**
 * kpssQuestionBankService.ts
 * Service for the KPSS personal question bank:
 *  - Wrong questions (yanlışlarım): automatically collected after each quiz.
 *  - Collection (koleksiyonum): user-saved questions via the 📥 button.
 *
 * Uses IQuestionBankRepository — chrome.storage calls moved to infrastructure.
 */

import { IQuestionBankRepository } from "@/domain/repositories/IQuestionBankRepository.js";
import { ChromeStorageQuestionBankRepository } from "@/infrastructure/persistence/repositories/ChromeStorageQuestionBankRepository.js";
import type { QuizQuestion } from "@/services/kpss/kpssAiService.js";

const defaultRepo = new ChromeStorageQuestionBankRepository();
const repo: IQuestionBankRepository = defaultRepo;

function getRepo(): IQuestionBankRepository {
  return repo;
}

/** Stable dedupe id from question text (first 120 chars normalized). */
export function questionKey(q: QuizQuestion): string {
  return getRepo().questionKey(q);
}

/* ------------------------------------------------------------------ */
/* Yanlış Sorular                                                      */
/* ------------------------------------------------------------------ */

export function getWrongQuestions(): Promise<QuizQuestion[]> {
  return getRepo().getWrongQuestions();
}

/**
 * Adds wrong questions to the bank (deduped). Returns updated list.
 */
export async function addWrongQuestions(
  questions: QuizQuestion[],
): Promise<QuizQuestion[]> {
  return getRepo().addWrongQuestions(questions);
}

/** Removes a question from the wrong-questions bank (by key). */
export async function removeWrongQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  return getRepo().removeWrongQuestion(q);
}

/* ------------------------------------------------------------------ */
/* Koleksiyon (📥 kayıtlı sorular)                                     */
/* ------------------------------------------------------------------ */

export function getCollection(): Promise<QuizQuestion[]> {
  return getRepo().getCollection();
}

/** Toggles a question in/out of the collection. Returns updated list. */
export async function toggleCollectionQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  return getRepo().toggleCollectionQuestion(q);
}

/** Removes a question from the collection (by key). */
export async function removeCollectionQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  return getRepo().removeCollectionQuestion(q);
}
