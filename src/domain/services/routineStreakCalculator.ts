/**
 * routineStreakCalculator.ts
 * Domain service to calculate routine completion streaks, contribution levels,
 * and heatmap grid data for the past N days.
 * Pure business logic — zero UI/storage dependencies.
 */

import type { Todo } from "@/domain/entities/Todo.js";

export interface HeatmapDay {
  dateStr: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0 (Sun) to 6 (Sat) or 1 (Mon) to 7 (Sun)
  count: number;
  total: number;
  ratio: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RoutineStreakStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletedRoutines: number;
  todayCompletedCount: number;
  todayTotalRoutines: number;
  isTodayCompleted: boolean;
  isIgnited: boolean;
  isSupercharged: boolean;
  days: HeatmapDay[];
  weeks: HeatmapDay[][];
}

function formatDateLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateRoutineStreak(
  todos: Todo[],
  gridWeeksCount = 12, // Past 12 weeks (~84 days)
): RoutineStreakStats {
  const routines = todos.filter((t) => t.repeat && t.repeat !== "none");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateLocal(today);

  // Map of dateStr -> count of completed routines
  const dateCompletionMap = new Map<string, number>();

  let totalCompletedRoutines = 0;

  for (const r of routines) {
    // Check completedDates history array
    if (Array.isArray(r.completedDates)) {
      for (const cd of r.completedDates) {
        if (!cd) continue;
        try {
          const dateObj = new Date(cd);
          if (!isNaN(dateObj.getTime())) {
            const dStr = formatDateLocal(dateObj);
            dateCompletionMap.set(dStr, (dateCompletionMap.get(dStr) || 0) + 1);
            totalCompletedRoutines++;
          }
        } catch {
          // ignore malformed date
        }
      }
    } else if (r.completed && r.lastCompletedDate) {
      // Fallback if completedDates array is empty but currently marked done
      try {
        const dateObj = new Date(r.lastCompletedDate);
        if (!isNaN(dateObj.getTime())) {
          const dStr = formatDateLocal(dateObj);
          dateCompletionMap.set(dStr, (dateCompletionMap.get(dStr) || 0) + 1);
          totalCompletedRoutines++;
        }
      } catch {
        // ignore
      }
    }
  }

  const todayCompletedCount = routines.filter((r) => r.completed).length;
  const todayTotalRoutines = routines.length;
  const isTodayCompleted =
    todayTotalRoutines > 0 && todayCompletedCount >= todayTotalRoutines;

  // Calculate Streak (Consecutive days with at least 1 completed routine or task)
  let currentStreak = 0;
  let cursor = new Date(today);

  // Check if today has completions
  const todayCount =
    (dateCompletionMap.get(todayStr) || 0) + (todayCompletedCount > 0 ? 1 : 0);

  if (todayCount > 0) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // Check if yesterday had completions to preserve streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateLocal(yesterday);
    if ((dateCompletionMap.get(yesterdayStr) || 0) > 0) {
      // Streak continues up to yesterday
      cursor = yesterday;
    } else {
      cursor = null as unknown as Date;
    }
  }

  if (cursor) {
    while (true) {
      const dStr = formatDateLocal(cursor);
      const c = dateCompletionMap.get(dStr) || 0;
      if (c > 0) {
        if (dStr !== todayStr) {
          currentStreak++;
        }
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Best Streak across full history (scanning past 365 days)
  let bestStreak = currentStreak;
  let tempStreak = 0;
  const historyCursor = new Date(today);
  historyCursor.setDate(historyCursor.getDate() - 365);

  while (historyCursor <= today) {
    const dStr = formatDateLocal(historyCursor);
    const count =
      dStr === todayStr && todayCompletedCount > 0
        ? Math.max(dateCompletionMap.get(dStr) || 0, todayCompletedCount)
        : dateCompletionMap.get(dStr) || 0;

    if (count > 0) {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    historyCursor.setDate(historyCursor.getDate() + 1);
  }

  // Generate Heatmap Grid (7 rows Mon-Sun, N columns weeks)
  const totalDays = gridWeeksCount * 7;
  const days: HeatmapDay[] = [];

  // Find end date (current week's Sunday)
  const endDate = new Date(today);
  const currentDayOfWeek = endDate.getDay(); // 0 is Sun, 1 is Mon...
  const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
  endDate.setDate(endDate.getDate() + daysUntilSunday);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  const gridCursor = new Date(startDate);

  while (gridCursor <= endDate) {
    const dateStr = formatDateLocal(gridCursor);
    const isCurToday = dateStr === todayStr;
    const rawCount = dateCompletionMap.get(dateStr) || 0;
    const count = isCurToday ? Math.max(rawCount, todayCompletedCount) : rawCount;
    const total = todayTotalRoutines > 0 ? todayTotalRoutines : 3;
    const ratio = count / total;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) {
      if (ratio >= 1.0) level = 4;
      else if (ratio >= 0.75) level = 3;
      else if (ratio >= 0.4) level = 2;
      else level = 1;
    }

    // dayOfWeek: 1 = Mon ... 7 = Sun
    const dow = gridCursor.getDay() === 0 ? 7 : gridCursor.getDay();

    days.push({
      dateStr,
      dayOfWeek: dow,
      count,
      total,
      ratio,
      level,
    });

    gridCursor.setDate(gridCursor.getDate() + 1);
  }

  // Chunk days into weeks (columns)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isIgnited = currentStreak > 0;
  const isSupercharged = currentStreak >= 7 || currentStreak === 3;

  return {
    currentStreak,
    bestStreak,
    totalCompletedRoutines,
    todayCompletedCount,
    todayTotalRoutines,
    isTodayCompleted,
    isIgnited,
    isSupercharged,
    days,
    weeks,
  };
}
