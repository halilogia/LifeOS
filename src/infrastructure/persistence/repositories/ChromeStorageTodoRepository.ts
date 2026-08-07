/**
 * ChromeStorageTodoRepository
 * Infrastructure implementation of ITodoRepository using chrome.storage.local
 * directly (not wrapping legacy storage.ts).
 */

import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { Todo } from "@/domain/entities/Todo.js";
import { SYNC_TODOS } from "@/infrastructure/storage/keys.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

export class ChromeStorageTodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([SYNC_TODOS], (result) => {
        resolve((result[SYNC_TODOS] as Todo[]) || []);
      });
    });
  }

  async saveAll(todos: Todo[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_TODOS]: todos }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async getById(id: string): Promise<Todo | undefined> {
    const todos = await this.getAll();
    return todos.find((t) => t.id === id);
  }
}
