import { Todo, Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";

function formatDueDate(dateStr: string, lang: Language): string {
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) {
      return dateStr;
    }
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    if (lang === "tr") {
      const months = [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara",
      ];
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } else {
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {
    return dateStr;
  }
}

interface ListViewProps {
  todos: Todo[];
  activeTab: "focus" | "routines";
  lang: Language;
  onTabChange: (tab: "focus" | "routines") => void;
  onToggleTodo: (index: number) => void;
  onDeleteTodo: (index: number) => void;
  googleSyncActive: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
}

export function ListView({
  todos,
  activeTab,
  lang,
  onTabChange,
  onToggleTodo,
  onDeleteTodo,
  googleSyncActive,
  isSyncing,
  onManualSync,
}: ListViewProps) {
  const t = translations[lang];

  // Filter tasks based on repeating / non-repeating
  const filteredTodos = todos
    .map((todo, idx) => ({ todo, originalIndex: idx }))
    .filter(({ todo }) => {
      if (activeTab === "focus") {
        return todo.repeat === "none";
      } else {
        return todo.repeat !== "none";
      }
    });

  return (
    <div id="list-view" className="view-content active">
      <div className="todo-card">
        <h1 className="greeting">{t.greeting}</h1>

        {googleSyncActive && (
          <div className="tasks-sync-bar">
            <div className="tasks-sync-info">
              <span
                className={`sync-dot ${isSyncing ? "syncing" : "synced"}`}
              ></span>
              <span>
                {isSyncing
                  ? lang === "tr"
                    ? "Google Görevler eşitleniyor..."
                    : "Syncing Google Tasks..."
                  : lang === "tr"
                    ? "Google Görevler ile eşitlendi"
                    : "Synced with Google Tasks"}
              </span>
            </div>
            <button
              className="sync-action-btn"
              onClick={onManualSync}
              disabled={isSyncing}
              title={lang === "tr" ? "Şimdi Eşitle" : "Sync Now"}
            >
              <svg
                className={isSyncing ? "sync-spinner" : ""}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          </div>
        )}

        <div className="todo-tabs">
          <button
            className={`todo-tab-btn ${activeTab === "focus" ? "active" : ""}`}
            onClick={() => onTabChange("focus")}
          >
            {t.section_tasks}
          </button>
          <button
            className={`todo-tab-btn ${activeTab === "routines" ? "active" : ""}`}
            onClick={() => onTabChange("routines")}
          >
            {t.section_recurring}
          </button>
        </div>

        <div className="sections-grid single-column">
          <div
            id="tasks-section"
            className={`tasks-container ${activeTab === "focus" ? "active" : ""}`}
          >
            <h2 className="section-title">{t.section_tasks}</h2>
            <ul id="todo-list" className="todo-list">
              {activeTab === "focus" &&
                filteredTodos.map(({ todo, originalIndex }) => (
                  <li
                    key={originalIndex}
                    className={`todo-item ${todo.completed ? "completed" : ""}`}
                  >
                    <div
                      className="checkbox"
                      onClick={() => onToggleTodo(originalIndex)}
                    >
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
                      {todo.dueDate && (
                        <div
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
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDueDate(todo.dueDate, lang)}</span>
                        </div>
                      )}
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
                ))}
            </ul>
          </div>

          <div
            id="recurring-section"
            className={`tasks-container ${activeTab === "routines" ? "active" : ""}`}
          >
            <h2 className="section-title">{t.section_recurring}</h2>
            <ul id="recurring-list" className="todo-list">
              {activeTab === "routines" &&
                filteredTodos.map(({ todo, originalIndex }) => {
                  const key = `repeat_${todo.repeat}` as keyof typeof t;
                  const repeatLabel = t[key] || todo.repeat;
                  return (
                    <li
                      key={originalIndex}
                      className={`todo-item ${todo.completed ? "completed" : ""}`}
                    >
                      <div
                        className="checkbox"
                        onClick={() => onToggleTodo(originalIndex)}
                      >
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
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <span className="repeat-badge">{repeatLabel}</span>
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
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  ry="2"
                                />
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
                })}
            </ul>
          </div>
        </div>

        <div
          className={`empty-state ${filteredTodos.length === 0 ? "active" : ""}`}
        >
          <p>{t.empty_state}</p>
        </div>
      </div>
    </div>
  );
}
