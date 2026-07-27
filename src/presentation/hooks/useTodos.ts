/**
 * useTodos - Todo CRUD operations hook
 *
 * This hook encapsulates all todo-related state and operations
 * that were previously in App.tsx. It follows clean architecture
 * by using domain services and infrastructure repositories.
 *
 * DI approach: Accepts ITodoRepository as a parameter so App.tsx
 * can inject the repository from RepositoryContext.
 */

import { useState, useCallback } from "preact/hooks";
import { GoogleAuthApi } from "@/infrastructure/api/GoogleAuthApi.js";
import { GoogleTasksApi } from "@/infrastructure/api/GoogleTasksApi.js";

const _authApi = new GoogleAuthApi();
const _tasksApi = new GoogleTasksApi();

import {
  checkAndResetRepeatingTasks,
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "@/domain/services/TaskService.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";

export type GoogleSyncSettings = {
  enabled: boolean;
  tasksEnabled: boolean;
  calendarEnabled: boolean;
  userEmail?: string;
  lastSyncedBackup?: number;
};

export function useTodos(
  todoRepository: ITodoRepository,
  syncSettings: GoogleSyncSettings,
  triggerCloudBackup: () => Promise<void>,
  showAlert: (message: string, onConfirm?: () => void) => void,
  t: Record<string, string>,
) {
  const [todos, setTodos] = useState<Todo[]>([]);

  // --- Initialize todos from storage via repository ---
  const initTodos = useCallback(async () => {
    const loadedTodos = await todoRepository.getAll();
    const clone = JSON.parse(JSON.stringify(loadedTodos));
    const hasResets = checkAndResetRepeatingTasks(clone);
    if (hasResets) {
      await todoRepository.saveAll(clone);
      setTodos(clone);
    } else {
      setTodos(loadedTodos);
    }
    return loadedTodos;
  }, [todoRepository]);

  // --- Add Todo ---
  const handleAddTodo = useCallback(
    async (text: string, repeat: Todo["repeat"], dueDate?: string) => {
      const newTodo: Todo = {
        text,
        completed: false,
        repeat,
        status: "todo",
        category: "general",
        lastCompletedDate: null,
        dueDate: dueDate || undefined,
      };

      if (syncSettings.enabled && syncSettings.tasksEnabled) {
        try {
          const token = await _authApi.getAuthToken(false);
          const focusListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Focus",
          );
          const routinesListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Routines",
          );
          const isRoutine = repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;
          const notes = `[repeat:${repeat}]`;

          const remote = await _tasksApi.createTask(token, listId, {
            title: text,
            notes,
            status: "needsAction",
            due: dueDate ? `${dueDate}T00:00:00.000Z` : undefined,
          });
          newTodo.id = remote.id;
        } catch (err) {
          console.error("Failed to add task to Google Tasks:", err);
        }
      }

      const next = [...todos, newTodo];
      await todoRepository.saveAll(next);
      setTodos(next);
      triggerCloudBackup();
    },
    [todos, syncSettings, triggerCloudBackup, todoRepository],
  );

  // --- Toggle Todo ---
  const handleToggleTodo = useCallback(
    async (index: number) => {
      const next = [...todos];
      const item = next[index];

      item.completed = !item.completed;
      item.status = item.completed ? "done" : "todo";

      if (item.completed) {
        const now = new Date().toISOString();
        item.lastCompletedDate = now;
        if (!item.completedDates) {
          item.completedDates = [];
        }
        item.completedDates.push(now);
      }

      if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
        try {
          const token = await _authApi.getAuthToken(false);
          const focusListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Focus",
          );
          const routinesListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Routines",
          );
          const isRoutine = item.repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;

          await _tasksApi.updateTask(token, listId, item.id, {
            status: item.completed ? "completed" : "needsAction",
            completed: item.completed ? new Date().toISOString() : null,
          });
        } catch (err) {
          console.error("Failed to update Google Task:", err);
        }
      }

      await todoRepository.saveAll(next);
      setTodos(next);
      triggerCloudBackup();
    },
    [todos, syncSettings, triggerCloudBackup, todoRepository],
  );

  // --- Delete Todo ---
  const handleDeleteTodo = useCallback(
    async (index: number) => {
      const item = todos[index];
      if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
        try {
          const token = await _authApi.getAuthToken(false);
          const focusListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Focus",
          );
          const routinesListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Routines",
          );
          const isRoutine = item.repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;

          await _tasksApi.deleteTask(token, listId, item.id);
        } catch (err) {
          console.error("Failed to delete Google Task:", err);
        }
      }

      const next = todos.filter((_, idx) => idx !== index);
      await todoRepository.saveAll(next);
      setTodos(next);
      triggerCloudBackup();
    },
    [todos, syncSettings, triggerCloudBackup, todoRepository],
  );

  // --- Move Task Status ---
  const handleMoveTaskStatus = useCallback(
    async (index: number, newStatus: Todo["status"]) => {
      const next = moveTaskWithStatus(todos as any, index, newStatus) as Todo[];
      const item = next[index];

      if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
        try {
          const token = await _authApi.getAuthToken(false);
          const focusListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Focus",
          );
          const routinesListId = await _tasksApi.getOrCreateTaskList(
            token,
            "Life OS - Routines",
          );
          const isRoutine = item.repeat !== "none";
          const listId = isRoutine ? routinesListId : focusListId;

          await _tasksApi.updateTask(token, listId, item.id, {
            status: newStatus === "done" ? "completed" : "needsAction",
            completed: newStatus === "done" ? new Date().toISOString() : null,
          });
        } catch (err) {
          console.error("Failed to move Google Task:", err);
        }
      }

      await todoRepository.saveAll(next);
      setTodos(next);
      triggerCloudBackup();
    },
    [todos, syncSettings, triggerCloudBackup, todoRepository],
  );

  // --- Move Task Direction ---
  const handleMoveTaskDirection = useCallback(
    async (index: number, direction: number) => {
      const newStatus = getUpdatedStatuses(
        todos as any,
        index,
        direction as 1 | -1,
      );
      if (newStatus) {
        const next = moveTaskWithStatus(
          todos as any,
          index,
          newStatus,
        ) as Todo[];
        const item = next[index];

        if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
          try {
            const token = await _authApi.getAuthToken(false);
            const focusListId = await _tasksApi.getOrCreateTaskList(
              token,
              "Life OS - Focus",
            );
            const routinesListId = await _tasksApi.getOrCreateTaskList(
              token,
              "Life OS - Routines",
            );
            const isRoutine = item.repeat !== "none";
            const listId = isRoutine ? routinesListId : focusListId;

            await _tasksApi.updateTask(token, listId, item.id, {
              status: newStatus === "done" ? "completed" : "needsAction",
              completed: newStatus === "done" ? new Date().toISOString() : null,
            });
          } catch (err) {
            console.error("Failed to move Google Task direction:", err);
          }
        }

        await todoRepository.saveAll(next);
        setTodos(next);
        triggerCloudBackup();
      }
    },
    [todos, syncSettings, triggerCloudBackup, todoRepository],
  );

  // --- Update Urgent/Important ---
  const handleUpdateTodoUrgentImportant = useCallback(
    async (originalIndex: number, urgent: boolean, important: boolean) => {
      const updated = [...todos];
      updated[originalIndex] = {
        ...updated[originalIndex],
        urgent,
        important,
      };
      setTodos(updated);
      await todoRepository.saveAll(updated);
    },
    [todos, todoRepository],
  );

  // --- Export Backup ---
  const handleExportBackup = useCallback(async () => {
    const dataList = await todoRepository.getAll();
    const blob = new Blob([JSON.stringify(dataList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todoRepository]);

  // --- Import Backup ---
  const handleImportBackup = useCallback(
    (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          if (Array.isArray(parsed)) {
            await todoRepository.saveAll(parsed);
            setTodos(parsed);
            showAlert(t.alert_restore_success);
          } else {
            showAlert(t.alert_restore_invalid);
          }
        } catch (err) {
          console.error(err);
          const errMsg = err instanceof Error ? err.message : String(err);
          const detailLabel = t.lang === "tr" ? "Detay" : "Detail";
          showAlert(
            `${t.alert_restore_error || "Restore failed"}\n\n[${detailLabel}]: ${errMsg}`,
          );
        }
        input.value = "";
      };
      reader.readAsText(input.files[0]);
    },
    [t, showAlert, todoRepository],
  );

  return {
    todos,
    setTodos,
    initTodos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMoveTaskStatus,
    handleMoveTaskDirection,
    handleUpdateTodoUrgentImportant,
    handleExportBackup,
    handleImportBackup,
  };
}
