/**
 * useAppInit Hook
 * Presentation hook that wraps the application initialization logic.
 * Uses use cases for domain operations instead of direct calls.
 *
 * Dependencies are injected from the composition root (App.tsx) —
 * the hook never instantiates infrastructure directly.
 */

import { useEffect, useCallback } from "preact/hooks";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { ISettingsRepository } from "@/domain/repositories/ISettingsRepository.js";
import type { ITodoSyncPort } from "@/application/ports/ITodoSyncPort.js";
import { ResetRepeatingTodosUseCase } from "@/application/use-cases/todo/ResetRepeatingTodosUseCase.js";
import { SyncGoogleTasksUseCase } from "@/application/use-cases/sync/SyncGoogleTasksUseCase.js";
import { SyncToLocalMigration } from "@/infrastructure/persistence/migrations/SyncToLocalMigration.js";
import { logger } from "@/utils/logger.js";

export interface AppInitDependencies {
  settingsRepo: ISettingsRepository;
  todoRepo: ITodoRepository;
  syncRepo: ISyncRepository;
  syncPort: ITodoSyncPort;
  migration: SyncToLocalMigration;
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

export function useAppInit(
  deps: AppInitDependencies,
  callbacks: AppInitCallbacks,
) {
  const { settingsRepo, todoRepo, syncRepo, syncPort, migration } = deps;

  const initializeApp = useCallback(async () => {
    // 1. Run storage migrations
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
        const syncUC = new SyncGoogleTasksUseCase(todoRepo, syncRepo, syncPort);
        const token = await syncPort.getAuthToken(false);
        const email = await syncPort.getUserEmail(token);
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
