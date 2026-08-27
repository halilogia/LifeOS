import { Todo, Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { TodoListItem } from "@/components/TodoListItem.js";
import { RoutineStreakCard } from "@/components/routines/RoutineStreakCard.js";

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
              <span>{isSyncing ? t.list_syncing : t.list_synced}</span>
            </div>
            <button
              className="sync-action-btn"
              onClick={onManualSync}
              disabled={isSyncing}
              title={t.list_sync_now}
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
                  <TodoListItem
                    key={originalIndex}
                    todo={todo}
                    originalIndex={originalIndex}
                    lang={lang}
                    onToggleTodo={onToggleTodo}
                    onDeleteTodo={onDeleteTodo}
                  />
                ))}
            </ul>
          </div>

          <div
            id="recurring-section"
            className={`tasks-container ${activeTab === "routines" ? "active" : ""}`}
          >
            {activeTab === "routines" && (
              <RoutineStreakCard todos={todos} lang={lang} t={t} />
            )}
            <h2 className="section-title">{t.section_recurring}</h2>
            <ul id="recurring-list" className="todo-list">
              {activeTab === "routines" &&
                filteredTodos.map(({ todo, originalIndex }) => {
                  const key = `repeat_${todo.repeat}` as keyof typeof t;
                  const repeatLabel = t[key] || todo.repeat;
                  return (
                    <TodoListItem
                      key={originalIndex}
                      todo={todo}
                      originalIndex={originalIndex}
                      lang={lang}
                      showRepeatBadge
                      repeatLabel={repeatLabel}
                      onToggleTodo={onToggleTodo}
                      onDeleteTodo={onDeleteTodo}
                    />
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
