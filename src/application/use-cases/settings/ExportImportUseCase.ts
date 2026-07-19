/**
 * ExportImportUseCase
 * Application use case for exporting and importing todo data as JSON.
 */

import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { Todo } from "../../../domain/entities/Todo.js";

export interface ExportResult {
    readonly blob: Blob;
    readonly filename: string;
}

export interface ImportResult {
    readonly success: boolean;
    readonly error?: string;
}

export class ExportImportUseCase {
    constructor(private todoRepo: ITodoRepository) { }

    async exportBackup(): Promise<ExportResult> {
        const dataList = await this.todoRepo.getAll();
        const json = JSON.stringify(dataList, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const dateStr = new Date().toISOString().slice(0, 10);
        return {
            blob,
            filename: `zentodo-backup-${dateStr}.json`,
        };
    }

    async importBackup(jsonString: string): Promise<ImportResult> {
        try {
            const parsed = JSON.parse(jsonString);
            if (!Array.isArray(parsed)) {
                return { success: false, error: "Invalid format: expected an array" };
            }

            // Basic validation: each item should have at least a text field
            const valid = parsed.every(
                (item: unknown) =>
                    typeof item === "object" &&
                    item !== null &&
                    "text" in item,
            );

            if (!valid) {
                return { success: false, error: "Invalid todo format" };
            }

            await this.todoRepo.saveAll(parsed as Todo[]);
            return { success: true };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            return { success: false, error: errMsg };
        }
    }
}