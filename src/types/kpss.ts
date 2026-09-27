/**
 * kpss.ts
 * Type definitions for KPSS study tracker features.
 * Shared between service layer, components, and repositories.
 */

export interface KpssWikiNote {
  id: string;
  title: string;
  subject: "tarih" | "cografya" | "vatandaslik" | "turkce" | "matematik";
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeadingItem {
  text: string;
  level: number;
  noteId?: string;
}

export interface KpssPastQuiz {
  subject: string;
  topic: string;
  score: number;
  questions: unknown[];
  selectedAnswers: number[];
  date: string;
}
