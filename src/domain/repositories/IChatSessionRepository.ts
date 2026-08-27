/**
 * IChatSessionRepository.ts
 * Repository contract for persisting and managing AI chat conversation sessions.
 * Domain Layer — Pure interface.
 */

import type { ChatSession } from "@/services/aichat/types.js";

export interface IChatSessionRepository {
  /** Retrieves all saved sessions, optionally filtered by scope ("sidepanel" | "newtab"). */
  getAllSessions(scope?: "sidepanel" | "newtab"): Promise<ChatSession[]>;

  /** Retrieves a specific chat session by its unique ID. */
  getSession(sessionId: string): Promise<ChatSession | null>;

  /** Saves or updates a chat session. */
  saveSession(session: ChatSession): Promise<void>;

  /** Deletes a chat session by ID. */
  deleteSession(sessionId: string): Promise<void>;

  /** Renames a chat session title. */
  renameSession(sessionId: string, newTitle: string): Promise<void>;
}
