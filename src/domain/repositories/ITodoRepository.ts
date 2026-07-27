/**
 * ITodoRepository Interface
 * Repository pattern for Todo persistence.
 * Domain layer - no external dependencies, pure interface.
 */

import type { Todo } from "@/domain/entities/Todo.js";

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  saveAll(todos: Todo[]): Promise<void>;
  getById(id: string): Promise<Todo | undefined>;
}
