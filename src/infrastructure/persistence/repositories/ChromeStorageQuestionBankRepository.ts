/**
 * ChromeStorageQuestionBankRepository.ts
 * Infrastructure implementation of IQuestionBankRepository using chrome.storage.local.
 */

import { IQuestionBankRepository } from "@/domain/repositories/IQuestionBankRepository.js";
import type { QuizQuestion } from "@/services/kpss/kpssAiService.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

const WRONG_KEY = "kpssWrongQuestions";
const COLLECTION_KEY = "kpssCollection";

function readList(key: string): Promise<QuizQuestion[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (res) => {
      resolve((res[key] as QuizQuestion[]) || []);
    });
  });
}

function writeList(key: string, list: QuizQuestion[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: list }, () => {
      scheduleCloudBackup();
      resolve();
    });
  });
}

function questionKey(q: QuizQuestion): string {
  const normalized = q.question.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized.slice(0, 120);
}

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

export class ChromeStorageQuestionBankRepository implements IQuestionBankRepository {
  questionKey = questionKey;

  async getWrongQuestions(): Promise<QuizQuestion[]> {
    return readList(WRONG_KEY);
  }

  async addWrongQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
    if (questions.length === 0) {
      return readList(WRONG_KEY);
    }
    const existing = await readList(WRONG_KEY);
    const merged = mergeDeduped(existing, questions);
    await writeList(WRONG_KEY, merged);
    return merged;
  }

  async removeWrongQuestion(q: QuizQuestion): Promise<QuizQuestion[]> {
    const existing = await readList(WRONG_KEY);
    const k = questionKey(q);
    const filtered = existing.filter((item) => questionKey(item) !== k);
    await writeList(WRONG_KEY, filtered);
    return filtered;
  }

  async getCollection(): Promise<QuizQuestion[]> {
    return readList(COLLECTION_KEY);
  }

  async toggleCollectionQuestion(q: QuizQuestion): Promise<QuizQuestion[]> {
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

  async removeCollectionQuestion(q: QuizQuestion): Promise<QuizQuestion[]> {
    const existing = await readList(COLLECTION_KEY);
    const k = questionKey(q);
    const filtered = existing.filter((item) => questionKey(item) !== k);
    await writeList(COLLECTION_KEY, filtered);
    return filtered;
  }
}
