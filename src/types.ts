export interface Todo {
  text: string;
  completed: boolean;
  status: "todo" | "in-progress" | "done";
  repeat: "none" | "daily" | "weekly" | "monthly";
  category: string;
  lastCompletedDate: string | null;
}

export type Language = "tr" | "en";

export interface HifizItem {
  id: string;
  title: string;
  category: "ayat" | "surahs" | "duas" | "juz30";
  description?: string;
  url?: string;
}

export interface HifizProgress {
  itemId: string;
  status: "not_started" | "in_progress" | "memorized";
  lastUpdated: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt: string;
}
