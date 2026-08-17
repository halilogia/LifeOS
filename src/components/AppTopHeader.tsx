import { useState, useCallback } from "preact/hooks";
import type { JSX } from "preact";
import type { Language } from "@/domain/value-objects/Language.js";
import { DatePicker } from "@/components/DatePicker.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { useTodosStore } from "@/presentation/store/todosStore.js";

interface AppTopHeaderProps {
  t: Record<string, string>;
  lang: Language;
}

export function AppTopHeader({ t, lang }: AppTopHeaderProps) {
  // Local todo-input state (ephemeral — belongs to the input, not global)
  const [todoText, setTodoText] = useState("");
  const [todoRepeat, setTodoRepeat] = useState("none");
  const [todoDueDate, setTodoDueDate] = useState("");

  // Shared store actions
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const handleTabChangeUI = useUIStore((s) => s.handleTabChangeUI);
  const handleAddTodo = useTodosStore((s) => s.handleAddTodo);

  const handleAddTodoClick = useCallback(async () => {
    if (!todoText.trim()) {
      return;
    }
    await handleAddTodo(
      todoText.trim(),
      (todoRepeat as "none" | "daily" | "weekly" | "monthly") || "none",
      todoDueDate || undefined,
    );
    setTodoText("");
    setTodoRepeat("none");
    setTodoDueDate("");
  }, [todoText, todoRepeat, todoDueDate, handleAddTodo]);

  const handleKeyPress = useCallback(
    (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        void handleAddTodoClick();
      }
    },
    [handleAddTodoClick],
  );

  const handleRepeatChange = useCallback(
    (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
      const val = (e.target as HTMLSelectElement).value;
      setTodoRepeat(val);
      setActiveTab(val === "none" ? "focus" : "routines");
      handleTabChangeUI(val === "none" ? "focus" : "routines");
    },
    [setActiveTab, handleTabChangeUI],
  );

  return (
    <header className="top-header" style={{ display: "flex" }}>
      <div className="global-input-container">
        <div className="input-group">
          <input
            type="text"
            id="todo-input"
            value={todoText}
            onInput={(e) => setTodoText((e.target as HTMLInputElement).value)}
            onKeyPress={handleKeyPress}
            placeholder={t.todo_placeholder}
            autocomplete="off"
            onFocus={() => handleTabChangeUI("focus")}
            onBlur={() => setActiveView("list")}
          />
          <DatePicker
            value={todoDueDate}
            onChange={setTodoDueDate}
            lang={lang}
          />
          <select
            id="repeat-select"
            className="repeat-select"
            value={todoRepeat}
            onChange={handleRepeatChange}
          >
            <option value="none">{t.repeat_none}</option>
            <option value="daily">{t.repeat_daily}</option>
            <option value="weekly">{t.repeat_weekly}</option>
            <option value="monthly">{t.repeat_monthly}</option>
          </select>
          <button
            id="add-btn"
            onClick={() => void handleAddTodoClick()}
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
