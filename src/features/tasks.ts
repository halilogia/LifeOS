import { Todo } from "../types/types.js";
import { getStartOfWeek } from "../utils/utils.js";

export function checkAndResetRepeatingTasks(todos: Todo[]): boolean {
  const now = new Date();
  const nowStr = now.toDateString();
  let modified = false;

  todos.forEach((todo) => {
    if (
      todo.repeat &&
      todo.repeat !== "none" &&
      todo.completed &&
      todo.lastCompletedDate
    ) {
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
        todo.completed = false;
        todo.status = "todo";
        modified = true;
      }
    }
  });
  return modified;
}

export function moveTaskWithStatus(
  index: number,
  newStatus: Todo["status"],
  todos: Todo[],
): void {
  if (index < 0 || index >= todos.length || todos[index].status === newStatus) {
    return;
  }
  todos[index].status = newStatus;
  todos[index].completed = newStatus === "done";
  if (todos[index].completed) {
    todos[index].lastCompletedDate = new Date().toISOString();
  }
}

export function getUpdatedStatuses(
  todos: Todo[],
  index: number,
  direction: number,
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
