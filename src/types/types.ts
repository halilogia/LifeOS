export interface Todo {
  text: string;
  completed: boolean;
  status: "todo" | "in-progress" | "done";
  repeat: "none" | "daily" | "weekly" | "monthly";
  category: string;
  lastCompletedDate: string | null;
  completedDates?: string[];
}

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
}
export interface KpssProgress {
  subject: string;
  topic: string;
  status: 0 | 1 | 2; // 0: reset, 1: working, 2: finished
}

export interface CustomQuote {
  text: string;
  author?: string;
}

export interface KpssDailyStats {
  date: string;
  questions: number;
  subject: string;
}

