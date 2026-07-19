/**
 * ChromeStorageSettingsRepository
 * Infrastructure implementation of ISettingsRepository using chrome.storage.sync.
 * Wraps the existing storage functions.
 */

import { storage } from "../../core/storage.js";
import type {
    ISettingsRepository,
    AppSettings,
} from "../../domain/repositories/ISettingsRepository.js";
import type { Language } from "../../domain/value-objects/Language.js";

export class ChromeStorageSettingsRepository implements ISettingsRepository {
    async getSettings(): Promise<AppSettings> {
        const config = await storage.getSettings();
        return {
            lang: config.lang,
            sidebarOpen: config.sidebarOpen ?? true,
            freeGamesNotificationsEnabled:
                config.freeGamesNotificationsEnabled ?? true,
            calendarNotificationsEnabled:
                config.calendarNotificationsEnabled ?? true,
            pomoBlockEnabled: config.pomoBlockEnabled ?? true,
            universalInfoBoxEnabled: config.universalInfoBoxEnabled ?? true,
            universalInfoBoxHotkey: config.universalInfoBoxHotkey || "none",
        };
    }

    async setLang(lang: Language): Promise<void> {
        return storage.setLang(lang);
    }

    async setSidebarOpen(isOpen: boolean): Promise<void> {
        return storage.setSidebarOpen(isOpen);
    }

    async setFreeGamesNotificationsEnabled(enabled: boolean): Promise<void> {
        return storage.setFreeGamesNotificationsEnabled(enabled);
    }

    async setCalendarNotificationsEnabled(enabled: boolean): Promise<void> {
        return storage.setCalendarNotificationsEnabled(enabled);
    }

    async setPomoBlockEnabled(enabled: boolean): Promise<void> {
        return storage.setPomoBlockEnabled(enabled);
    }

    async setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void> {
        return storage.setUniversalInfoBox(enabled, hotkey);
    }

    async clearAll(lang: Language): Promise<void> {
        return storage.clearAll(lang);
    }
}