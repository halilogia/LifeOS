/**
 * RepeatType Value Object
 * Represents the repetition frequency of a task.
 * Domain layer - no external dependencies.
 */

export type RepeatType = "none" | "daily" | "weekly" | "monthly";

const VALID_REPEAT_TYPES: RepeatType[] = ["none", "daily", "weekly", "monthly"];

export function createRepeatType(value: string): RepeatType {
    if (!VALID_REPEAT_TYPES.includes(value as RepeatType)) {
        return "none";
    }
    return value as RepeatType;
}

export function isValidRepeatType(value: string): boolean {
    return VALID_REPEAT_TYPES.includes(value as RepeatType);
}

export function isRepeating(repeat: RepeatType): boolean {
    return repeat !== "none";
}