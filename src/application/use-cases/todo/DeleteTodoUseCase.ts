/**
 * DeleteTodoUseCase
 * Application use case for deleting a todo.
 * Orchestrates repositories and external sync.
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort } from "@/application/ports/ITodoSyncPort.js";
import type { Todo } from "@/domain/entities/Todo.js";
import { isRepeating } from "@/domain/value-objects/RepeatType.js";

export interface DeleteTodoRequest {
  readonly index: number;
}

export interface DeleteTodoResponse {
  readonly todos: readonly Todo[];
}

export class DeleteTodoUseCase {
  constructor(
    private todoRepo: ITodoRepository,
    private syncRepo: ISyncRepository,
    private syncPort?: ITodoSyncPort,
  ) {}

  async execute(request: DeleteTodoRequest): Promise<DeleteTodoResponse> {
    const allTodos = await this.todoRepo.getAll();
    if (request.index < 0 || request.index >= allTodos.length) {
      return { todos: allTodos };
    }

    const item = allTodos[request.index];

    // Delete from Google Tasks if synced
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
          ? await this.syncPort.getOrCreateTaskList(token, "Life OS - Routines")
          : await this.syncPort.getOrCreateTaskList(token, "Life OS - Focus");

        await this.syncPort.deleteTask(token, listId, item.id);
      } catch (err) {
        console.error("Failed to delete Google Task:", err);
      }
    }

    const next = allTodos.filter((_, idx) => idx !== request.index);
    await this.todoRepo.saveAll(next);

    return { todos: next };
  }
}
