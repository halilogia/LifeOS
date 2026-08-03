import type { GameEntry, DevTodoItem } from "@/types/game.js";

interface ArcadeDevTabProps {
  tr: Record<string, string>;
  game: GameEntry;
  title: string;
  notes: string;
  todoList: DevTodoItem[];
  onTitleChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onStatusChange: (gameId: string, status: GameEntry["status"]) => void;
  onAddTodo: () => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onSave: () => void;
  onDeleteGame: () => void;
}

export function ArcadeDevTab({
  tr,
  game,
  title,
  notes,
  todoList,
  onTitleChange,
  onNotesChange,
  onStatusChange,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onSave,
  onDeleteGame,
}: ArcadeDevTabProps) {
  return (
    <div className="arcade-dev-panel">
      <div className="arcade-dev-section">
        <h3>Oyun Adı</h3>
        <input
          type="text"
          className="arcade-title-input"
          value={title}
          onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
          placeholder="Oyun Adı"
        />
      </div>

      <div className="arcade-dev-section">
        <h3>{tr.arcade_dev_status}</h3>
        <div className="arcade-status-buttons">
          {(
            ["playable", "in_progress", "concept", "archived"] as const
          ).map((status) => (
            <button
              key={status}
              className={`arcade-status-btn ${game.status === status ? "active" : ""}`}
              onClick={() => onStatusChange(game.id, status)}
            >
              {status === "playable" && tr.arcade_status_playable}
              {status === "in_progress" && tr.arcade_status_in_progress}
              {status === "concept" && tr.arcade_status_concept}
              {status === "archived" && tr.arcade_status_archived}
            </button>
          ))}
        </div>
      </div>

      <div className="arcade-dev-section">
        <h3>{tr.arcade_folder_path_label}</h3>
        <div className="arcade-folder-display">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>{game.folderPath}</span>
        </div>
        <p className="arcade-folder-hint">{tr.arcade_folder_path_hint}</p>
      </div>

      <div className="arcade-dev-section">
        <h3>{tr.arcade_technologies}</h3>
        <div className="arcade-tech-badges">
          {game.techStack?.map((tech, idx) => (
            <span key={idx} className="arcade-tech-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="arcade-dev-section">
        <h3>{tr.arcade_dev_notes}</h3>
        <textarea
          className="arcade-notes-textarea"
          value={notes}
          onInput={(e) => onNotesChange((e.target as HTMLTextAreaElement).value)}
          placeholder={tr.arcade_dev_notes_placeholder}
          rows={5}
        />
      </div>

      <div className="arcade-dev-section">
        <div className="arcade-todo-header">
          <h3>{tr.arcade_todo_list}</h3>
          <button className="arcade-todo-add-btn" onClick={onAddTodo}>
            + {tr.arcade_todo_add}
          </button>
        </div>
        {todoList.length === 0 ? (
          <p className="arcade-no-todo">{tr.arcade_no_todo}</p>
        ) : (
          <ul className="arcade-todo-list">
            {todoList.map((t_) => (
              <li
                key={t_.id}
                className={`arcade-todo-item ${t_.completed ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={t_.completed}
                  onChange={() => onToggleTodo(t_.id)}
                />
                <span>{t_.text}</span>
                <button
                  className="arcade-todo-delete-btn"
                  onClick={() => onDeleteTodo(t_.id)}
                  title={tr.arcade_delete_title}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="arcade-dev-actions">
        <button className="arcade-btn-primary" onClick={onSave}>
          {tr.arcade_save}
        </button>
        <button className="arcade-btn-danger" onClick={onDeleteGame}>
          {tr.arcade_delete_game}
        </button>
      </div>
    </div>
  );
}
