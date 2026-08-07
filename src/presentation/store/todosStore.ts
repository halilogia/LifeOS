/**
 * useTodos store
 * Zustand singleton — todo list state + CRUD via application-layer use cases.
 * Instantiates its own repository/sync deps (singleton); App.tsx historically injected
 * a separate instance — both write the same chrome.storage, so behaviour is equivalent.
 * Hook file stays as a facade; consumer components are untouched.
 */

import { create } from "zustand";
import type { Todo } from "@/domain/entities/Todo.js";
import type { Language } from "@/domain/value-objects/Language.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/repositories/ChromeStorageTodoRepository.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSyncRepository.js";
import { createSyncPort } from "@/application/ports/createSyncPort.js";
import { GoogleDriveApi } from "@/infrastructure/api/GoogleDriveApi.js";
import { AddTodoUseCase } from "@/application/use-cases/todo/AddTodoUseCase.js";
import { ToggleTodoUseCase } from "@/application/use-cases/todo/ToggleTodoUseCase.js";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/DeleteTodoUseCase.js";
import { MoveTaskUseCase } from "@/application/use-cases/todo/MoveTaskUseCase.js";
import { UpdatePrioritiesUseCase } from "@/application/use-cases/todo/UpdatePrioritiesUseCase.js";
import { ResetRepeatingTodosUseCase } from "@/application/use-cases/todo/ResetRepeatingTodosUseCase.js";
import { BackupToDriveUseCase } from "@/application/use-cases/sync/BackupToDriveUseCase.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { useSettingsStore } from "@/presentation/store/settingsStore.js";
import { getTranslation } from "@/utils/i18n.js";

const todoRepo = new ChromeStorageTodoRepository();
const syncRepo = new ChromeStorageSyncRepository();
const syncPort = createSyncPort();

const resetUC = new ResetRepeatingTodosUseCase(todoRepo);
const addUC = new AddTodoUseCase(todoRepo, syncRepo, syncPort);
const toggleUC = new ToggleTodoUseCase(todoRepo, syncRepo, syncPort);
const deleteUC = new DeleteTodoUseCase(todoRepo, syncRepo, syncPort);
const moveUC = new MoveTaskUseCase(todoRepo, syncRepo, syncPort);
const updatePriorityUC = new UpdatePrioritiesUseCase(todoRepo);
const backupUC = new BackupToDriveUseCase(syncRepo, new GoogleDriveApi(), todoRepo);

async function triggerCloudBackup(): Promise<void> {
  const settings = await syncRepo.getSyncSettings();
  if (settings.enabled) {
    try {
      await backupUC.execute();
    } catch {
      /* cloud backup is best-effort on todo mutations */
    }
  }
}

interface TodoState {
  todos: Todo[];
  setTodos: (t: Todo[]) => void;
  refreshTodos: () => Promise<Todo[]>;
  initTodos: () => Promise<Todo[]>;
  handleAddTodo: (text: string, repeat: Todo["repeat"], dueDate?: string) => Promise<void>;
  handleToggleTodo: (index: number) => Promise<void>;
  handleDeleteTodo: (index: number) => Promise<void>;
  handleMoveTaskStatus: (index: number, status: Todo["status"]) => Promise<void>;
  handleMoveTaskDirection: (index: number, direction: 1 | -1) => Promise<void>;
  handleUpdateTodoUrgentImportant: (index: number, urgent: boolean, important: boolean) => Promise<void>;
  handleExportBackup: () => Promise<void>;
  handleImportBackup: (e: Event) => Promise<void>;
}

export const useTodosStore = create<TodoState>()((set, get) => ({
  todos: [],
  setTodos: (t): void => set({ todos: t }),

  refreshTodos: async () => {
    const loaded = await todoRepo.getAll();
    set({ todos: loaded });
    return loaded;
  },

  initTodos: async () => {
    const { todos } = await resetUC.execute();
    set({ todos: todos as Todo[] });
    await triggerCloudBackup();
    return todos as Todo[];
  },

  handleAddTodo: async (text, repeat, dueDate) => {
    await addUC.execute({ text, repeat, dueDate });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleToggleTodo: async (index) => {
    await toggleUC.execute({ index });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleDeleteTodo: async (index) => {
    await deleteUC.execute({ index });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleMoveTaskStatus: async (index, newStatus) => {
    await moveUC.moveToStatus({ index, newStatus });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleMoveTaskDirection: async (index, direction) => {
    await moveUC.moveByDirection({ index, direction });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleUpdateTodoUrgentImportant: async (originalIndex, urgent, important) => {
    await updatePriorityUC.execute({ originalIndex, urgent, important });
    await get().refreshTodos();
    await triggerCloudBackup();
  },

  handleExportBackup: async () => {
    const dataList = await todoRepo.getAll();
    const blob = new Blob([JSON.stringify(dataList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  handleImportBackup: async (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const showAlert = useUIStore.getState().showAlert;
    const tLabel = getTranslation(useSettingsStore.getState().lang as Language);

    const reader = new FileReader();
    const read = new Promise<string>((resolve) => {
      reader.onload = (ev) => resolve((ev.target?.result as string) || "");
      reader.readAsText(input.files![0]);
    });

    try {
      const raw = await read;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        await todoRepo.saveAll(parsed);
        set({ todos: parsed as Todo[] });
        if (showAlert && tLabel?.alert_restore_success) {
          showAlert(tLabel.alert_restore_success);
        }
      } else if (showAlert && tLabel?.alert_restore_invalid) {
        showAlert(tLabel.alert_restore_invalid);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const detailLabel = tLabel?.sync_detail_label || "Detail";
      if (showAlert) {
        showAlert(
          `${tLabel?.alert_restore_error || "Restore failed"}\n\n[${detailLabel}]: ${errMsg}`,
        );
      }
    } finally {
      input.value = "";
    }
  },
}));