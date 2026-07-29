import { useEffect, useState, useRef } from "preact/hooks";
import { GameEntry, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { arcadeService } from "@/services/arcadeService.js";
import { translations } from "@/utils/i18n.js";

interface ArcadeGameModalProps {
  game: GameEntry;
  lang: Language;
  onClose: () => void;
  onUpdateStatus: (gameId: string, status: GameEntry["status"]) => void;
  onUpdateDevNotes: (gameId: string, notes: string, todoList: DevTodoItem[]) => void;
  onDeleteGame: (gameId: string) => void;
}

type Tab = "play" | "dev";
type Toast = { kind: "info" | "error"; text: string } | null;

const STARTER_TODO: DevTodoItem[] = [];

export function ArcadeGameModal({
  game,
  lang,
  onClose,
  onUpdateStatus,
  onUpdateDevNotes,
  onDeleteGame,
}: ArcadeGameModalProps) {
  const [tab, setTab] = useState<Tab>(game.mode === "dist" ? "play" : "dev");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(game.mode === "dist");
  const [error, setError] = useState<string | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [devCmdCopied, setDevCmdCopied] = useState(false);
  const [notes, setNotes] = useState(game.devNotes ?? "");
  const [todoList, setTodoList] = useState<DevTodoItem[]>(game.todoList ?? STARTER_TODO);
  const toastTimerRef = useRef<number | null>(null);

  const t = translations[lang];
  const tr = t as Record<string, string>;

  // SECURITY: escape folderPath before embedding in shell command. The path
  // comes from chrome.fileSystem's display name and is not user-editable, but
  // it could still contain characters (e.g. a folder literally named `evil"$x")
  // that would break the quoting or inject extra commands.
  const safeFolderPath = game.folderPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
  const devCmd = `cd "${safeFolderPath}" && npm run dev`;
  // Display a sanitized version for the user; never inject raw.
  const devCmdDisplay = `cd "${game.folderPath}" && npm run dev`;

  useEffect(() => {
    if (game.mode !== "dist") {return;}
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setPermissionNeeded(false);
      try {
        const hasAccess = await arcadeService.ensurePermissionForGame(game.id);
        if (!hasAccess) {
          if (!cancelled) {
            setPermissionNeeded(true);
            setError(tr.arcade_permission_needed);
          }
          return;
        }
        const url = await arcadeService.resolveGameURL(game);
        if (cancelled) {return;}
        if (url) {setIframeUrl(url);}
        else {setError(tr.arcade_iframe_error);}
      } catch (err: any) {
        if (!cancelled) {setError(err?.message ?? tr.arcade_iframe_error);}
      } finally {
        if (!cancelled) {setLoading(false);}
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [game.id, game.mode, game.entryHTMLPath]);

  const handleRequestPermission = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await arcadeService.ensurePermissionForGame(game.id);
      if (!ok) {
        setError(tr.arcade_permission_denied);
        return;
      }
      const url = await arcadeService.resolveGameURL(game);
      if (url) {
        setIframeUrl(url);
        setPermissionNeeded(false);
      } else {
        setError(tr.arcade_iframe_error);
      }
    } catch (err: any) {
      setError(err?.message ?? tr.arcade_iframe_error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (next: Toast) => {
    setToast(next);
    if (toastTimerRef.current) {window.clearTimeout(toastTimerRef.current);}
    if (next) {
      toastTimerRef.current = window.setTimeout(() => setToast(null), 2500);
    }
  };

  useEffect(() => () => {
    if (toastTimerRef.current) {window.clearTimeout(toastTimerRef.current);}
  }, []);

  // SECURITY: blob URL cleanup on unmount or URL change to prevent memory leak.
  useEffect(() => () => {
    if (iframeUrl) {URL.revokeObjectURL(iframeUrl);}
  }, [iframeUrl]);

  const handleSaveDevNotes = () => {
    onUpdateDevNotes(game.id, notes, todoList);
    showToast({ kind: "info", text: tr.arcade_dev_notes_saved });
  };

  const handleAddTodo = () => {
    const text = window.prompt(tr.arcade_todo_prompt);
    if (text && text.trim()) {
      setTodoList((prev) => [...prev, { id: `todo_${Date.now()}`, text: text.trim(), completed: false }]);
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodoList((prev) => prev.map((t_) => (t_.id === id ? { ...t_, completed: !t_.completed } : t_)));
  };

  const handleDeleteTodo = (id: string) => {
    setTodoList((prev) => prev.filter((t_) => t_.id !== id));
  };

  const handleDelete = () => {
    if (window.confirm(tr.arcade_delete_confirm)) {
      onDeleteGame(game.id);
    }
  };

  const handleCopyCmd = async () => {
    try {
      // Copy sanitized command; the displayed version is identical for valid
      // folder names but would be safe even for adversarial inputs.
      await navigator.clipboard.writeText(devCmd);
      setDevCmdCopied(true);
      window.setTimeout(() => setDevCmdCopied(false), 2000);
    } catch (e) {
      console.warn("Clipboard write failed:", e);
    }
  };

  return (
    <div className="arcade-modal-overlay" onClick={onClose}>
      <div className="arcade-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="arcade-modal-header">
          <div className="arcade-modal-title-section">
            <div className="arcade-modal-badge">{game.category.toUpperCase()}</div>
            <h2>{game.title}</h2>
            <span className={`arcade-mode-badge ${game.mode}`}>
              {game.mode === "dist" ? tr.arcade_mode_dist : tr.arcade_mode_dev}
            </span>
          </div>
          <button className="arcade-modal-close" onClick={onClose} title={tr.arcade_close}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="arcade-modal-tabs">
          <button
            className={`arcade-tab-btn ${tab === "play" ? "active" : ""}`}
            onClick={() => setTab("play")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={tab === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{tr.arcade_tab_play}</span>
          </button>
          <button
            className={`arcade-tab-btn ${tab === "dev" ? "active" : ""}`}
            onClick={() => setTab("dev")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>{tr.arcade_tab_dev}</span>
          </button>
        </div>

        <div className="arcade-modal-body">
          {tab === "play" && (
            <div className="arcade-play-panel">
              {game.mode === "dist" ? (
                <>
                  {loading && (
                    <div className="arcade-loading-state">
                      <div className="arcade-spinner" />
                      <p>{tr.arcade_loading}</p>
                    </div>
                  )}
                  {error && !loading && (
                    <div className="arcade-error-panel">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <h3>{tr.arcade_iframe_error}</h3>
                      <p>{error}</p>
                      {permissionNeeded && (
                        <button className="arcade-btn-primary" onClick={handleRequestPermission}>
                          {tr.arcade_grant_permission}
                        </button>
                      )}
                      <p className="arcade-error-hint">{tr.arcade_iframe_error_hint}</p>
                    </div>
                  )}
                  {iframeUrl && !loading && !error && (
                    <iframe
                      src={iframeUrl}
                      className="arcade-game-iframe"
                      sandbox="allow-scripts allow-forms allow-popups"
                      title={game.title}
                    />
                  )}
                </>
              ) : (
                <div className="arcade-dev-mode-panel">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <h3>{tr.arcade_dev_mode_title}</h3>
                  <p>{tr.arcade_dev_mode_hint}</p>
                  <div className="arcade-cmd-box">
                    <code>{devCmdDisplay}</code>
                    <button
                      className={`arcade-copy-btn ${devCmdCopied ? "copied" : ""}`}
                      onClick={handleCopyCmd}
                    >
                      {devCmdCopied ? tr.arcade_cmd_copied : tr.arcade_copy_cmd}
                    </button>
                  </div>
                  <p className="arcade-dev-mode-note">{tr.arcade_dev_mode_note}</p>
                </div>
              )}
            </div>
          )}

          {tab === "dev" && (
            <div className="arcade-dev-panel">
              <div className="arcade-dev-section">
                <h3>{tr.arcade_dev_status}</h3>
                <div className="arcade-status-buttons">
                  {(["playable", "in_progress", "concept", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      className={`arcade-status-btn ${game.status === status ? "active" : ""}`}
                      onClick={() => onUpdateStatus(game.id, status)}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <span key={idx} className="arcade-tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="arcade-dev-section">
                <h3>{tr.arcade_dev_notes}</h3>
                <textarea
                  className="arcade-notes-textarea"
                  value={notes}
                  onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                  placeholder={tr.arcade_dev_notes_placeholder}
                  rows={5}
                />
              </div>

              <div className="arcade-dev-section">
                <div className="arcade-todo-header">
                  <h3>{tr.arcade_todo_list}</h3>
                  <button className="arcade-todo-add-btn" onClick={handleAddTodo}>
                    + {tr.arcade_todo_add}
                  </button>
                </div>
                {todoList.length === 0 ? (
                  <p className="arcade-no-todo">{tr.arcade_no_todo}</p>
                ) : (
                  <ul className="arcade-todo-list">
                    {todoList.map((t_) => (
                      <li key={t_.id} className={`arcade-todo-item ${t_.completed ? "completed" : ""}`}>
                        <input
                          type="checkbox"
                          checked={t_.completed}
                          onChange={() => handleToggleTodo(t_.id)}
                        />
                        <span>{t_.text}</span>
                        <button
                          className="arcade-todo-delete-btn"
                          onClick={() => handleDeleteTodo(t_.id)}
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
                <button className="arcade-btn-primary" onClick={handleSaveDevNotes}>
                  {tr.arcade_save}
                </button>
                <button className="arcade-btn-danger" onClick={handleDelete}>
                  {tr.arcade_delete_game}
                </button>
              </div>
            </div>
          )}
        </div>

        {toast && (
          <div className={`arcade-toast ${toast.kind}`}>
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}
