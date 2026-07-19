/**
 * ToggleTodoUseCase
 * Application use case for toggling a todo's completed state.
 * Orchestrates domain entities, repositories, and external sync.
 */

import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort } from "../../ports/ITodoSyncPort.js";
import type { Todo } from "../../../domain/entities/Todo.js";
import { toggleTodo } from "../../../domain/entities/Todo.js";
import { isRepeating } from "../../../domain/value-objects/RepeatType.js";

export interface ToggleTodoRequest {
    readonly index: number;
}

export interface ToggleTodoResponse {
    readonly todos: readonly Todo[];
}

export class ToggleTodoUseCase {
    constructor(
        private todoRepo: ITodoRepository,
        private syncRepo: ISyncRepository,
        private syncPort?: ITodoSyncPort,
    ) { }

    async execute(request: ToggleTodoRequest): Promise<ToggleTodoResponse> {
        const allTodos = await this.todoRepo.getAll();
        if (request.index < 0 || request.index >= allTodos.length) {
            return { todos: allTodos };
        }

        const item = allTodos[request.index];
        const updatedTodo = toggleTodo(item);

        // Sync to Google Tasks if enabled
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (
            syncSettings.enabled &&
            syncSettings.tasksEnabled &&
            this.syncPort &&
            item.id
        ) {
            try {
                const token = await this.syncPort.getAuthToken(false);
                const isRoutine = isRepeating(item.repeat);
                const listId = isRoutine
                    ? await this.syncPort.getOrCreateTaskList(
                        token,
                        "Life OS - Routines",
                    )
                    : await this.syncPort.getOrCreateTaskList(
                        token,
                        "Life OS - Focus",
                    );

                await this.syncPort.updateTask(token, listId, item.id, {
                    status: updatedTodo.completed ? "completed" : "needsAction",
                    completed: updatedTodo.completed
                        ? new Date().toISOString()
                        : null,
                });
            } catch (err) {
                console.error("Failed to update Google Task:", err);
            }
        }

        const next = [...allTodos];
        next[request.index] = updatedTodo;
        await this.todoRepo.saveAll(next);

        return { todos: next };
    }
}