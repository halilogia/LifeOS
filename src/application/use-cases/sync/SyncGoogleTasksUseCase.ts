/**
 * SyncGoogleTasksUseCase
 * Application use case for bidirectional sync between local todos and Google Tasks.
 * Maps remote task format to domain Todo entities and merges them.
 */

import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort, RemoteTask } from "../../ports/ITodoSyncPort.js";
import type { Todo } from "../../../domain/entities/Todo.js";
import { assignTodoId } from "../../../domain/entities/Todo.js";
import type { RepeatType } from "../../../domain/value-objects/RepeatType.js";
import { parseRepeatFromNotes } from "../../../domain/services/TaskService.js";

export interface SyncGoogleTasksRequest {
    readonly onProgress?: (status: string) => void;
}

export interface SyncGoogleTasksResponse {
    readonly todos: readonly Todo[];
    readonly synced: boolean;
}

export class SyncGoogleTasksUseCase {
    constructor(
        private todoRepo: ITodoRepository,
        private syncRepo: ISyncRepository,
        private syncPort: ITodoSyncPort,
    ) { }

    async execute(
        request?: SyncGoogleTasksRequest,
    ): Promise<SyncGoogleTasksResponse> {
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (!syncSettings.enabled || !syncSettings.tasksEnabled) {
            return { todos: await this.todoRepo.getAll(), synced: false };
        }

        try {
            const token = await this.syncPort.getAuthToken(false);

            // Get or create task lists
            const focusListId = await this.syncPort.getOrCreateTaskList(
                token,
                "Life OS - Focus",
            );
            const routinesListId = await this.syncPort.getOrCreateTaskList(
                token,
                "Life OS - Routines",
            );

            // Fetch remote tasks
            const remoteFocusTasks = await this.syncPort.getTasks(
                token,
                focusListId,
            );
            const remoteRoutinesTasks = await this.syncPort.getTasks(
                token,
                routinesListId,
            );

            // Map remote tasks to domain Todos
            const mappedFocus: Todo[] = remoteFocusTasks.map(
                (t: RemoteTask) => ({
                    id: t.id,
                    text: t.title,
                    completed: t.status === "completed",
                    status: t.status === "completed" ? "done" : "todo",
                    repeat: "none" as RepeatType,
                    category: "general",
                    lastCompletedDate: t.completed || null,
                    dueDate: t.due ? t.due.split("T")[0] : undefined,
                }),
            );

            const mappedRoutines: Todo[] = remoteRoutinesTasks.map(
                (t: RemoteTask) => {
                    const repeat = parseRepeatFromNotes(t.notes);
                    return {
                        id: t.id,
                        text: t.title,
                        completed: t.status === "completed",
                        status: t.status === "completed" ? "done" : "todo",
                        repeat: repeat === "none" ? ("daily" as RepeatType) : repeat,
                        category: "general",
                        lastCompletedDate: t.completed || null,
                        dueDate: t.due ? t.due.split("T")[0] : undefined,
                    };
                },
            );

            const remoteTodos = [...mappedFocus, ...mappedRoutines];

            // Upload unsynced local tasks (those without a Google Tasks ID)
            const localTodos = await this.todoRepo.getAll();
            const unSyncedLocal = localTodos.filter((t) => !t.id);
            for (const localTodo of unSyncedLocal) {
                const isRoutine = localTodo.repeat !== "none";
                const listId = isRoutine ? routinesListId : focusListId;
                const notes = `[repeat:${localTodo.repeat}]`;
                try {
                    const createdRemote = await this.syncPort.createTask(
                        token,
                        listId,
                        {
                            title: localTodo.text,
                            notes,
                            status: localTodo.completed
                                ? "completed"
                                : "needsAction",
                            due: localTodo.dueDate
                                ? `${localTodo.dueDate}T00:00:00.000Z`
                                : undefined,
                        },
                    );
                    const syncedTodo = assignTodoId(localTodo, createdRemote.id);
                    remoteTodos.push(syncedTodo);
                } catch (err) {
                    console.error("Failed to upload offline task:", err);
                    remoteTodos.push(localTodo);
                }
            }

            await this.todoRepo.saveAll(remoteTodos);
            return { todos: remoteTodos, synced: true };
        } catch (e) {
            console.error("Google Tasks sync failed:", e);
            return { todos: await this.todoRepo.getAll(), synced: false };
        }
    }
}