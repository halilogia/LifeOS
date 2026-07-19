/**
 * IDriveBackupPort Interface
 * Port for backing up and restoring data to/from cloud storage (e.g. Google Drive).
 * Application layer - defines the boundary between application and infrastructure.
 */

export interface IDriveBackupPort {
    backupToDrive(token: string, backupData: Record<string, unknown>): Promise<boolean>;
    restoreFromDrive(token: string): Promise<Record<string, unknown> | null>;
}