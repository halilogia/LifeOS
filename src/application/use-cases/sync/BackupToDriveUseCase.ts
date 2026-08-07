/**
 * BackupToDriveUseCase
 *
 * Application use case for backing up all application data to Google Drive.
 * Collects data from repositories and delegates upload to the drive port.
 */

import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "@/application/ports/IDriveBackupPort.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import { stripTransientKeys } from "@/utils/cloudBackup.js";

export class BackupToDriveUseCase {
  constructor(
    private syncRepo: ISyncRepository,
    private drivePort: IDriveBackupPort,
    private todoRepo?: ITodoRepository,
  ) {}

  async execute(): Promise<void> {
    // Manual/auto backup always proceeds; syncSettings.enabled gates only
    // the *automatic* trigger, not an explicit user action.
    const token = await this.getAuthToken();

    // Gather all backup data from chrome.storage.local directly
    const allData = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result as Record<string, unknown>);
      });
    });

    // Drop transient/cache keys (log ring buffer, 5-min caches) so the
    // backup file carries only real user data.
    await this.drivePort.backupToDrive(token, stripTransientKeys(allData));
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
