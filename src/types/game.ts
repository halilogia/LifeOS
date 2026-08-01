export type GameCategory = "all" | "playable" | "in_progress" | "favorites";

export type GameStatus = "playable" | "in_progress" | "concept" | "archived";

export type ImportMode = "dist" | "dev";

export interface DevTodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface GameEntry {
  id: string;
  title: string;
  description: string;
  category:
    "action" | "rpg" | "simulation" | "puzzle" | "arcade" | "casual" | "ai";
  status: GameStatus;
  coverImage?: string;
  folderPath: string;
  handleId: string;
  entryHTMLPath?: string;
  mode: ImportMode;
  techStack?: string[];
  isFavorite?: boolean;
  devNotes?: string;
  todoList?: DevTodoItem[];
  createdAt: string;
}
