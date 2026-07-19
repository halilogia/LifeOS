/**
 * useAppInit Hook
 * Presentation hook that wraps the application initialization logic.
 * Currently wraps the existing App.tsx useEffect initialization for future migration.
 */

import { useEffect, useCallback } from "preact/hooks";
import type { Language } from "../../domain/value-objects/Language.js";
import { storage } from "../../core/storage.js";
import { googleSyncService } from "../../services/googleSyncService.js";
import { checkAndResetRepeatingTasks } from "../../domain/services/TaskService.js";
import { ChromeStorageTodoRepository } from "../../infrastructure/persistence/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "../../infrastructure/persistence/ChromeStorageSyncRepository.js";
import { GoogleAuthApi } from "../../infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "../../infrastructure/api/GoogleTasksApi.js";
import { SyncGoogleTasksUseCase } from "../../application/use-cases/sync/SyncGoogleTasksUseCase.js";

function createSyncPort() {
    const tasksApi = new GoogleTasksApi();
    const authApi = new GoogleAuthApi();
    return {
        getAuthToken: (interactive: boolean) => authApi.getAuthToken(interactive),
        getUserEmail: (token: string) => authApi.getUserEmail(token),
        getOrCreateTaskList: (token: string, title: string) =>
            tasksApi.getOrCreateTaskList(token, title),
        getTasks: (token: string, taskListId: string) =>
            tasksApi.getTasks(token, taskListId),
        createTask: (token: string, taskListId: string, task: any) =>
            tasksApi.createTask(token, taskListId, task),
        updateTask: (token: string, taskListId: string, taskId: string, task: any) =>
            tasksApi.updateTask(token, taskListId, taskId, task),
        deleteTask: (token: string, taskListId: string, taskId: string) =>
            tasksApi.deleteTask(token, taskListId, taskId),
        removeCachedAuthToken: (token: string) =>
            authApi.removeCachedAuthToken(token),
    };
}

export interface AppInitCallbacks {
    onSettingsLoaded: (config: {
        lang: Language;
        sidebarOpen: boolean;
        freeGamesNotificationsEnabled: boolean;
        calendarNotificationsEnabled: boolean;
        pomoBlockEnabled: boolean;
        universalInfoBoxEnabled: boolean;
        universalInfoBoxHotkey: string;
    }) => void;
    onTodosLoaded: (todos: any[]) => void;
    onSyncSettingsLoaded: (settings: any) => void;
    onGoogleUserEmail: (email: string) => void;
    onSidebarOrderLoaded: (order: string[]) => void;
    onQuoteRefreshed: (lang: Language) => void;
    onClockStarted: () => void;
}

export function useAppInit(callbacks: AppInitCallbacks) {
    const initializeApp = useCallback(async () => {
        // 1. Run storage migrations
        await storage.migrateLocalToSync();

        // 2. Load configurations
        const config = await storage.getSettings();
        callbacks.onSettingsLoaded(config as any);

        const savedOrder = await storage.getSidebarOrder();
        callbacks.onSidebarOrderLoaded(savedOrder || []);

        // Apply body class for legacy CSS
        document.body.classList.toggle(
            "sidebar-open",
            config.sidebarOpen ?? true,
        );

        // 3. Load and clean task items
        const loadedTodos = await storage.getTodos();
        const clone = JSON.parse(JSON.stringify(loadedTodos));
        const hasResets = checkAndResetRepeatingTasks(clone as any);
        if (hasResets.modified) {
            await storage.setTodos(hasResets.todos as any);
            callbacks.onTodosLoaded(hasResets.todos as any);
        } else {
            callbacks.onTodosLoaded(loadedTodos);
        }

        // 4. Trigger background task sync if Google Sync is enabled
        const syncConfig = await storage.getSyncSettings();
        callbacks.onSyncSettingsLoaded(syncConfig);

        if (syncConfig.enabled) {
            try {
                const todoRepo = new ChromeStorageTodoRepository();
                const syncRepo = new ChromeStorageSyncRepository();
                const syncPort = createSyncPort();
                const syncUC = new SyncGoogleTasksUseCase(todoRepo, syncRepo, syncPort);

                const authApi = new GoogleAuthApi();
                const token = await authApi.getAuthToken(false);
                const email = await authApi.getUserEmail(token);
                callbacks.onGoogleUserEmail(email);

                if (syncConfig.tasksEnabled) {
                    await syncUC.execute();
                }
            } catch (e) {
                console.warn("Silent Google OAuth login failed on startup:", e);
            }
        }

        // 5. Set quote
        callbacks.onQuoteRefreshed(config.lang);
    }, []);

    useEffect(() => {
        initializeApp();

        // Setup clock ticking interval
        const clockInterval = setInterval(callbacks.onClockStarted, 1000);
        callbacks.onClockStarted();

        return () => clearInterval(clockInterval);
    }, []);

    return { initializeApp };
}