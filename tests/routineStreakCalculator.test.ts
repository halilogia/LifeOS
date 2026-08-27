import { describe, it, expect } from "vitest";
import { calculateRoutineStreak } from "@/domain/services/routineStreakCalculator.js";
import { createTodo } from "@/domain/entities/Todo.js";

describe("routineStreakCalculator", () => {
  it("returns zero streak and unignited state for empty todos", () => {
    const stats = calculateRoutineStreak([], 12);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(0);
    expect(stats.isIgnited).toBe(false);
    expect(stats.todayCompletedCount).toBe(0);
    expect(stats.days.length).toBe(84);
    expect(stats.weeks.length).toBe(12);
  });

  it("calculates streak 1 when routine is completed today", () => {
    const todayIso = new Date().toISOString();
    const routine = {
      ...createTodo({ text: "Morning Workout", repeat: "daily" as const }),
      completed: true,
      lastCompletedDate: todayIso,
      completedDates: [todayIso],
    };

    const stats = calculateRoutineStreak([routine], 12);
    expect(stats.currentStreak).toBe(1);
    expect(stats.isIgnited).toBe(true);
    expect(stats.todayCompletedCount).toBe(1);
    expect(stats.todayTotalRoutines).toBe(1);
    expect(stats.isTodayCompleted).toBe(true);
  });

  it("calculates multi-day streak across past days", () => {
    const today = new Date();
    const d1 = new Date(today);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 1);
    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 2);

    const routine = {
      ...createTodo({ text: "Meditation", repeat: "daily" as const }),
      completed: true,
      lastCompletedDate: d1.toISOString(),
      completedDates: [d3.toISOString(), d2.toISOString(), d1.toISOString()],
    };

    const stats = calculateRoutineStreak([routine], 12);
    expect(stats.currentStreak).toBe(3);
    expect(stats.bestStreak).toBe(3);
    expect(stats.isIgnited).toBe(true);
    expect(stats.isSupercharged).toBe(true); // milestone 3 hit
  });

  it("assigns appropriate heatmap levels based on completions", () => {
    const today = new Date();
    const routine1 = {
      ...createTodo({ text: "Task 1", repeat: "daily" as const }),
      completed: true,
      lastCompletedDate: today.toISOString(),
      completedDates: [today.toISOString()],
    };
    const routine2 = {
      ...createTodo({ text: "Task 2", repeat: "daily" as const }),
      completed: true,
      lastCompletedDate: today.toISOString(),
      completedDates: [today.toISOString()],
    };

    const stats = calculateRoutineStreak([routine1, routine2], 12);
    const todayDay = stats.days.find((d) => {
      const dObj = new Date(d.dateStr);
      return dObj.toDateString() === today.toDateString();
    });

    expect(todayDay).toBeDefined();
    expect(todayDay!.count).toBeGreaterThanOrEqual(1);
    expect(todayDay!.level).toBeGreaterThan(0);
  });
});
