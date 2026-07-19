/**
 * ChromeStorageSettingsRepository
 * Infrastructure implementation of ISettingsRepository using chrome.storage.sync
 * directly (not wrapping legacy storage.ts).
 */

import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository.js";
import type { Language } from "../../domain/value-objects/Language.js";

export class ChromeStorageSettingsRepository implements ISettingsRepository {
    async getSettings(): Promise<{
        lang: Language;
        sidebarOpen: boolean;
        freeGamesNotificationsEnabled: boolean;
        calendarNotificationsEnabled: boolean;
        pomoBlockEnabled: boolean;
        universalInfoBoxEnabled: boolean;
        universalInfoBoxHotkey: string;
    }> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(
                [
                    "lang",
                    "sidebarOpen",
                    "freeGamesNotificationsEnabled",
                    "calendarNotificationsEnabled",
                    "pomoBlockEnabled",
                    "universalInfoBoxEnabled",
                    "universalInfoBoxHotkey",
                ],
                (result: any) => {
                    resolve({
                        lang: (result.lang as Language) || "tr",
                        sidebarOpen: result.sidebarOpen ?? true,
                        freeGamesNotificationsEnabled:
                            result.freeGamesNotificationsEnabled ?? true,
                        calendarNotificationsEnabled:
                            result.calendarNotificationsEnabled ?? true,
                        pomoBlockEnabled: result.pomoBlockEnabled ?? true,
                        universalInfoBoxEnabled:
                            result.universalInfoBoxEnabled ?? true,
                        universalInfoBoxHotkey:
                            result.universalInfoBoxHotkey || "none",
                    });
                },
            );
        });
    }

    async setLang(lang: Language): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ lang }, resolve);
        });
    }

    async setSidebarOpen(isOpen: boolean): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ sidebarOpen: isOpen }, resolve);
        });
    }

    async setFreeGamesNotificationsEnabled(enabled: boolean): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ freeGamesNotificationsEnabled: enabled }, resolve);
        });
    }

    async setCalendarNotificationsEnabled(enabled: boolean): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ calendarNotificationsEnabled: enabled }, resolve);
        });
    }

    async setPomoBlockEnabled(enabled: boolean): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ pomoBlockEnabled: enabled }, resolve);
        });
    }

    async setUniversalInfoBox(enabled: boolean, hotkey: string): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(
                { universalInfoBoxEnabled: enabled, universalInfoBoxHotkey: hotkey },
                resolve,
            );
        });
    }

    async clearAll(lang: Language): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.clear(() => {
                chrome.storage.sync.set({ lang }, resolve);
            });
        });
    }
}