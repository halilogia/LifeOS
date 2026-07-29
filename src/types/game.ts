export type GameCategory = "all" | "playable" | "in_progress" | "favorites";

export type GameStatus = "playable" | "in_progress" | "concept" | "archived";

export interface DevTodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface GameEntry {
  id: string;
  title: string;
  description: string;
  category: "action" | "rpg" | "simulation" | "puzzle" | "arcade" | "casual" | "ai";
  status: GameStatus;
  isBuiltIn?: boolean;
  coverImage?: string; // Data URL or SVG string or external URL
  embedType: "iframe" | "external";
  iframeUrl?: string; // e.g. http://localhost:5173
  devPath?: string; // e.g. C:\Users\emre_\Desktop\GitHub\In Progress\2D şovalye
  techStack?: string[]; // e.g. ['Canvas', 'Preact', 'Phaser', 'Three.js']
  highScore: number;
  playCount: number;
  totalPlayTimeSeconds: number;
  lastPlayedAt?: string;
  isFavorite?: boolean;
  devNotes?: string;
  todoList?: DevTodoItem[];
  createdAt: string;
}
