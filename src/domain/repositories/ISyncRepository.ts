/**
 * ISyncRepository Interface
 * Repository pattern for Google Sync settings persistence.
 * Domain layer - no external dependencies, pure interface.
 */

export interface GoogleSyncSettings {
    readonly enabled: boolean;
    readonly tasksEnabled: boolean;
    readonly calendarEnabled: boolean;
    readonly userEmail?: string;
    readonly lastSyncedBackup?: number;
}

export interface ISyncRepository {
    getSyncSettings(): Promise<GoogleSyncSettings>;
    setSyncSettings(settings: GoogleSyncSettings): Promise<void>;
}