/**
 * TodoStatus Value Object
 * Represents the workflow status of a task.
 * Domain layer - no external dependencies.
 */

export type TodoStatus = "todo" | "in-progress" | "done";

const VALID_STATUSES: TodoStatus[] = ["todo", "in-progress", "done"];

export function createTodoStatus(value: string): TodoStatus {
    if (!VALID_STATUSES.includes(value as TodoStatus)) {
        return "todo";
    }
    return value as TodoStatus;
}

export function isValidTodoStatus(value: string): boolean {
    return VALID_STATUSES.includes(value as TodoStatus);
}

/**
 * Returns the next status in the workflow direction.
 * direction: +1 for forward (todo → in-progress → done), -1 for backward.
 * Returns null if the transition is not possible.
 */
export function getNextStatus(
    current: TodoStatus,
    direction: 1 | -1,
): TodoStatus | null {
    const idx = VALID_STATUSES.indexOf(current);
    const nextIdx = idx + direction;
    if (nextIdx >= 0 && nextIdx < VALID_STATUSES.length) {
        return VALID_STATUSES[nextIdx];
    }
    return null;
}

/**
 * Returns true if the status represents a completed state.
 */
export function isCompleted(status: TodoStatus): boolean {
    return status === "done";
}