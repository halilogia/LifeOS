import { useState, useEffect, useRef } from "preact/hooks";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  lang: Language;
}

export function DatePicker({ value, onChange, lang }: DatePickerProps) {
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Reset calendar view when opened or value changes
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    } else {
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const monthNames = [
    t.month_jan, t.month_feb, t.month_mar, t.month_apr,
    t.month_may, t.month_jun, t.month_jul, t.month_aug,
    t.month_sep, t.month_oct, t.month_nov, t.month_dec,
  ];

  const weekdaysTr = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];
  const weekdaysEn = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const selectDate = (year: number, month: number, day: number) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const handleToday = () => {
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  // Generate grid days
  const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const paddingDays = startDay === 0 ? 6 : startDay - 1; // convert to Monday=0

  const days: {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  }[] = [];

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevDaysCount = new Date(prevYear, prevMonth + 1, 0).getDate();
  for (let i = paddingDays - 1; i >= 0; i--) {
    days.push({
      day: prevDaysCount - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextDaysCount = 42 - days.length;
  for (let i = 1; i <= nextDaysCount; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  // Format label for trigger button
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) {
      return lang === "tr" ? "Son Tarih" : "Due Date";
    }
    const [y, m, d] = dateStr.split("-").map(Number);
    const mName = monthNames[m - 1].substring(0, 3);
    return lang === "tr" ? `${d} ${mName} ${y}` : `${mName} ${d}, ${y}`;
  };

  const isSelected = (y: number, m: number, d: number) => {
    if (!value) {
      return false;
    }
    const [vy, vm, vd] = value.split("-").map(Number);
    return vy === y && vm === m + 1 && vd === d;
  };

  const isToday = (y: number, m: number, d: number) => {
    return (
      today.getFullYear() === y &&
      today.getMonth() === m &&
      today.getDate() === d
    );
  };

  return (
    <div className="custom-datepicker" ref={containerRef}>
      <button
        type="button"
        className={`datepicker-trigger ${value ? "has-val" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title={t.datepicker_select_date}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{formatDateLabel(value)}</span>
      </button>

      {isOpen && (
        <div className="datepicker-dropdown">
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handlePrevMonth}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="datepicker-title">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handleNextMonth}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="datepicker-weekdays">
            {(lang === "tr" ? weekdaysTr : weekdaysEn).map((day) => (
              <span key={day} className="datepicker-weekday">
                {day}
              </span>
            ))}
          </div>

          <div className="datepicker-days">
            {days.map(({ day, month, year, isCurrentMonth }, idx) => {
              const selected = isSelected(year, month, day);
              const todayDay = isToday(year, month, day);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDate(year, month, day)}
                  className={`datepicker-day ${isCurrentMonth ? "current" : "outside"} ${selected ? "selected" : ""} ${todayDay ? "today" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-footer-btn today-btn"
              onClick={handleToday}
            >
              {t.datepicker_today}
            </button>
            <button
              type="button"
              className="datepicker-footer-btn clear-btn"
              onClick={handleClear}
            >
              {lang === "tr" ? "Temizle" : "Clear"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}