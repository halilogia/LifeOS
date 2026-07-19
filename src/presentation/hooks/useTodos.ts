/**
 * useTodos - Todo CRUD operations hook
 * 
 * This hook encapsulates all todo-related state and operations
 * that were previously in App.tsx. It follows clean architecture
 * by using domain services and infrastructure repositories.
 * 
 * Minimum data loss approach: Accepts external state updaters as parameters
 * so App.tsx doesn't need massive refactoring all at once.
 */

import { useState, useCallback } from "preact/hooks";
import { storage } from "../../core/storage.js";
import { googleSyncService } from "../../services/googleSyncService.js";
import {
    checkAndResetRepeatingTasks,
    moveTaskWithStatus,
    getUpdatedStatuses,
} from "../../domain/services/TaskService.js";
import type { Todo } from "../../types/types.js";

export type GoogleSyncSettings = {
    enabled: boolean;
    tasksEnabled: boolean;
    calendarEnabled: boolean;
    userEmail?: string;
    lastSyncedBackup?: number;
};

export function useTodos(
    syncSettings: GoogleSyncSettings,
    triggerCloudBackup: () => Promise<void>,
    showAlert: (message: string, onConfirm?: () => void) => void,
    t: Record<string, string>,
) {
    const [todos, setTodos] = useState<Todo[]>([]);

    // --- Initialize todos from storage ---
    const initTodos = useCallback(async () => {
        const loadedTodos = await storage.getTodos();
        const clone = JSON.parse(JSON.stringify(loadedTodos));
        const hasResets = checkAndResetRepeatingTasks(clone);
        if (hasResets) {
            await storage.setTodos(clone);
            setTodos(clone);
        } else {
            setTodos(loadedTodos);
        }
        return loadedTodos;
    }, []);

    // --- Add Todo ---
    const handleAddTodo = useCallback(async (
        text: string,
        repeat: Todo["repeat"],
        dueDate?: string,
    ) => {
        const newTodo: Todo = {
            text,
            completed: false,
            repeat,
            status: "todo",
            category: "general",
            lastCompletedDate: "",
            dueDate: dueDate || undefined,
        };

        if (syncSettings.enabled && syncSettings.tasksEnabled) {
            try {
                const token = await googleSyncService.getAuthToken(false);
                const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
                const routinesListId = await googleSyncService.getOrCreateTaskList(
                    token,
                    "Life OS - Routines",
                );
                const isRoutine = repeat !== "none";
                const listId = isRoutine ? routinesListId : focusListId;
                const notes = `[repeat:${repeat}]`;

                const remote = await googleSyncService.createTask(token, listId, {
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
        await storage.setTodos(next);
        setTodos(next);
        triggerCloudBackup();
    }, [todos, syncSettings, triggerCloudBackup]);

    // --- Toggle Todo ---
    const handleToggleTodo = useCallback(async (index: number) => {
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
                const token = await googleSyncService.getAuthToken(false);
                const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
                const routinesListId = await googleSyncService.getOrCreateTaskList(
                    token,
                    "Life OS - Routines",
                );
                const isRoutine = item.repeat !== "none";
                const listId = isRoutine ? routinesListId : focusListId;

                await googleSyncService.updateTask(token, listId, item.id, {
                    status: item.completed ? "completed" : "needsAction",
                    completed: item.completed ? new Date().toISOString() : null,
                });
            } catch (err) {
                console.error("Failed to update Google Task:", err);
            }
        }

        await storage.setTodos(next);
        setTodos(next);
        triggerCloudBackup();
    }, [todos, syncSettings, triggerCloudBackup]);

    // --- Delete Todo ---
    const handleDeleteTodo = useCallback(async (index: number) => {
        const item = todos[index];
        if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
            try {
                const token = await googleSyncService.getAuthToken(false);
                const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
                const routinesListId = await googleSyncService.getOrCreateTaskList(
                    token,
                    "Life OS - Routines",
                );
                const isRoutine = item.repeat !== "none";
                const listId = isRoutine ? routinesListId : focusListId;

                await googleSyncService.deleteTask(token, listId, item.id);
            } catch (err) {
                console.error("Failed to delete Google Task:", err);
            }
        }

        const next = todos.filter((_, idx) => idx !== index);
        await storage.setTodos(next);
        setTodos(next);
        triggerCloudBackup();
    }, [todos, syncSettings, triggerCloudBackup]);

    // --- Move Task Status ---
    const handleMoveTaskStatus = useCallback(async (index: number, newStatus: Todo["status"]) => {
        let next = moveTaskWithStatus(todos as any, index, newStatus) as Todo[];
        const item = next[index];

        if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
            try {
                const token = await googleSyncService.getAuthToken(false);
                const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
                const routinesListId = await googleSyncService.getOrCreateTaskList(
                    token,
                    "Life OS - Routines",
                );
                const isRoutine = item.repeat !== "none";
                const listId = isRoutine ? routinesListId : focusListId;

                await googleSyncService.updateTask(token, listId, item.id, {
                    status: newStatus === "done" ? "completed" : "needsAction",
                    completed: newStatus === "done" ? new Date().toISOString() : null,
                });
            } catch (err) {
                console.error("Failed to move Google Task:", err);
            }
        }

        await storage.setTodos(next);
        setTodos(next);
        triggerCloudBackup();
    }, [todos, syncSettings, triggerCloudBackup]);

    // --- Move Task Direction ---
    const handleMoveTaskDirection = useCallback(async (index: number, direction: number) => {
        const newStatus = getUpdatedStatuses(todos as any, index, direction as 1 | -1);
        if (newStatus) {
            let next = moveTaskWithStatus(todos as any, index, newStatus) as Todo[];
            const item = next[index];

            if (syncSettings.enabled && syncSettings.tasksEnabled && item.id) {
                try {
                    const token = await googleSyncService.getAuthToken(false);
                    const focusListId = await googleSyncService.getOrCreateTaskList(token, "Life OS - Focus");
                    const routinesListId = await googleSyncService.getOrCreateTaskList(
                        token,
                        "Life OS - Routines",
                    );
                    const isRoutine = item.repeat !== "none";
                    const listId = isRoutine ? routinesListId : focusListId;

                    await googleSyncService.updateTask(token, listId, item.id, {
                        status: newStatus === "done" ? "completed" : "needsAction",
                        completed: newStatus === "done" ? new Date().toISOString() : null,
                    });
                } catch (err) {
                    console.error("Failed to move Google Task direction:", err);
                }
            }

            await storage.setTodos(next);
            setTodos(next);
            triggerCloudBackup();
        }
    }, [todos, syncSettings, triggerCloudBackup]);

    // --- Update Urgent/Important ---
    const handleUpdateTodoUrgentImportant = useCallback(async (
        originalIndex: number,
        urgent: boolean,
        important: boolean,
    ) => {
        const updated = [...todos];
        updated[originalIndex] = {
            ...updated[originalIndex],
            urgent,
            important,
        };
        setTodos(updated);
        await storage.setTodos(updated);
    }, [todos]);

    // --- Export Backup ---
    const handleExportBackup = useCallback(async () => {
        const dataList = await storage.getTodos();
        const blob = new Blob([JSON.stringify(dataList, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    // --- Import Backup ---
    const handleImportBackup = useCallback((e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                if (Array.isArray(parsed)) {
                    await storage.setTodos(parsed);
                    setTodos(parsed);
                    showAlert(t.alert_restore_success);
                } else {
                    showAlert(t.alert_restore_invalid);
                }
            } catch (err) {
                console.error(err);
                const errMsg = err instanceof Error ? err.message : String(err);
                const detailLabel = t.lang === "tr" ? "Detay" : "Detail";
                showAlert(`${t.alert_restore_error || "Restore failed"}\n\n[${detailLabel}]: ${errMsg}`);
            }
            input.value = "";
        };
        reader.readAsText(input.files[0]);
    }, [t, showAlert]);

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