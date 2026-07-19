/**
 * RepositoryContext
 * 
 * Dependency Injection container for infrastructure repositories.
 * Provides clean architecture layer separation by exposing
 * repository interfaces to the application/presentation layers.
 * 
 * In the current incremental migration phase, only ITodoRepository
 * is fully injected. Other repositories will follow in subsequent phases.
 */

import { createContext, type ComponentChildren } from "preact";
import { useContext } from "preact/hooks";
import type { ITodoRepository } from "../../domain/repositories/ITodoRepository.js";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository.js";
import type { ISyncRepository } from "../../domain/repositories/ISyncRepository.js";
import type { INoteRepository } from "../../domain/repositories/INoteRepository.js";
import { ChromeStorageTodoRepository } from "../persistence/ChromeStorageTodoRepository.js";
// import { ChromeStorageSettingsRepository } from "../persistence/ChromeStorageSettingsRepository.js";
// import { ChromeStorageSyncRepository } from "../persistence/ChromeStorageSyncRepository.js";
// import { ChromeStorageNoteRepository } from "../persistence/ChromeStorageNoteRepository.js";

export interface Repositories {
    todoRepository: ITodoRepository;
    settingsRepository: ISettingsRepository;
    syncRepository: ISyncRepository;
    noteRepository: INoteRepository;
}

// Default implementations (currently phased migration - some still use legacy storage)
const defaultRepositories: Repositories = {
    todoRepository: new ChromeStorageTodoRepository(),
    // Lazy-fallback: these still use core/storage internally until fully migrated
    settingsRepository: {
        getSettings: async () => {
            const { storage } = await import("../../core/storage.js");
            const s = await storage.getSettings();
            return {
                lang: s.lang,
                sidebarOpen: s.sidebarOpen ?? true,
                freeGamesNotificationsEnabled: s.freeGamesNotificationsEnabled ?? true,
                calendarNotificationsEnabled: s.calendarNotificationsEnabled ?? true,
                pomoBlockEnabled: s.pomoBlockEnabled ?? true,
                universalInfoBoxEnabled: s.universalInfoBoxEnabled ?? true,
                universalInfoBoxHotkey: s.universalInfoBoxHotkey || "none",
            };
        },
        getSidebarOrder: async () => {
            const { storage } = await import("../../core/storage.js");
            return storage.getSidebarOrder();
        },
        setLang: async (lang) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setLang(lang);
        },
        setSidebarOpen: async (isOpen) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setSidebarOpen(isOpen);
        },
        setSidebarOrder: async (order) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setSidebarOrder(order);
        },
        setFreeGamesNotificationsEnabled: async (enabled) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setFreeGamesNotificationsEnabled(enabled);
        },
        setCalendarNotificationsEnabled: async (enabled) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setCalendarNotificationsEnabled(enabled);
        },
        setPomoBlockEnabled: async (enabled) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setPomoBlockEnabled(enabled);
        },
        setUniversalInfoBox: async (enabled, hotkey) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setUniversalInfoBox(enabled, hotkey);
        },
        clearAll: async (lang) => {
            const { storage } = await import("../../core/storage.js");
            await storage.clearAll(lang);
        },
    },
    syncRepository: {
        getSyncSettings: async () => {
            const { storage } = await import("../../core/storage.js");
            const s = await storage.getSyncSettings();
            return {
                enabled: s.enabled,
                tasksEnabled: s.tasksEnabled,
                calendarEnabled: s.calendarEnabled,
                userEmail: s.userEmail,
                lastSyncedBackup: s.lastSyncedBackup,
            };
        },
        setSyncSettings: async (settings) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setSyncSettings(settings);
        },
    },
    noteRepository: {
        getAll: async () => {
            const { storage } = await import("../../core/storage.js");
            return storage.getNotes() as any;
        },
        saveAll: async (_notes) => {
            const { storage } = await import("../../core/storage.js");
            await storage.setNotes(_notes as any);
        },
    },
};

const RepositoryContext = createContext<Repositories>(defaultRepositories);

export function RepositoryProvider({ children }: { children: ComponentChildren }) {
    return (
        <RepositoryContext.Provider value={defaultRepositories}>
            {children}
        </RepositoryContext.Provider>
    );
}

export function useRepositories(): Repositories {
    return useContext(RepositoryContext);
}

export function useTodoRepository(): ITodoRepository {
    return useContext(RepositoryContext).todoRepository;
}