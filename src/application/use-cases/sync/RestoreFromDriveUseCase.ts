/**
 * RestoreFromDriveUseCase
 * Application use case for restoring all data (including sidebarOrder) from Google Drive backup.
 */

import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "@/application/ports/IDriveBackupPort.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "@/domain/repositories/INoteRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Note } from "@/types/types.js";
import { logger } from "@/utils/logger.js";

export interface RestoreResult {
  readonly restored: boolean;
  readonly data?: Record<string, unknown>;
}

export class RestoreFromDriveUseCase {
  constructor(
    private syncRepo: ISyncRepository,
    private drivePort: IDriveBackupPort,
    private todoRepo?: ITodoRepository,
    private noteRepo?: INoteRepository,
  ) {}

  async execute(): Promise<RestoreResult> {
    const syncSettings = await this.syncRepo.getSyncSettings();
    if (!syncSettings.enabled) {
      return { restored: false };
    }

    try {
      const token = await this.getAuthToken();
      const restored = await this.drivePort.restoreFromDrive(token);

      if (!restored) {
        return { restored: false };
      }

      // MERGE: combine Drive backup with current local data instead of
      // blindly overwriting. Newer local todos/notes (created after the
      // backup) must survive a restore. Arrays are merged by unique id,
      // scalars use the backup value only when the local key is absent.
      const [localTodos, localNotes] = await Promise.all([
        this.todoRepo ? this.todoRepo.getAll() : Promise.resolve([] as Todo[]),
        this.noteRepo ? this.noteRepo.getAll() : Promise.resolve([] as Note[]),
      ]);

      // Todos: merge by id — Drive wins on conflicts, local extras kept
      if (Array.isArray(restored.todos)) {
        const mergedTodos = new Map<string, Todo>();
        for (const t of restored.todos as Todo[]) {
          if (t && t.id) {
            mergedTodos.set(t.id, t);
          }
        }
        for (const t of localTodos) {
          if (t && t.id && !mergedTodos.has(t.id)) {
            mergedTodos.set(t.id, t); // local-only todo survives
          }
        }
        restored.todos = Array.from(mergedTodos.values());
      }

      // Notes: merge by id — same strategy
      if (Array.isArray(restored.notes)) {
        const mergedNotes = new Map<string, Note>();
        for (const n of restored.notes as Note[]) {
          if (n && n.id) {
            mergedNotes.set(n.id, n);
          }
        }
        for (const n of localNotes) {
          if (n && n.id && !mergedNotes.has(n.id)) {
            mergedNotes.set(n.id, n);
          }
        }
        restored.notes = Array.from(mergedNotes.values());
      }

      // Save all restored keys (including sidebarOrder) directly to chrome.storage.sync
      await new Promise<void>((resolve) => {
        chrome.storage.sync.set(restored, () => resolve());
      });

      // Restore data to repositories if available
      if (restored.todos && this.todoRepo) {
        await this.todoRepo.saveAll(restored.todos as Todo[]);
      }
      if (restored.notes && this.noteRepo) {
        await this.noteRepo.saveAll(restored.notes as Note[]);
      }

      return { restored: true, data: restored };
    } catch (e) {
      logger.error("Restore from Drive failed:", e);
      return { restored: false };
    }
  }

  private async getAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(
            new Error(chrome.runtime.lastError?.message ?? "No auth token"),
          );
        } else {
          resolve(token as string);
        }
      });
    });
  }
}
