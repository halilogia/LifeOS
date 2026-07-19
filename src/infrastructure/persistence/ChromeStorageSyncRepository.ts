/**
 * ChromeStorageSyncRepository
 * Infrastructure implementation of ISyncRepository using chrome.storage.sync.
 * Wraps the existing storage.getSyncSettings/setSyncSettings functions.
 */

import { storage } from "../../core/storage.js";
import type {
    ISyncRepository,
    GoogleSyncSettings,
} from "../../domain/repositories/ISyncRepository.js";

export class ChromeStorageSyncRepository implements ISyncRepository {
    async getSyncSettings(): Promise<GoogleSyncSettings> {
        const settings = await storage.getSyncSettings();
        return {
            enabled: settings.enabled,
            tasksEnabled: settings.tasksEnabled,
            calendarEnabled: settings.calendarEnabled,
            userEmail: settings.userEmail,
            lastSyncedBackup: settings.lastSyncedBackup,
        };
    }

    async setSyncSettings(settings: GoogleSyncSettings): Promise<void> {
        return storage.setSyncSettings(settings as any);
    }
}