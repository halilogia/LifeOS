/**
 * ExportImportUseCase
 * Application use case for exporting and importing complete Life OS data (including sidebarOrder) as JSON.
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";

export interface ExportResult {
  readonly blob: Blob;
  readonly filename: string;
}

export interface ImportResult {
  readonly success: boolean;
  readonly error?: string;
}

export class ExportImportUseCase {
  constructor(private todoRepo: ITodoRepository) {}

  async exportBackup(): Promise<ExportResult> {
    const syncData = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.sync.get(null, (res) => resolve(res || {}));
    });
    const json = JSON.stringify(syncData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const dateStr = new Date().toISOString().slice(0, 10);
    return {
      blob,
      filename: `lifeos-full-backup-${dateStr}.json`,
    };
  }

  async importBackup(jsonString: string): Promise<ImportResult> {
    try {
      const parsed = JSON.parse(jsonString);

      // 1. Support legacy array format (just list of todos)
      if (Array.isArray(parsed)) {
        const valid = parsed.every(
          (item: unknown) =>
            typeof item === "object" && item !== null && "text" in item,
        );
        if (!valid) {
          return { success: false, error: "Invalid todo format" };
        }
        await this.todoRepo.saveAll(parsed as Todo[]);
        return { success: true };
      }

      // 2. Support full object backup format (including sidebarOrder & settings)
      if (typeof parsed === "object" && parsed !== null) {
        await new Promise<void>((resolve) => {
          chrome.storage.sync.set(parsed, () => resolve());
        });
        if (parsed.todos && Array.isArray(parsed.todos)) {
          await this.todoRepo.saveAll(parsed.todos as Todo[]);
        }
        return { success: true };
      }

      return { success: false, error: "Invalid backup file format" };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  }
}
