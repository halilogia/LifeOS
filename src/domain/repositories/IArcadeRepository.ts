/**
 * IArcadeRepository Interface
 * Repository pattern for Arcade game data persistence.
 * Covers chrome.storage, IndexedDB (directory handles), and legacy sync migration.
 * Domain layer — pure interface.
 */

import type { GameEntry } from "@/types/game.js";

export interface IArcadeRepository {
  /** Load game entries from local persistent storage. */
  getAllGames(): Promise<GameEntry[]>;

  /** Persist the full game list. */
  saveAllGames(games: GameEntry[]): Promise<void>;

  /**
   * Attempt to load games from legacy chrome.storage.sync.
   * Returns null when there is nothing to migrate.
   */
  loadLegacySyncGames(): Promise<GameEntry[] | null>;

  /** Retrieve a stored FileSystemDirectoryHandle by its id. Returns null if missing. */
  getDirectoryHandle(handleId: string): Promise<unknown | null>;

  /** Persist a FileSystemDirectoryHandle by its id. */
  saveDirectoryHandle(handleId: string, handle: unknown): Promise<void>;

  /** Remove a stored directory handle. */
  deleteDirectoryHandle(handleId: string): Promise<void>;
}
