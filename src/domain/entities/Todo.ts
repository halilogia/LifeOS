/**
 * Todo Entity
 * Core domain entity representing a task.
 * Domain layer - no external dependencies.
 * Uses domain value objects for type safety.
 */

import type { RepeatType } from "../value-objects/RepeatType.js";
import type { TodoStatus } from "../value-objects/TodoStatus.js";
import { isCompleted } from "../value-objects/TodoStatus.js";

export interface Todo {
    readonly id?: string;
    readonly text: string;
    readonly completed: boolean;
    readonly status: TodoStatus;
    readonly repeat: RepeatType;
    readonly category: string;
    readonly lastCompletedDate: string | null;
    readonly completedDates?: readonly string[];
    readonly dueDate?: string;
    readonly urgent?: boolean;
    readonly important?: boolean;
}

/**
 * Creates a new Todo with default values for missing fields.
 */
export function createTodo(params: {
    text: string;
    repeat?: RepeatType;
    category?: string;
    dueDate?: string;
    urgent?: boolean;
    important?: boolean;
}): Todo {
    return {
        text: params.text,
        completed: false,
        status: "todo",
        repeat: params.repeat ?? "none",
        category: params.category ?? "general",
        lastCompletedDate: null,
        dueDate: params.dueDate,
        urgent: params.urgent,
        important: params.important,
    };
}

/**
 * Toggles the completed state of a Todo.
 * Returns a new Todo object (immutable).
 */
export function toggleTodo(todo: Todo): Todo {
    const newCompleted = !todo.completed;
    const now = new Date().toISOString();
    return {
        ...todo,
        completed: newCompleted,
        status: newCompleted ? "done" : "todo",
        lastCompletedDate: newCompleted ? now : todo.lastCompletedDate,
        completedDates: newCompleted
            ? [...(todo.completedDates ?? []), now]
            : todo.completedDates,
    };
}

/**
 * Updates the status of a Todo.
 * If status is "done", also sets completed=true and records the date.
 * Returns a new Todo object (immutable).
 */
export function updateTodoStatus(todo: Todo, newStatus: TodoStatus): Todo {
    if (todo.status === newStatus) return todo;

    const now = new Date().toISOString();
    const completed = isCompleted(newStatus);

    return {
        ...todo,
        status: newStatus,
        completed,
        lastCompletedDate: completed ? now : todo.lastCompletedDate,
        completedDates: completed
            ? [...(todo.completedDates ?? []), now]
            : todo.completedDates,
    };
}

/**
 * Updates the Eisenhower matrix fields (urgent/important).
 * Returns a new Todo object (immutable).
 */
export function updateTodoPriorities(
    todo: Todo,
    urgent: boolean,
    important: boolean,
): Todo {
    return {
        ...todo,
        urgent,
        important,
    };
}

/**
 * Assigns a Google Tasks ID to a Todo.
 * Returns a new Todo object (immutable).
 */
export function assignTodoId(todo: Todo, id: string): Todo {
    return { ...todo, id };
}