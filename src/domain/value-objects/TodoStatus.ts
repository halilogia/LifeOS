/**
 * TodoStatus Value Object
 * Represents the workflow status of a task.
 * Domain layer - no external dependencies.
 */

export type TodoStatus = "todo" | "in-progress" | "done";

/**
 * Returns true if the status represents a completed state.
 */
export function isCompleted(status: TodoStatus): boolean {
  return status === "done";
}
