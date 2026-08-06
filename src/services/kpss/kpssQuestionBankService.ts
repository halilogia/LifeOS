/**
 * kpssQuestionBankService.ts
 * Service for the KPSS personal question bank:
 *  - Wrong questions (yanlışlarım): automatically collected after each quiz.
 *  - Collection (koleksiyonum): user-saved questions via the 📥 button.
 *
 * Local-first: chrome.storage.local (10MB). Cloud sync is opt-in via Drive backup.
 */

import type { QuizQuestion } from "@/services/kpss/kpssAiService.js";

const WRONG_KEY = "kpssWrongQuestions";
const COLLECTION_KEY = "kpssCollection";

/** Stable dedupe id from question text (first 120 chars normalized). */
export function questionKey(q: QuizQuestion): string {
  const normalized = q.question.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized.slice(0, 120);
}

function readList(key: string): Promise<QuizQuestion[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (res) => {
      resolve((res[key] as QuizQuestion[]) || []);
    });
  });
}

function writeList(key: string, list: QuizQuestion[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: list }, () => resolve());
  });
}

/** Merge new questions into a list, deduped by questionKey. */
function mergeDeduped(
  existing: QuizQuestion[],
  incoming: QuizQuestion[],
): QuizQuestion[] {
  const seen = new Set(existing.map(questionKey));
  const added: QuizQuestion[] = [];
  for (const q of incoming) {
    const k = questionKey(q);
    if (!seen.has(k)) {
      seen.add(k);
      added.push(q);
    }
  }
  return [...existing, ...added];
}

/* ------------------------------------------------------------------ */
/* Yanlış Sorular                                                      */
/* ------------------------------------------------------------------ */

export function getWrongQuestions(): Promise<QuizQuestion[]> {
  return readList(WRONG_KEY);
}

/**
 * Adds wrong questions to the bank (deduped). Returns updated list.
 */
export async function addWrongQuestions(
  questions: QuizQuestion[],
): Promise<QuizQuestion[]> {
  if (questions.length === 0) {
    return readList(WRONG_KEY);
  }
  const existing = await readList(WRONG_KEY);
  const merged = mergeDeduped(existing, questions);
  await writeList(WRONG_KEY, merged);
  return merged;
}

/** Removes a question from the wrong-questions bank (by key). */
export async function removeWrongQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  const existing = await readList(WRONG_KEY);
  const k = questionKey(q);
  const filtered = existing.filter((item) => questionKey(item) !== k);
  await writeList(WRONG_KEY, filtered);
  return filtered;
}

/* ------------------------------------------------------------------ */
/* Koleksiyon (📥 kayıtlı sorular)                                     */
/* ------------------------------------------------------------------ */

export function getCollection(): Promise<QuizQuestion[]> {
  return readList(COLLECTION_KEY);
}

/** Toggles a question in/out of the collection. Returns updated list. */
export async function toggleCollectionQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  const existing = await readList(COLLECTION_KEY);
  const k = questionKey(q);
  const has = existing.some((item) => questionKey(item) === k);
  if (has) {
    const filtered = existing.filter((item) => questionKey(item) !== k);
    await writeList(COLLECTION_KEY, filtered);
    return filtered;
  }
  const merged = mergeDeduped(existing, [q]);
  await writeList(COLLECTION_KEY, merged);
  return merged;
}

/** Removes a question from the collection (by key). */
export async function removeCollectionQuestion(
  q: QuizQuestion,
): Promise<QuizQuestion[]> {
  const existing = await readList(COLLECTION_KEY);
  const k = questionKey(q);
  const filtered = existing.filter((item) => questionKey(item) !== k);
  await writeList(COLLECTION_KEY, filtered);
  return filtered;
}
