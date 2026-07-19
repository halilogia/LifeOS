/**
 * BackupToDriveUseCase
 *
 * Application use case for backing up all application data to Google Drive.
 * Collects data from repositories and delegates upload to the drive port.
 */

import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "../../ports/IDriveBackupPort.js";
import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";

export class BackupToDriveUseCase {
    constructor(
        private syncRepo: ISyncRepository,
        private drivePort: IDriveBackupPort,
        private todoRepo: ITodoRepository,
    ) {}

    async execute(): Promise<void> {
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (!syncSettings.enabled) return;

        // Get auth token from chrome.identity via chrome.storage cached token
        const token = await this.getAuthToken();

        // Gather all backup data from chrome.storage.sync directly
        const allData = await new Promise<Record<string, unknown>>((resolve) => {
            chrome.storage.sync.get(null, (result) => {
                resolve(result as Record<string, unknown>);
            });
        });

        await this.drivePort.backupToDrive(token, allData);
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