/**
 * ResetRepeatingTodosUseCase
 *
 * Application use case for loading todos and resetting repeating tasks whose
 * repeat cycle has elapsed (daily/weekly/monthly). Persists the reset result
 * back to the repository if any task was modified.
 *
 * This is the application-layer entry for the previous `initTodos` flow in
 * useTodos: it keeps the side effect (writing back to storage when a reset
 * happened) out of the presentation layer.
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import { checkAndResetRepeatingTasks } from "@/domain/services/TaskService.js";

export interface ResetRepeatingTodosResponse {
  readonly todos: readonly Todo[];
  readonly modified: boolean;
}

export class ResetRepeatingTodosUseCase {
  constructor(private todoRepo: ITodoRepository) {}

  async execute(): Promise<ResetRepeatingTodosResponse> {
    const loaded = await this.todoRepo.getAll();
    // Deep clone is required: checkAndResetRepeatingTasks mutates the array
    // in place. We only want to persist the cloned copy if a reset occurred.
    const clone: Todo[] = JSON.parse(JSON.stringify(loaded));
    const { modified, todos } = checkAndResetRepeatingTasks(clone);

    if (modified) {
      await this.todoRepo.saveAll(todos);
    }

    return { todos: modified ? todos : loaded, modified };
  }
}
