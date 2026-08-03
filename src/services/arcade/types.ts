import { GameEntry } from "@/types/game.js";

export interface GamePackage {
  html: string;
  files: Record<string, ArrayBuffer>;
}

export type ImportMode = "dist" | "dev";

export interface ImportResult {
  game: GameEntry;
  mode: ImportMode;
  missingDist: boolean;
}
