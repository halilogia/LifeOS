/**
 * MoveTaskUseCase
 * Application use case for moving a task between statuses (todo/in-progress/done).
 * Supports both direct status change and directional movement.
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { ITodoSyncPort } from "@/application/ports/ITodoSyncPort.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { TodoStatus } from "@/domain/value-objects/TodoStatus.js";
import { isRepeating } from "@/domain/value-objects/RepeatType.js";
import { isCompleted } from "@/domain/value-objects/TodoStatus.js";
import {
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "@/domain/services/TaskService.js";

export interface MoveTaskStatusRequest {
  readonly index: number;
  readonly newStatus: TodoStatus;
}

export interface MoveTaskDirectionRequest {
  readonly index: number;
  readonly direction: 1 | -1;
}

export interface MoveTaskResponse {
  readonly todos: readonly Todo[];
  readonly moved: boolean;
}

export class MoveTaskUseCase {
  constructor(
    private todoRepo: ITodoRepository,
    private syncRepo: ISyncRepository,
    private syncPort?: ITodoSyncPort,
  ) {}

  async moveToStatus(
    request: MoveTaskStatusRequest,
  ): Promise<MoveTaskResponse> {
    const allTodos = await this.todoRepo.getAll();
    const updated = moveTaskWithStatus(
      allTodos,
      request.index,
      request.newStatus,
    );

    // Sync to Google Tasks if changed and synced
    if (
      updated !== allTodos &&
      request.index >= 0 &&
      request.index < allTodos.length
    ) {
      const item = allTodos[request.index];
      await this.syncStatusChange(item, request.newStatus);
    }

    await this.todoRepo.saveAll(updated);
    return { todos: updated, moved: updated !== allTodos };
  }

  async moveByDirection(
    request: MoveTaskDirectionRequest,
  ): Promise<MoveTaskResponse> {
    const allTodos = await this.todoRepo.getAll();
    const newStatus = getUpdatedStatuses(
      allTodos,
      request.index,
      request.direction,
    );

    if (!newStatus) {
      return { todos: allTodos, moved: false };
    }

    return this.moveToStatus({ index: request.index, newStatus });
  }

  private async syncStatusChange(
    item: Todo,
    newStatus: TodoStatus,
  ): Promise<void> {
    if (!item.id) {
      return;
    }

    const syncSettings = await this.syncRepo.getSyncSettings();
    if (!syncSettings.enabled || !syncSettings.tasksEnabled || !this.syncPort) {
      return;
    }

    try {
      const token = await this.syncPort.getAuthToken(false);
      const isRoutine = isRepeating(item.repeat);
      const listId = isRoutine
        ? await this.syncPort.getOrCreateTaskList(token, "Life OS - Routines")
        : await this.syncPort.getOrCreateTaskList(token, "Life OS - Focus");

      await this.syncPort.updateTask(token, listId, item.id, {
        status: isCompleted(newStatus) ? "completed" : "needsAction",
        completed: isCompleted(newStatus) ? new Date().toISOString() : null,
      });
    } catch (err) {
      console.error("Failed to sync task status change:", err);
    }
  }
}
