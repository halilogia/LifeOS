/**
 * RestoreFromDriveUseCase
 * Application use case for restoring all data from Google Drive backup.
 */

import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "../../ports/IDriveBackupPort.js";
import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "../../../domain/repositories/INoteRepository.js";

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
    ) { }

    async execute(): Promise<RestoreResult> {
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (!syncSettings.enabled) {return { restored: false };}

        try {
            const token = await this.getAuthToken();
            const restored = await this.drivePort.restoreFromDrive(token);

            if (!restored) {
                return { restored: false };
            }

            // Restore data to repositories if available
            if (restored.todos && this.todoRepo) {
                await this.todoRepo.saveAll(restored.todos as any);
            }
            if (restored.notes && this.noteRepo) {
                await this.noteRepo.saveAll(restored.notes as any);
            }

            return { restored: true, data: restored };
        } catch (e) {
            console.error("Restore from Drive failed:", e);
            return { restored: false };
        }
    }

    private async getAuthToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError || !token) {
                    reject(new Error(chrome.runtime.lastError?.message ?? "No auth token"));
                } else {
                    resolve(token as string);
                }
            });
        });
    }
}