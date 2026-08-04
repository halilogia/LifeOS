import { Todo, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { useCalendar } from "@/presentation/hooks/useCalendar.js";

interface CalendarViewProps {
  todos: Todo[];
  lang: Language;
}

export function CalendarView({ todos, lang }: CalendarViewProps) {
  const t = translations[lang];
  const {
    year,
    month,
    activeModalData,
    setActiveModalData,
    tasksByDate,
    eventsByDate,
    handlePrevMonth,
    handleNextMonth,
  } = useCalendar({ todos });

  const monthNames = [
    t.month_jan,
    t.month_feb,
    t.month_mar,
    t.month_apr,
    t.month_may,
    t.month_jun,
    t.month_jul,
    t.month_aug,
    t.month_sep,
    t.month_oct,
    t.month_nov,
    t.month_dec,
  ];
  const monthName = monthNames[month];

  // Day offsets calculations (Monday start representation)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Render day cells
  const dayCells: preact.JSX.Element[] = [];
  // Empty slots
  for (let i = 0; i < startOffset; i++) {
    dayCells.push(
      <div key={`empty-${i}`} className="calendar-day empty"></div>,
    );
  }
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && today.getDate() === day;
    const dateKey = `${year}-${month}-${day}`;
    const dayTasks = tasksByDate[dateKey] || [];
    const dayEvents = eventsByDate[dateKey] || [];
    const hasTasks = dayTasks.length > 0;
    const hasEvents = dayEvents.length > 0;
    const hasItems = hasTasks || hasEvents;

    const modalItems: {
      type: "task" | "event";
      text: string;
      completed?: boolean;
      time?: string;
    }[] = [
      ...dayTasks.map((t) => ({
        type: "task" as const,
        text: t.text,
        completed: t.completed,
      })),
      ...dayEvents.map((ev) => {
        const timeStr = ev.start?.dateTime
          ? new Date(ev.start.dateTime as string).toLocaleTimeString(
              lang === "tr" ? "tr-TR" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )
          : undefined;
        return {
          type: "event" as const,
          text: ev.summary || "",
          time: timeStr,
        };
      }),
    ];

    dayCells.push(
      <div
        key={`day-${day}`}
        className={`calendar-day ${isToday ? "today" : ""} ${hasItems ? "has-tasks" : ""}`}
        onClick={() => {
          setActiveModalData({
            title: `${day} ${monthName} ${year}`,
            items: modalItems,
          });
        }}
      >
        <span className="day-number">{day}</span>
        {hasItems && (
          <ul className="calendar-task-list">
            {dayTasks.map((t, idx) => (
              <li
                key={`task-${idx}`}
                className={`calendar-task-item ${t.completed ? "completed" : "pending"}`}
                style={{
                  textDecoration: t.completed ? "line-through" : "none",
                  opacity: t.completed ? 0.6 : 1,
                }}
              >
                <span style={{ marginRight: "4px" }}>
                  {t.completed ? "✓" : "○"}
                </span>
                {t.text}
              </li>
            ))}
            {dayEvents.map((ev, idx) => {
              const timeStr = ev.start?.dateTime
                ? new Date(ev.start.dateTime as string).toLocaleTimeString(
                    lang === "tr" ? "tr-TR" : "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "";
              return (
                <li
                  key={`ev-${idx}`}
                  className="calendar-event-item"
                  title={ev.summary}
                >
                  {timeStr && <span className="event-time">{timeStr}</span>}
                  {ev.summary}
                </li>
              );
            })}
          </ul>
        )}
      </div>,
    );
  }

  return (
    <div id="calendar-view" className="view-content active">
      <div className="calendar-container">
        <div className="calendar-header">
          <h2>{t.calendar_title}</h2>
          <div className="calendar-nav">
            <button
              id="prev-month-btn"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
            >
              &lt;
            </button>
            <span id="current-month-year" className="current-month-year">
              {monthName} {year}
            </span>
            <button
              id="next-month-btn"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="calendar-grid-header">
          <div>{t.day_mon}</div>
          <div>{t.day_tue}</div>
          <div>{t.day_wed}</div>
          <div>{t.day_thu}</div>
          <div>{t.day_fri}</div>
          <div>{t.day_sat}</div>
          <div>{t.day_sun}</div>
        </div>

        <div id="calendar-grid" className="calendar-grid">
          {dayCells}
        </div>
      </div>

      {/* Day Tasks Modal Details */}
      {activeModalData && (
        <div
          className="settings-panel active"
          onClick={() => setActiveModalData(null)}
        >
          <div
            className="settings-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h2 id="day-tasks-title">{activeModalData.title}</h2>
              <button
                className="close-btn"
                onClick={() => setActiveModalData(null)}
              >
                &times;
              </button>
            </header>
            <div className="day-tasks-body">
              <ul id="day-tasks-list" className="day-tasks-list">
                {activeModalData.items.length === 0 ? (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    {t.calendar_no_events}
                  </p>
                ) : (
                  activeModalData.items.map((item, idx) => {
                    if (item.type === "task") {
                      return (
                        <li
                          key={idx}
                          style={{
                            textDecoration: item.completed
                              ? "line-through"
                              : "none",
                            opacity: item.completed ? 0.6 : 1,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={
                              item.completed
                                ? "var(--success)"
                                : "var(--text-secondary)"
                            }
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            {item.completed ? (
                              <polyline points="20 6 9 17 4 12"></polyline>
                            ) : (
                              <circle cx="12" cy="12" r="10"></circle>
                            )}
                          </svg>
                          <span>{item.text}</span>
                        </li>
                      );
                    } else {
                      return (
                        <li key={idx} className="calendar-event-detail">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#8b5cf6"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style={{ flexShrink: 0 }}
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <span>
                            {item.time && (
                              <strong
                                style={{ color: "#c084fc", marginRight: "8px" }}
                              >
                                {item.time}
                              </strong>
                            )}
                            {item.text}
                          </span>
                        </li>
                      );
                    }
                  })
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
