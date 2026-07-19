/**
 * BackupToDriveUseCase
 * Application use case for backing up all data to Google Drive.
 */

import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "../../ports/IDriveBackupPort.js";
import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { INoteRepository } from "../../../domain/repositories/INoteRepository.js";

export interface BackupData {
    readonly todos: unknown;
    readonly notes: unknown;
    readonly lang: string;
    [key: string]: unknown;
}

export class BackupToDriveUseCase {
    constructor(
        private syncRepo: ISyncRepository,
        private drivePort: IDriveBackupPort,
        private todoRepo?: ITodoRepository,
        private noteRepo?: INoteRepository,
    ) { }

    async execute(additionalData?: Record<string, unknown>): Promise<boolean> {
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (!syncSettings.enabled) return false;

        try {
            const token = await this.getAuthToken();
            const allData: Record<string, unknown> = {
                ...additionalData,
            };

            if (this.todoRepo) {
                allData.todos = await this.todoRepo.getAll();
            }
            if (this.noteRepo) {
                allData.notes = await this.noteRepo.getAll();
            }

            const result = await this.drivePort.backupToDrive(token, allData);

            if (result) {
                await this.syncRepo.setSyncSettings({
                    ...syncSettings,
                    lastSyncedBackup: Date.now(),
                });
            }

            return result;
        } catch (e) {
            console.error("Backup to Drive failed:", e);
            return false;
        }
    }

    private async getAuthToken(): Promise<string> {
        // This will be overridden when infrastructure is connected
        throw new Error("Auth token retrieval not implemented - connect infrastructure layer");
    }
}