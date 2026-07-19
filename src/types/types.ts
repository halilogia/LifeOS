// Re-export domain entity so existing code can still import from types/types.ts
export type { Todo } from "../domain/entities/Todo.js";

export type Language = "tr" | "en";

export interface HifizItem {
  id: string;
  title: string;
  category: "surahs" | "duas";
  level: "basic" | "advanced";
  totalPages?: number;
  pages?: number[];
  description?: string;
  url?: string;
}

export interface HifizProgress {
  itemId: string;
  status: "not_started" | "in_progress" | "memorized";
  pageStatuses?: ("not_started" | "in_progress" | "memorized")[];
  lastUpdated: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt: string;
  type?: "note" | "diary" | "cornell";
  cues?: string;
  summary?: string;
}
export interface KpssProgress {
  subject: string;
  topic: string;
  status: 0 | 1 | 2; // 0: reset, 1: working, 2: finished
  score?: number; // test percentage score (0-100)
}

export interface CustomQuote {
  text: string;
  author?: string;
}

export interface KpssDailyStats {
  date: string;
  questions: number;
  subject: string;
  videos?: number;
}

export interface WillpowerStreak {
  startDate: string;
  bestStreakDays: number;
  history: {
    startDate: string;
    endDate: string;
    days: number;
    note?: string;
  }[];
}

export interface PomodoroLog {
  id: string;
  startTime: string; // ISO date
  endTime: string;   // ISO date
  duration: number;  // in seconds
  mode: "focus" | "short" | "long";
  note?: string;
  element: "bonsai" | "koi" | "pagoda" | "lantern" | "bamboo" | "pebble";
  position: number;  // 0-24 grid position
}