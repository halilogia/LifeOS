/**
 * GoogleDriveApi
 * Infrastructure implementation of Google Drive backup/restore operations.
 * Wraps the existing googleSyncService for Drive backup operations.
 * Implements the IDriveBackupPort interface.
 */

import { googleSyncService } from "../../services/googleSyncService.js";
import type { IDriveBackupPort } from "../../application/ports/IDriveBackupPort.js";

export class GoogleDriveApi implements IDriveBackupPort {
    async backupToDrive(
        token: string,
        backupData: Record<string, unknown>,
    ): Promise<boolean> {
        return googleSyncService.backupToDrive(token, backupData);
    }

    async restoreFromDrive(
        token: string,
    ): Promise<Record<string, unknown> | null> {
        return googleSyncService.restoreFromDrive(token);
    }
}