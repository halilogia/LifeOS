import { Todo, Language } from "@/types/types.js";
import { formatDueDate } from "@/utils/dateUtils.js";

interface TodoListItemProps {
  todo: Todo;
  originalIndex: number;
  lang: Language;
  showRepeatBadge?: boolean;
  repeatLabel?: string;
  onToggleTodo: (index: number) => void;
  onDeleteTodo: (index: number) => void;
}

/**
 * Tek bir todo satırı (focus + routines listeleri ortak kullanır).
 * ListView içindeki tekrar eden JSX'ten çıkarıldı.
 */
export function TodoListItem({
  todo,
  originalIndex,
  lang,
  showRepeatBadge = false,
  repeatLabel = "",
  onToggleTodo,
  onDeleteTodo,
}: TodoListItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="checkbox" onClick={() => onToggleTodo(originalIndex)}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div
        className="todo-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
        onClick={() => onToggleTodo(originalIndex)}
      >
        <span className="todo-text">{todo.text}</span>
        <div
          style={
            showRepeatBadge
              ? { display: "flex", gap: "6px", alignItems: "center" }
              : { display: "flex", alignItems: "center", gap: "4px" }
          }
        >
          {showRepeatBadge && (
            <span className="repeat-badge">{repeatLabel}</span>
          )}
          {todo.dueDate && (
            <span
              className="todo-date-badge"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formatDueDate(todo.dueDate, lang)}</span>
            </span>
          )}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteTodo(originalIndex);
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </li>
  );
}
