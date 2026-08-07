/**
 * todoDomain.test.ts
 * Saf domain mantığı testleri — Todo entity transform'ları.
 * Mock gerektirmez: createTodo/toggleTodo/updateTodoStatus/updateTodoPriorities
 * saf fonksiyonlar, immutability kontratı test edilir.
 */

import { describe, it, expect } from "vitest";
import {
  createTodo,
  toggleTodo,
  updateTodoStatus,
  updateTodoPriorities,
} from "@/domain/entities/Todo.js";

describe("createTodo", () => {
  it("defaults: incomplete, todo status, no repeat, general category", () => {
    const todo = createTodo({ text: "Test task" });
    expect(todo.text).toBe("Test task");
    expect(todo.completed).toBe(false);
    expect(todo.status).toBe("todo");
    expect(todo.repeat).toBe("none");
    expect(todo.category).toBe("general");
    expect(todo.lastCompletedDate).toBeNull();
    expect(todo.dueDate).toBeUndefined();
    expect(todo.urgent).toBeUndefined();
    expect(todo.important).toBeUndefined();
  });

  it("passes through explicit repeat/category/dueDate/priorities", () => {
    const todo = createTodo({
      text: "Routine",
      repeat: "daily",
      category: "work",
      dueDate: "2026-08-10",
      urgent: true,
      important: false,
    });
    expect(todo.repeat).toBe("daily");
    expect(todo.category).toBe("work");
    expect(todo.dueDate).toBe("2026-08-10");
    expect(todo.urgent).toBe(true);
    expect(todo.important).toBe(false);
  });
});

describe("toggleTodo", () => {
  it("toggles completed state and records completion date", () => {
    const todo = createTodo({ text: "A" });
    const done = toggleTodo(todo);
    expect(done.completed).toBe(true);
    expect(done.status).toBe("done");
    expect(done.lastCompletedDate).toBeTruthy();
    expect(done.completedDates).toHaveLength(1);
  });

  it("is immutable — original todo untouched", () => {
    const todo = createTodo({ text: "A" });
    const done = toggleTodo(todo);
    expect(todo.completed).toBe(false);
    expect(todo.status).toBe("todo");
    expect(todo.lastCompletedDate).toBeNull();
    expect(todo.completedDates).toBeUndefined();
    expect(done).not.toBe(todo);
  });

  it("toggles back to open state", () => {
    const todo = createTodo({ text: "A" });
    const done = toggleTodo(todo);
    const reopened = toggleTodo(done);
    expect(reopened.completed).toBe(false);
    expect(reopened.status).toBe("todo");
    // completion date stays as history
    expect(reopened.completedDates).toHaveLength(1);
  });

  it("accumulates completedDates across toggles", () => {
    const todo = createTodo({ text: "A" });
    const once = toggleTodo(todo);
    const twice = toggleTodo(once);
    const thrice = toggleTodo(twice);
    expect(thrice.completedDates).toHaveLength(2);
  });
});

describe("updateTodoStatus", () => {
  it("done → completed=true + completedDates append + lastCompletedDate set", () => {
    const todo = createTodo({ text: "A" });
    const done = updateTodoStatus(todo, "done");
    expect(done.completed).toBe(true);
    expect(done.completedDates).toHaveLength(1);
    expect(done.lastCompletedDate).toBeTruthy();
  });

  it("same status returns same reference (no-op)", () => {
    const todo = createTodo({ text: "A" });
    const same = updateTodoStatus(todo, "todo");
    expect(same).toBe(todo);
  });

  it("done → todo clears completed but keeps history", () => {
    const todo = createTodo({ text: "A" });
    const done = updateTodoStatus(todo, "done");
    const back = updateTodoStatus(done, "todo");
    expect(back.completed).toBe(false);
    expect(back.completedDates).toHaveLength(1);
  });
});

describe("updateTodoPriorities", () => {
  it("sets urgent/important and keeps other fields", () => {
    const todo = createTodo({ text: "A" });
    const prioritized = updateTodoPriorities(todo, true, true);
    expect(prioritized.urgent).toBe(true);
    expect(prioritized.important).toBe(true);
    expect(prioritized.text).toBe("A");
    expect(prioritized.completed).toBe(false);
  });
});
