/**
 * AddTodoUseCase
 * Application use case for adding a new todo.
 * Orchestrates domain entities, repositories, and external sync.
 */

import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "../../../domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort } from "../../ports/ITodoSyncPort.js";
import type { Todo } from "../../../domain/entities/Todo.js";
import { createTodo, assignTodoId } from "../../../domain/entities/Todo.js";
import type { RepeatType } from "../../../domain/value-objects/RepeatType.js";
import { isRepeating } from "../../../domain/value-objects/RepeatType.js";

export interface AddTodoRequest {
    readonly text: string;
    readonly repeat: RepeatType;
    readonly dueDate?: string;
    readonly category?: string;
    readonly urgent?: boolean;
    readonly important?: boolean;
}

export interface AddTodoResponse {
    readonly todo: Todo;
    readonly synced: boolean;
}

export class AddTodoUseCase {
    constructor(
        private todoRepo: ITodoRepository,
        private syncRepo: ISyncRepository,
        private syncPort?: ITodoSyncPort,
    ) { }

    async execute(request: AddTodoRequest): Promise<AddTodoResponse> {
        // 1. Create domain entity
        let todo = createTodo({
            text: request.text,
            repeat: request.repeat,
            category: request.category,
            dueDate: request.dueDate,
            urgent: request.urgent,
            important: request.important,
        });

        let synced = false;

        // 2. Sync to Google Tasks if enabled
        const syncSettings = await this.syncRepo.getSyncSettings();
        if (
            syncSettings.enabled &&
            syncSettings.tasksEnabled &&
            this.syncPort
        ) {
            try {
                const token = await this.syncPort.getAuthToken(false);
                const isRoutine = isRepeating(request.repeat);
                const listId = isRoutine
                    ? await this.syncPort.getOrCreateTaskList(
                        token,
                        "Life OS - Routines",
                    )
                    : await this.syncPort.getOrCreateTaskList(
                        token,
                        "Life OS - Focus",
                    );

                const notes = `[repeat:${request.repeat}]`;
                const remote = await this.syncPort.createTask(token, listId, {
                    title: request.text,
                    notes,
                    status: "needsAction",
                    due: request.dueDate
                        ? `${request.dueDate}T00:00:00.000Z`
                        : undefined,
                });

                todo = assignTodoId(todo, remote.id);
                synced = true;
            } catch (err) {
                console.error("Failed to add task to Google Tasks:", err);
            }
        }

        // 3. Save locally
        const allTodos = await this.todoRepo.getAll();
        await this.todoRepo.saveAll([...allTodos, todo]);

        return { todo, synced };
    }
}