export type WordStatus = 'new' | 'learning' | 'learned';
export type ReviewQuality = 'hard' | 'medium' | 'easy';

export interface WordReviewData {
  wordId: string;
  wordType: 'vocabulary' | 'verb' | 'phrasal' | 'idiom';
  status: WordStatus;
  nextReviewDate: string;
  lastReviewDate: string;
  reviewCount: number;
  easeFactor: number;
  interval: number;
  correctCount: number;
  incorrectCount: number;
}

export interface ReviewSession {
  date: string;
  wordsReviewed: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  timeSpentMs: number;
}

export interface DictionaryCategory {
  partOfSpeech: string;
  translations: string[];
}

export interface Word {
  id: string;
  word: string;
  level: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
  derivatives: string[];
  class?: string;
  pronunciation?: string;
  audio?: string;
  meaning?: string;
  antonyms?: string[];
  categories?: DictionaryCategory[];
  v1?: string;
  v2?: string;
  v3?: string;
  freq?: number;
  isSeparable?: boolean;
}

export interface WordCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  words: Word[];
}
