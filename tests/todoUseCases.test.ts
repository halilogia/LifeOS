/**
 * todoUseCases.test.ts
 * Application use case orchestration testleri — mock ITodoRepository + sync-off ISyncRepository.
 * AddTodo / ToggleTodo / DeleteTodo use case'leri repo orchestration'ı ve
 * index-based transform'ları doğrulanır. Sync kapalı olduğundan syncPort
 * (optional) hiç kurulmaz — saf lokal akış test edilir.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AddTodoUseCase } from "@/application/use-cases/todo/AddTodoUseCase.js";
import { ToggleTodoUseCase } from "@/application/use-cases/todo/ToggleTodoUseCase.js";
import { DeleteTodoUseCase } from "@/application/use-cases/todo/DeleteTodoUseCase.js";
import { createTodo } from "@/domain/entities/Todo.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";

function makeMockSyncRepo(): ISyncRepository {
  return {
    getSyncSettings: async () => ({
      enabled: false,
      tasksEnabled: false,
      calendarEnabled: false,
    }),
    setSyncSettings: async () => {},
  };
}

describe("AddTodoUseCase", () => {
  let todos: Todo[];
  let repo: ITodoRepository;
  let syncRepo: ISyncRepository;

  beforeEach(() => {
    todos = [];
    repo = {
      getAll: async () => [...todos],
      saveAll: async (t) => {
        todos = [...t];
      },
      getById: async (id) => todos.find((t) => t.id === id),
    };
    syncRepo = makeMockSyncRepo();
  });

  it("adds a todo via repo.saveAll", async () => {
    const uc = new AddTodoUseCase(repo, syncRepo);
    const { todo, synced } = await uc.execute({
      text: "New task",
      repeat: "none",
    });
    expect(todo.text).toBe("New task");
    expect(todo.completed).toBe(false);
    expect(synced).toBe(false);
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe("New task");
  });

  it("passes repeat/category/dueDate through to the created entity", async () => {
    const uc = new AddTodoUseCase(repo, syncRepo);
    await uc.execute({
      text: "Routine",
      repeat: "daily",
      category: "work",
      dueDate: "2026-08-10",
    });
    expect(todos[0].repeat).toBe("daily");
    expect(todos[0].category).toBe("work");
    expect(todos[0].dueDate).toBe("2026-08-10");
  });

  it("appends to existing todos, preserving them", async () => {
    todos = [createTodo({ text: "Existing" })];
    const uc = new AddTodoUseCase(repo, syncRepo);
    await uc.execute({ text: "Second", repeat: "none" });
    expect(todos).toHaveLength(2);
    expect(todos[0].text).toBe("Existing");
    expect(todos[1].text).toBe("Second");
  });
});

describe("ToggleTodoUseCase", () => {
  let todos: Todo[];
  let repo: ITodoRepository;
  let syncRepo: ISyncRepository;

  beforeEach(() => {
    todos = [createTodo({ text: "Task A" }), createTodo({ text: "Task B" })];
    repo = {
      getAll: async () => [...todos],
      saveAll: async (t) => {
        todos = [...t];
      },
      getById: async (id) => todos.find((t) => t.id === id),
    };
    syncRepo = makeMockSyncRepo();
  });

  it("toggles the todo at the given index", async () => {
    const uc = new ToggleTodoUseCase(repo, syncRepo);
    const { todos: next } = await uc.execute({ index: 0 });
    expect(next[0].completed).toBe(true);
    expect(next[0].status).toBe("done");
    expect(next[1].completed).toBe(false);
    expect(todos[0].completed).toBe(true); // persisted
  });

  it("out-of-range index is a no-op", async () => {
    const uc = new ToggleTodoUseCase(repo, syncRepo);
    const { todos: next } = await uc.execute({ index: 99 });
    expect(next).toHaveLength(2);
    expect(next[0].completed).toBe(false);
    expect(todos[0].completed).toBe(false);
  });

  it("negative index is a no-op", async () => {
    const uc = new ToggleTodoUseCase(repo, syncRepo);
    const { todos: next } = await uc.execute({ index: -1 });
    expect(next).toHaveLength(2);
    expect(todos).toHaveLength(2);
  });
});

describe("DeleteTodoUseCase", () => {
  let todos: Todo[];
  let repo: ITodoRepository;
  let syncRepo: ISyncRepository;

  beforeEach(() => {
    todos = [createTodo({ text: "Task A" }), createTodo({ text: "Task B" })];
    repo = {
      getAll: async () => [...todos],
      saveAll: async (t) => {
        todos = [...t];
      },
      getById: async (id) => todos.find((t) => t.id === id),
    };
    syncRepo = makeMockSyncRepo();
  });

  it("removes the todo at the given index", async () => {
    const uc = new DeleteTodoUseCase(repo, syncRepo);
    const { todos: next } = await uc.execute({ index: 0 });
    expect(next).toHaveLength(1);
    expect(next[0].text).toBe("Task B");
    expect(todos).toHaveLength(1); // persisted
  });

  it("out-of-range index is a no-op", async () => {
    const uc = new DeleteTodoUseCase(repo, syncRepo);
    const { todos: next } = await uc.execute({ index: 5 });
    expect(next).toHaveLength(2);
    expect(todos).toHaveLength(2);
  });
});
