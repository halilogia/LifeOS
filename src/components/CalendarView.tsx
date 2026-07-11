import { useState } from 'preact/hooks';
import { Todo, Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';
import { PrayerView } from './PrayerView.js';

interface CalendarViewProps {
  todos: Todo[];
  lang: Language;
}

export function CalendarView({ todos, lang }: CalendarViewProps) {
  const t = translations[lang];

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeModalData, setActiveModalData] = useState<{
    title: string;
    tasks: string[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesTr = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = lang === 'tr' ? monthNamesTr[month] : monthNamesEn[month];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Day offsets calculations (Monday start representation)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Populate completed tasks map by date keys
  const completedTasksByDate: Record<string, string[]> = {};
  todos.forEach((todo) => {
    const dates = todo.completedDates || (todo.lastCompletedDate ? [todo.lastCompletedDate] : []);
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!completedTasksByDate[dateKey]) {
        completedTasksByDate[dateKey] = [];
      }
      if (!completedTasksByDate[dateKey].includes(todo.text)) {
        completedTasksByDate[dateKey].push(todo.text);
      }
    });
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Render day cells
  const dayCells = [];
  // Empty slots
  for (let i = 0; i < startOffset; i++) {
    dayCells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && today.getDate() === day;
    const dateKey = `${year}-${month}-${day}`;
    const dayTasks = completedTasksByDate[dateKey] || [];
    const hasTasks = dayTasks.length > 0;

    dayCells.push(
      <div
        key={`day-${day}`}
        className={`calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`}
        onClick={() => {
          setActiveModalData({
            title: `${day} ${monthName} ${year}`,
            tasks: dayTasks,
          });
        }}
      >
        <span className="day-number">{day}</span>
        {hasTasks && (
          <ul className="calendar-task-list">
            {dayTasks.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div id="calendar-view" className="view-content active">
      <div className="split-view-container">
        <div className="left-panel">
          <PrayerView lang={lang} compact={true} />
        </div>
        <div className="calendar-container">
          <div className="calendar-header">
            <h2>{t.calendar_title}</h2>
            <div className="calendar-nav">
              <button id="prev-month-btn" className="calendar-nav-btn" onClick={handlePrevMonth}>
                &lt;
              </button>
              <span id="current-month-year" className="current-month-year">
                {monthName} {year}
              </span>
              <button id="next-month-btn" className="calendar-nav-btn" onClick={handleNextMonth}>
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
      </div>

      {/* Day Tasks Modal Details */}
      {activeModalData && (
        <div className="settings-panel active" onClick={() => setActiveModalData(null)}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <header className="settings-header">
              <h2 id="day-tasks-title">{activeModalData.title}</h2>
              <button className="close-btn" onClick={() => setActiveModalData(null)}>&times;</button>
            </header>
            <div className="day-tasks-body">
              <ul id="day-tasks-list" className="day-tasks-list">
                {activeModalData.tasks.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                    {lang === 'tr' ? 'Bu güne ait tamamlanmış görev yok.' : 'No completed tasks for this day.'}
                  </p>
                ) : (
                  activeModalData.tasks.map((taskText, idx) => (
                    <li key={idx}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>{taskText}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
