import { useState, useEffect } from "preact/hooks";
import { Todo } from "@/types/types.js";
import { SyncGoogleCalendarUseCase } from "@/application/use-cases/sync/SyncGoogleCalendarUseCase.js";
import { createCalendarPort } from "@/application/ports/createCalendarPort.js";
import { ChromeStorageSyncRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSyncRepository.js";

const syncRepo = new ChromeStorageSyncRepository();
const calendarUC = new SyncGoogleCalendarUseCase(syncRepo, createCalendarPort());

interface CalendarModalData {
  title: string;
  items: {
    type: "task" | "event";
    text: string;
    completed?: boolean;
    time?: string;
  }[];
}

interface UseCalendarOptions {
  todos: Todo[];
}

/**
 * Takvim state + Google Calendar sync (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder; takvim fetch + modal state burada yaşar.
 */
export function useCalendar({ todos }: UseCalendarOptions) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeModalData, setActiveModalData] =
    useState<CalendarModalData | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<
    { start?: { dateTime?: string; date?: string }; date?: { date?: string } }[]
  >([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCalendar = async () => {
      const { events } = await calendarUC.execute(year, month);
      if (isMounted) {
        setCalendarEvents(events);
      }
    };
    fetchCalendar();
    return () => {
      isMounted = false;
    };
  }, [currentDate]);

  // Group tasks by date key: YYYY-MM-DD
  const tasksByDate: Record<string, { text: string; completed: boolean }[]> =
    {};
  todos.forEach((todo) => {
    // 1. Completed dates
    const dates =
      todo.completedDates ||
      (todo.lastCompletedDate ? [todo.lastCompletedDate] : []);
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      if (
        !tasksByDate[dateKey].some((t) => t.text === todo.text && t.completed)
      ) {
        tasksByDate[dateKey].push({ text: todo.text, completed: true });
      }
    });

    // 2. Due dates
    if (todo.dueDate) {
      const parts = todo.dueDate.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateKey = `${y}-${m}-${d}`;
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        if (!tasksByDate[dateKey].some((t) => t.text === todo.text)) {
          tasksByDate[dateKey].push({
            text: todo.text,
            completed: todo.completed,
          });
        }
      }
    }
  });

  // Group events by date key: YYYY-MM-DD
  const eventsByDate: Record<
    string,
    { start?: { dateTime?: string; date?: string }; summary?: string }[]
  > = {};
  calendarEvents.forEach((event) => {
    if (!event.start) {
      return;
    }
    const dateStr = event.start.dateTime || event.start.date;
    if (!dateStr) {
      return;
    }
    let dateKey = "";
    if (event.start.date) {
      const parts = event.start.date.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        dateKey = `${y}-${m}-${d}`;
      }
    } else {
      const date = new Date(dateStr);
      dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    if (dateKey) {
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    }
  });

  return {
    currentDate,
    year,
    month,
    activeModalData,
    setActiveModalData,
    calendarEvents,
    tasksByDate,
    eventsByDate,
    handlePrevMonth,
    handleNextMonth,
  };
}
