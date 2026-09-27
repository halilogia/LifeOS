/**
 * RepeatType Value Object
 * Represents the repetition frequency of a task.
 * Domain layer - no external dependencies.
 */

export type RepeatType = "none" | "daily" | "weekly" | "monthly";

export function isRepeating(repeat: RepeatType): boolean {
  return repeat !== "none";
}
