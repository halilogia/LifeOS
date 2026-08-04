/**
 * kpss.ts
 * Type definitions for KPSS study tracker features.
 * Shared between service layer, components, and repositories.
 */

import type { RepeatType } from "@/domain/value-objects/RepeatType.js";

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

export interface KpssExamConfig {
  examType: "kpss" | "e-kpss" | "a grubu" | "dgs" | "tus" | "dus" | "yds";
  maxQuestions: number;
  durationMinutes: number;
}

export interface KpssExamRecord {
  id: string;
  examType: KpssExamConfig["examType"];
  date: string;
  subjectScores: Record<string, number>;
  totalNet: number;
  totalScore: number;
  notes?: string;
}

export interface KpssQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface KpssSession {
  id: string;
  subject: string;
  topic: string;
  startTime: string;
  duration: number;
  questions: string[];
  answers: number[];
}
