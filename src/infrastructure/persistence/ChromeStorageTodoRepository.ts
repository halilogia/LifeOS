/**
 * ChromeStorageTodoRepository
 * Infrastructure implementation of ITodoRepository using chrome.storage.sync
 * directly (not wrapping legacy storage.ts).
 */

import type { ITodoRepository } from "../../domain/repositories/ITodoRepository.js";
import type { Todo } from "../../domain/entities/Todo.js";

export class ChromeStorageTodoRepository implements ITodoRepository {
    async getAll(): Promise<Todo[]> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(["todos"], (result) => {
                resolve((result.todos as Todo[]) || []);
            });
        });
    }

    async saveAll(todos: Todo[]): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ todos }, resolve);
        });
    }

    async getById(id: string): Promise<Todo | undefined> {
        const todos = await this.getAll();
        return todos.find((t) => t.id === id);
    }
}