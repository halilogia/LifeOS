/**
 * TodoViewModel
 * Presentation view model for transforming Todo entities into display-ready data.
 * Handles filtering, sorting, and grouping logic for the UI layer.
 */

import type { Todo } from "@/domain/entities/Todo.js";
import type { TodoStatus } from "@/domain/value-objects/TodoStatus.js";
import type { RepeatType } from "@/domain/value-objects/RepeatType.js";

export interface TodoGroup {
  readonly label: string;
  readonly todos: readonly Todo[];
  readonly count: number;
}

export class TodoViewModel {
  /**
   * Filters todos by their status.
   */
  static filterByStatus(todos: readonly Todo[], status: TodoStatus): Todo[] {
    return todos.filter((t) => t.status === status);
  }

  /**
   * Filters todos by their repeat type.
   */
  static filterByRepeat(todos: readonly Todo[], repeat: RepeatType): Todo[] {
    return todos.filter((t) => t.repeat === repeat);
  }

  /**
   * Separates todos into focus (non-repeating) and routines (repeating).
   */
  static separateByTab(todos: readonly Todo[]): {
    focus: Todo[];
    routines: Todo[];
  } {
    return {
      focus: todos.filter((t) => t.repeat === "none"),
      routines: todos.filter((t) => t.repeat !== "none"),
    };
  }

  /**
   * Groups todos by their status for kanban/Eisenhower view.
   */
  static groupByStatus(todos: readonly Todo[]): TodoGroup[] {
    const statuses: TodoStatus[] = ["todo", "in-progress", "done"];
    return statuses.map((status) => {
      const filtered = todos.filter((t) => t.status === status);
      return {
        label: status,
        todos: filtered,
        count: filtered.length,
      };
    });
  }

  /**
   * Groups todos by their Eisenhower quadrant.
   */
  static groupByQuadrant(todos: readonly Todo[]): {
    urgentImportant: Todo[];
    notUrgentImportant: Todo[];
    urgentNotImportant: Todo[];
    notUrgentNotImportant: Todo[];
  } {
    return {
      urgentImportant: todos.filter((t) => t.urgent && t.important),
      notUrgentImportant: todos.filter((t) => !t.urgent && t.important),
      urgentNotImportant: todos.filter((t) => t.urgent && !t.important),
      notUrgentNotImportant: todos.filter((t) => !t.urgent && !t.important),
    };
  }

  /**
   * Returns the count of incomplete todos.
   */
  static incompleteCount(todos: readonly Todo[]): number {
    return todos.filter((t) => !t.completed).length;
  }

  /**
   * Returns the count of completed todos.
   */
  static completedCount(todos: readonly Todo[]): number {
    return todos.filter((t) => t.completed).length;
  }

  /**
   * Returns the completion percentage (0-100).
   */
  static completionPercentage(todos: readonly Todo[]): number {
    if (todos.length === 0) {
      return 0;
    }
    return Math.round(
      (todos.filter((t) => t.completed).length / todos.length) * 100,
    );
  }

  /**
   * Sorts todos: incomplete first, then by creation order.
   */
  static sortByCompletion(todos: readonly Todo[]): Todo[] {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) {
        return 0;
      }
      return a.completed ? 1 : -1;
    });
  }

  /**
   * Filters todos by a search query (matches text field).
   */
  static search(todos: readonly Todo[], query: string): Todo[] {
    if (!query.trim()) {
      return [...todos];
    }
    const lower = query.toLowerCase();
    return todos.filter((t) => t.text.toLowerCase().includes(lower));
  }
}
