/**
 * ChromeStorageTodoRepository
 * Infrastructure implementation of ITodoRepository using chrome.storage.sync.
 * Wraps the existing storage.getTodos/setTodos functions.
 */

import { storage } from "../../core/storage.js";
import type { ITodoRepository } from "../../domain/repositories/ITodoRepository.js";
import type { Todo } from "../../domain/entities/Todo.js";

export class ChromeStorageTodoRepository implements ITodoRepository {
    async getAll(): Promise<Todo[]> {
        return storage.getTodos() as Promise<Todo[]>;
    }

    async saveAll(todos: Todo[]): Promise<void> {
        return storage.setTodos(todos as any);
    }

    async getById(id: string): Promise<Todo | undefined> {
        const todos = await storage.getTodos();
        return todos.find((t) => t.id === id) as Todo | undefined;
    }
}