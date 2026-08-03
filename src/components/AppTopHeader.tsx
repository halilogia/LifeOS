import type { JSX } from "preact";
import type { Language } from "@/domain/value-objects/Language.js";
import { DatePicker } from "@/components/DatePicker.js";

interface AppTopHeaderProps {
  t: Record<string, string>;
  lang: Language;
  todoText: string;
  onTodoTextChange: (val: string) => void;
  onKeyPress: (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => void;
  todoRepeat: string;
  onRepeatChange: (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => void;
  todoDueDate: string;
  onDueDateChange: (val: string) => void;
  onAddTodoClick: () => void;
}

export function AppTopHeader({
  t,
  lang,
  todoText,
  onTodoTextChange,
  onKeyPress,
  todoRepeat,
  onRepeatChange,
  todoDueDate,
  onDueDateChange,
  onAddTodoClick,
}: AppTopHeaderProps) {
  return (
    <header className="top-header" style={{ display: "flex" }}>
      <div className="global-input-container">
        <div className="input-group">
          <input
            type="text"
            id="todo-input"
            value={todoText}
            onInput={(e) =>
              onTodoTextChange((e.target as HTMLInputElement).value)
            }
            onKeyPress={onKeyPress}
            placeholder={t.todo_placeholder}
            autocomplete="off"
          />
          <DatePicker
            value={todoDueDate}
            onChange={onDueDateChange}
            lang={lang}
          />
          <select
            id="repeat-select"
            className="repeat-select"
            value={todoRepeat}
            onChange={onRepeatChange}
          >
            <option value="none">{t.repeat_none}</option>
            <option value="daily">{t.repeat_daily}</option>
            <option value="weekly">{t.repeat_weekly}</option>
            <option value="monthly">{t.repeat_monthly}</option>
          </select>
          <button
            id="add-btn"
            onClick={onAddTodoClick}
            aria-label="Add Task"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
