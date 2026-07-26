/**
 * UpdatePrioritiesUseCase
 * Application use case for updating Eisenhower matrix priorities (urgent/important).
 */

import type { ITodoRepository } from "../../../domain/repositories/ITodoRepository.js";
import type { Todo } from "../../../domain/entities/Todo.js";
import { updateTodoPriorities } from "../../../domain/entities/Todo.js";

export interface UpdatePrioritiesRequest {
  readonly originalIndex: number;
  readonly urgent: boolean;
  readonly important: boolean;
}

export interface UpdatePrioritiesResponse {
  readonly todos: readonly Todo[];
}

export class UpdatePrioritiesUseCase {
  constructor(private todoRepo: ITodoRepository) {}

  async execute(
    request: UpdatePrioritiesRequest,
  ): Promise<UpdatePrioritiesResponse> {
    const allTodos = await this.todoRepo.getAll();
    if (request.originalIndex < 0 || request.originalIndex >= allTodos.length) {
      return { todos: allTodos };
    }

    const updated = [...allTodos];
    updated[request.originalIndex] = updateTodoPriorities(
      updated[request.originalIndex],
      request.urgent,
      request.important,
    );

    await this.todoRepo.saveAll(updated);
    return { todos: updated };
  }
}
