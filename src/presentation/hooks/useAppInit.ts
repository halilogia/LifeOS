/**
 * useAppInit Hook
 * Presentation hook that wraps the application initialization logic.
 * Uses use cases for domain operations instead of direct calls.
 */

import { useEffect, useCallback } from "preact/hooks";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import type { RemoteTask } from "@/application/ports/ITodoSyncPort.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/ChromeStorageSyncRepository.js";
import { ChromeStorageSettingsRepository } from "@/infrastructure/persistence/ChromeStorageSettingsRepository.js";
import { GoogleAuthApi } from "@/infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "@/infrastructure/api/GoogleTasksApi.js";
import { ResetRepeatingTodosUseCase } from "@/application/use-cases/todo/ResetRepeatingTodosUseCase.js";
import { SyncGoogleTasksUseCase } from "@/application/use-cases/sync/SyncGoogleTasksUseCase.js";
import { LocalToSyncMigration } from "@/infrastructure/persistence/migrations/LocalToSyncMigration.js";
import { logger } from "@/utils/logger.js";

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
    createTask: (token: string, taskListId: string, task: RemoteTask) =>
      tasksApi.createTask(token, taskListId, task),
    updateTask: (
      token: string,
      taskListId: string,
      taskId: string,
      task: RemoteTask,
    ) => tasksApi.updateTask(token, taskListId, taskId, task),
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
  onTodosLoaded: (todos: readonly Todo[]) => void;
  onSyncSettingsLoaded: (settings: GoogleSyncSettings) => void;
  onGoogleUserEmail: (email: string) => void;
  onSidebarOrderLoaded: (order: string[]) => void;
  onQuoteRefreshed: (lang: Language) => void;
  onClockStarted: () => void;
}

export function useAppInit(callbacks: AppInitCallbacks) {
  const initializeApp = useCallback(async () => {
    const settingsRepo = new ChromeStorageSettingsRepository();
    const todoRepo = new ChromeStorageTodoRepository();
    const syncRepo = new ChromeStorageSyncRepository();

    // 1. Run storage migrations
    const migration = new LocalToSyncMigration();
    await migration.migrate();

    // 2. Load configurations
    const config = await settingsRepo.getSettings();
    callbacks.onSettingsLoaded(config);

    const savedOrder = await settingsRepo.getSidebarOrder();
    callbacks.onSidebarOrderLoaded(savedOrder || []);

    // Apply body class for legacy CSS
    document.body.classList.toggle("sidebar-open", config.sidebarOpen ?? true);

    // 3. Load and clean task items (via use case)
    const resetUC = new ResetRepeatingTodosUseCase(todoRepo);
    const { todos } = await resetUC.execute();
    callbacks.onTodosLoaded(todos);

    // 4. Trigger background task sync if Google Sync is enabled
    const syncConfig = await syncRepo.getSyncSettings();
    callbacks.onSyncSettingsLoaded(syncConfig);

    if (syncConfig.enabled) {
      try {
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
        logger.warn("Silent Google OAuth login failed on startup:", e);
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
