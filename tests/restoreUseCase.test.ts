/**
 * restoreUseCase.test.ts
 * RestoreFromDriveUseCase — Drive restore merge mantığı testleri.
 * Saf use case: mock ISyncRepository + IDriveBackupPort + ITodoRepository.
 * chrome.storage.local mock'u (tests/setup.ts) üzerinden persistence doğrulanır.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RestoreFromDriveUseCase } from "@/application/use-cases/sync/RestoreFromDriveUseCase.js";
import type { Todo } from "@/domain/entities/Todo.js";
import type { ITodoRepository } from "@/domain/repositories/ITodoRepository.js";
import type { ISyncRepository } from "@/domain/repositories/ISyncRepository.js";
import type { IDriveBackupPort } from "@/application/ports/IDriveBackupPort.js";

function makeTodo(id: string, text: string): Todo {
  return {
    id,
    text,
    completed: false,
    status: "todo",
    repeat: "none",
    category: "general",
    lastCompletedDate: null,
  };
}

function makeSyncRepo(enabled: boolean): ISyncRepository {
  return {
    getSyncSettings: async () => ({
      enabled,
      tasksEnabled: false,
      calendarEnabled: false,
    }),
    setSyncSettings: async () => {},
  };
}

function makeTodoRepo(todos: Todo[]): ITodoRepository {
  return {
    getAll: async () => [...todos],
    saveAll: async (t) => {
      todos.length = 0;
      todos.push(...t);
    },
    getById: async (id) => todos.find((t) => t.id === id),
  };
}

describe("RestoreFromDriveUseCase", () => {
  let localTodos: Todo[];
  let todoRepo: ITodoRepository;
  let driveBackup: Record<string, unknown> | null;

  beforeEach(() => {
    localTodos = [];
    todoRepo = makeTodoRepo(localTodos);
    driveBackup = null;
  });

  it("sync disabled → no restore", async () => {
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(false),
      { restoreFromDrive: async () => null, backupToDrive: async () => false },
      todoRepo,
    );
    const result = await uc.execute();
    expect(result.restored).toBe(false);
  });

  it("no backup on Drive → no restore", async () => {
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(true),
      { restoreFromDrive: async () => null, backupToDrive: async () => false },
      todoRepo,
    );
    const result = await uc.execute();
    expect(result.restored).toBe(false);
  });

  it("restores todos and persists to repo", async () => {
    driveBackup = { todos: [makeTodo("d1", "Drive todo")] };
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(true),
      {
        restoreFromDrive: async () => driveBackup,
        backupToDrive: async () => false,
      },
      todoRepo,
    );
    const result = await uc.execute();
    expect(result.restored).toBe(true);
    expect(localTodos).toHaveLength(1);
    expect(localTodos[0].text).toBe("Drive todo");
  });

  it("merge: local-only todo survives restore", async () => {
    localTodos = [makeTodo("local1", "Local only")];
    driveBackup = { todos: [makeTodo("d1", "Drive todo")] };
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(true),
      {
        restoreFromDrive: async () => driveBackup,
        backupToDrive: async () => false,
      },
      makeTodoRepo(localTodos),
    );
    const result = await uc.execute();
    expect(result.restored).toBe(true);
    expect(localTodos).toHaveLength(2);
    expect(localTodos.map((t) => t.text).sort()).toEqual([
      "Drive todo",
      "Local only",
    ]);
  });

  it("merge: Drive wins on id conflict", async () => {
    localTodos = [makeTodo("same", "Local version")];
    driveBackup = { todos: [makeTodo("same", "Drive version")] };
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(true),
      {
        restoreFromDrive: async () => driveBackup,
        backupToDrive: async () => false,
      },
      makeTodoRepo(localTodos),
    );
    const result = await uc.execute();
    expect(result.restored).toBe(true);
    expect(localTodos).toHaveLength(1);
    expect(localTodos[0].text).toBe("Drive version");
  });

  it("drive restore failure → restored=false", async () => {
    const uc = new RestoreFromDriveUseCase(
      makeSyncRepo(true),
      {
        restoreFromDrive: async () => {
          throw new Error("Drive unreachable");
        },
        backupToDrive: async () => false,
      },
      todoRepo,
    );
    const result = await uc.execute();
    expect(result.restored).toBe(false);
  });
});
