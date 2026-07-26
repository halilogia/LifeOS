/**
 * TaskService
 * Domain service for task-related business logic.
 * Pure functions - no external dependencies.
 */

import type { Todo } from "../entities/Todo.js";
import { updateTodoStatus } from "../entities/Todo.js";
import type { RepeatType } from "../value-objects/RepeatType.js";
import { isRepeating } from "../value-objects/RepeatType.js";

/**
 * Returns the start of the current week (Monday 00:00:00).
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Checks and resets repeating tasks that should be uncompleted
 * based on their repeat cycle (daily/weekly/monthly).
 * Returns a new array if modified, or the original array if no changes.
 */
export function checkAndResetRepeatingTasks(todos: readonly Todo[]): {
  modified: boolean;
  todos: Todo[];
} {
  const now = new Date();
  const nowStr = now.toDateString();
  let modified = false;

  const updated = todos.map((todo) => {
    if (isRepeating(todo.repeat) && todo.completed && todo.lastCompletedDate) {
      const lastDate = new Date(todo.lastCompletedDate);
      let shouldReset = false;

      if (todo.repeat === "daily" && nowStr !== lastDate.toDateString()) {
        shouldReset = true;
      } else if (todo.repeat === "weekly") {
        if (
          getStartOfWeek(now).getTime() > getStartOfWeek(lastDate).getTime()
        ) {
          shouldReset = true;
        }
      } else if (todo.repeat === "monthly") {
        if (
          now.getMonth() !== lastDate.getMonth() ||
          now.getFullYear() !== lastDate.getFullYear()
        ) {
          shouldReset = true;
        }
      }

      if (shouldReset) {
        modified = true;
        return updateTodoStatus(todo, "todo");
      }
    }
    return todo;
  });

  return { modified, todos: updated };
}

/**
 * Moves a task to a new status with proper side effects.
 * Returns a new array with the updated task.
 */
export function moveTaskWithStatus(
  todos: readonly Todo[],
  index: number,
  newStatus: Todo["status"],
): Todo[] {
  if (index < 0 || index >= todos.length) {
    return [...todos];
  }
  if (todos[index].status === newStatus) {
    return [...todos];
  }

  const updated = [...todos];
  updated[index] = updateTodoStatus(updated[index], newStatus);
  return updated;
}

/**
 * Calculates the next status based on current status and direction.
 * direction: +1 for forward, -1 for backward.
 * Returns null if the transition is not possible.
 */
export function getUpdatedStatuses(
  todos: readonly Todo[],
  index: number,
  direction: 1 | -1,
): Todo["status"] | null {
  if (index < 0 || index >= todos.length) {
    return null;
  }

  const statuses: Todo["status"][] = ["todo", "in-progress", "done"];
  const nextIdx = statuses.indexOf(todos[index].status) + direction;
  if (nextIdx >= 0 && nextIdx < statuses.length) {
    return statuses[nextIdx];
  }
  return null;
}

/**
 * Parses a repeat type from a Google Tasks notes field.
 * Expected format: [repeat:daily] or [repeat:weekly] etc.
 */
export function parseRepeatFromNotes(notes?: string): RepeatType {
  if (!notes) {
    return "none";
  }
  const match = notes.match(/\[repeat:(none|daily|weekly|monthly)\]/);
  return match ? (match[1] as RepeatType) : "none";
}
