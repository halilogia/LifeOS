import { useState, useEffect } from "preact/hooks";
import { GameEntry, DevTodoItem } from "@/types/game.js";
import { Language } from "@/types/types.js";
import { translations } from "@/utils/i18n.js";
import { SnakeGame } from "./builtin/SnakeGame.js";
import { KnightRunner } from "./builtin/KnightRunner.js";
import { SpaceShooter } from "./builtin/SpaceShooter.js";

interface ArcadeGameModalProps {
  game: GameEntry;
  lang: Language;
  onClose: () => void;
  onUpdateScore: (gameId: string, score: number) => void;
  onUpdateStatus?: (gameId: string, status: GameEntry["status"]) => void;
  onUpdateDevNotes: (gameId: string, notes: string, todoList: DevTodoItem[]) => void;
  onDeleteGame?: (gameId: string) => void;
}

export function ArcadeGameModal({
  game,
  lang,
  onClose,
  onUpdateScore,
  onUpdateStatus,
  onUpdateDevNotes,
  onDeleteGame,
}: ArcadeGameModalProps) {
  const t = translations[lang];
  const tr = t as Record<string, string>;

  const [activeTab, setActiveTab] = useState<"game" | "dev">("game");
  const [devNotesText, setDevNotesText] = useState(game.devNotes || "");
  const [todoItems, setTodoItems] = useState<DevTodoItem[]>(game.todoList || []);
  const [newTodoInput, setNewTodoInput] = useState("");

  useEffect(() => {
    setDevNotesText(game.devNotes || "");
    setTodoItems(game.todoList || []);
  }, [game]);

  const handleScoreUpdate = (newScore: number) => {
    onUpdateScore(game.id, newScore);
  };

  const handleSaveDevNotes = () => {
    onUpdateDevNotes(game.id, devNotesText, todoItems);
  };

  const handleAddTodo = () => {
    if (!newTodoInput.trim()) return;
    const newItem: DevTodoItem = {
      id: "todo_" + Date.now(),
      text: newTodoInput.trim(),
      completed: false,
    };
    const updated = [...todoItems, newItem];
    setTodoItems(updated);
    setNewTodoInput("");
    onUpdateDevNotes(game.id, devNotesText, updated);
  };

  const handleToggleTodo = (id: string) => {
    const updated = todoItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodoItems(updated);
    onUpdateDevNotes(game.id, devNotesText, updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todoItems.filter((item) => item.id !== id);
    setTodoItems(updated);
    onUpdateDevNotes(game.id, devNotesText, updated);
  };

  const renderGameCanvas = () => {
    if (game.embedType === "builtin") {
      if (game.builtinKey === "snake") {
        return <SnakeGame onScoreUpdate={handleScoreUpdate} highScore={game.highScore} />;
      }
      if (game.builtinKey === "knight") {
        return <KnightRunner onScoreUpdate={handleScoreUpdate} highScore={game.highScore} />;
      }
      if (game.builtinKey === "space") {
        return <SpaceShooter onScoreUpdate={handleScoreUpdate} highScore={game.highScore} />;
      }
    }

    if (game.embedType === "iframe" && game.iframeUrl) {
      return (
        <div className="arcade-iframe-container">
          <div className="arcade-iframe-bar">
            <span className="arcade-url-label">{game.iframeUrl}</span>
            <a href={game.iframeUrl} target="_blank" rel="noreferrer" className="arcade-open-tab-btn">
              Yeni Sekmede Aç ↗
            </a>
          </div>
          <iframe
            src={game.iframeUrl}
            title={game.title}
            className="arcade-game-iframe"
            allow="fullscreen; autoplay; gamepad"
          />
        </div>
      );
    }

    return (
      <div className="arcade-no-embed">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="12" rx="4" />
          <path d="M6 12h4m-2-2v4m9-2h.01m3-2h.01" />
        </svg>
        <p>Bu proje yerel geliştirme sunucusu üzerinden çalıştırılır.</p>
        <p className="path-code">{game.devPath || "C:\\Users\\emre_\\Desktop\\GitHub\\In Progress"}</p>
        <div className="arcade-cmd-hint">
          <code>cd "{game.devPath}" && npm run dev</code>
        </div>
      </div>
    );
  };

  return (
    <div className="arcade-modal-backdrop" onClick={onClose}>
      <div className="arcade-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="arcade-modal-header">
          <div className="arcade-modal-title-box">
            <h3>{game.title}</h3>
            <span className="arcade-modal-cat">{game.category.toUpperCase()}</span>
          </div>

          <div className="arcade-modal-tabs">
            <button
              className={`modal-tab-btn ${activeTab === "game" ? "active" : ""}`}
              onClick={() => setActiveTab("game")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{tr.arcade_tab_play || "Oyna"}</span>
            </button>

            <button
              className={`modal-tab-btn ${activeTab === "dev" ? "active" : ""}`}
              onClick={() => setActiveTab("dev")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{tr.arcade_tab_dev || "Steam Dev Log"}</span>
            </button>
          </div>

          <button className="arcade-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="arcade-modal-body">
          {activeTab === "game" ? (
            <div className="arcade-game-view-wrapper">{renderGameCanvas()}</div>
          ) : (
            <div className="arcade-steam-dev-panel">
              {/* Top Stats Grid */}
              <div className="steam-stats-grid">
                <div className="steam-stat-card">
                  <span className="stat-label">En Yüksek Skor</span>
                  <span className="stat-val highlight">{game.highScore}</span>
                </div>
                <div className="steam-stat-card">
                  <span className="stat-label">Oynanma Sayısı</span>
                  <span className="stat-val">{game.playCount || 0}</span>
                </div>
                <div className="steam-stat-card">
                  <span className="stat-label">Geliştirme Durumu</span>
                  {onUpdateStatus ? (
                    <select
                      className="steam-status-select"
                      value={game.status}
                      onChange={(e) => onUpdateStatus(game.id, (e.target as HTMLSelectElement).value as any)}
                    >
                      <option value="playable">Oynanabilir (Playable)</option>
                      <option value="in_progress">Geliştiriliyor (In Progress)</option>
                      <option value="concept">Konsept (Concept)</option>
                    </select>
                  ) : (
                    <span className="stat-val status-val">{game.status.toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Dev Path Info */}
              {game.devPath && (
                <div className="steam-dev-path-box">
                  <span className="box-title">Proje Klasör Yolu (In Progress)</span>
                  <code className="path-string">{game.devPath}</code>
                </div>
              )}

              {/* Tech Stack Badges */}
              {game.techStack && game.techStack.length > 0 && (
                <div className="steam-tech-stack">
                  <span className="box-title">Kullanılan Teknolojiler & Kütüphaneler</span>
                  <div className="tech-tags-list">
                    {game.techStack.map((tech, idx) => (
                      <span key={idx} className="tech-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dev Notes Text Area */}
              <div className="steam-notes-section">
                <span className="box-title">Geliştirici Notları & Yama Geçmişi</span>
                <textarea
                  className="steam-notes-textarea"
                  value={devNotesText}
                  placeholder="Oyun güncellemeleri, tasarım fikirleri ve mekanik notları..."
                  onInput={(e) => setDevNotesText((e.target as HTMLTextAreaElement).value)}
                  onBlur={handleSaveDevNotes}
                />
              </div>

              {/* Dev Todo List */}
              <div className="steam-todo-section">
                <span className="box-title">Geliştirme Yapılacaklar Listesi (To-Do)</span>
                <div className="steam-todo-input-row">
                  <input
                    type="text"
                    placeholder="Yeni yapılacak görev ekle..."
                    value={newTodoInput}
                    onInput={(e) => setNewTodoInput((e.target as HTMLInputElement).value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                  />
                  <button onClick={handleAddTodo} className="todo-add-btn">
                    Ekle
                  </button>
                </div>

                <div className="steam-todo-items-list">
                  {todoItems.length === 0 ? (
                    <p className="no-todo-text">Henüz yapılacak görev eklenmedi.</p>
                  ) : (
                    todoItems.map((item) => (
                      <div key={item.id} className={`steam-todo-item ${item.completed ? "completed" : ""}`}>
                        <label className="todo-checkbox-label">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleTodo(item.id)}
                          />
                          <span className="todo-text">{item.text}</span>
                        </label>
                        <button className="todo-del-btn" onClick={() => handleDeleteTodo(item.id)}>
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {onDeleteGame && (
                <div className="steam-danger-zone">
                  <button className="delete-game-btn" onClick={() => onDeleteGame(game.id)}>
                    Oyunu Kütüphaneden Sil
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

