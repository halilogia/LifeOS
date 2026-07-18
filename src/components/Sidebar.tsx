import { useState, useEffect } from "preact/hooks";
import { Language } from "../types/types.js";
import { translations } from "../utils/i18n.js";
import { storage } from "../core/storage.js";

interface SidebarProps {
  lang: Language;
  activeView: string;
  activeTab: "focus" | "routines";
  sidebarOpen: boolean;
  onViewChange: (view: any) => void;
  onTabChange: (tab: "focus" | "routines") => void;
  onSidebarToggle: () => void;
  onSettingsOpen: () => void;
  onOrderChange?: (newOrder: string[]) => void;
}

const DEFAULT_ORDER = [
  "free-games",
  "ai-chat",
  "list",
  "willpower",
  "pomodoro",
  "kanban",
  "eisenhower",
  "hifiz",
  "notes",
  "srs",
  "calendar",
  "prayer",
  "kpss",
  "halka-arz",
  "detox"
];

export function Sidebar({
  lang,
  activeView,
  activeTab: _activeTab,
  sidebarOpen,
  onViewChange,
  onTabChange,
  onSidebarToggle,
  onSettingsOpen,
  onOrderChange,
}: SidebarProps) {
  const t = translations[lang];
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    storage.getSidebarOrder().then((saved) => {
      let finalOrder = DEFAULT_ORDER;
      if (saved && saved.length > 0) {
        // Filter out deprecated keys, append missing ones
        const filtered = saved.filter((k) => DEFAULT_ORDER.includes(k));
        const missing = DEFAULT_ORDER.filter((k) => !filtered.includes(k));
        finalOrder = [...filtered, ...missing];
      }
      setOrder(finalOrder);
      if (onOrderChange) {
        onOrderChange(finalOrder);
      }
    });
  }, []);

  const handleDragStart = (e: any, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: any, _id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: any, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const nextOrder = [...order];
    const draggedIdx = nextOrder.indexOf(draggedItem);
    const targetIdx = nextOrder.indexOf(targetId);

    nextOrder.splice(draggedIdx, 1);
    nextOrder.splice(targetIdx, 0, draggedItem);

    setOrder(nextOrder);
    setDraggedItem(null);
    await storage.setSidebarOrder(nextOrder);
    if (onOrderChange) {
      onOrderChange(nextOrder);
    }
  };

  return (
    <>
      <button
        id="sidebar-toggle"
        className="sidebar-toggle"
        onClick={onSidebarToggle}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <aside id="sidebar" className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">Life OS</h2>
        </div>
        <nav className="sidebar-nav">
          {order.map((key) => {
            const active = activeView === key;
            const itemClass = `sidebar-btn ${active ? "active" : ""} ${draggedItem === key ? "dragging" : ""}`;

            switch (key) {
              case "free-games":
                return (
                  <button
                    key={key}
                    id="view-free-games-btn"
                    className={itemClass}
                    onClick={() => onViewChange("free-games")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <path d="M6 12h4M8 10v4M15 11v.01M18 13v.01" />
                    </svg>
                    <span>{t.view_free_games}</span>
                  </button>
                );
              case "ai-chat":
                return (
                  <button
                    key={key}
                    id="view-ai-chat-btn"
                    className={itemClass}
                    onClick={() => onViewChange("ai-chat")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{t.view_ai_chat}</span>
                  </button>
                );
              case "list":
                return (
                  <button
                    key={key}
                    id="view-list-btn"
                    className={itemClass}
                    onClick={() => {
                      onViewChange("list");
                      onTabChange("focus");
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    <span>{t.view_list}</span>
                  </button>
                );
              case "willpower":
                return (
                  <button
                    key={key}
                    id="view-willpower-btn"
                    className={itemClass}
                    onClick={() => onViewChange("willpower")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>{t.view_willpower}</span>
                  </button>
                );
              case "pomodoro":
                return (
                  <button
                    key={key}
                    id="view-pomodoro-btn"
                    className={itemClass}
                    onClick={() => onViewChange("pomodoro")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M10 2h4"></path>
                      <path d="M12 14v-4"></path>
                      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-8 7z"></path>
                    </svg>
                    <span>{t.view_pomodoro}</span>
                  </button>
                );
              case "kanban":
                return (
                  <button
                    key={key}
                    id="view-kanban-btn"
                    className={itemClass}
                    onClick={() => onViewChange("kanban")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                      <line x1="15" y1="3" x2="15" y2="21"></line>
                    </svg>
                    <span>{t.view_kanban}</span>
                  </button>
                );
              case "eisenhower":
                return (
                  <button
                    key={key}
                    id="view-eisenhower-btn"
                    className={itemClass}
                    onClick={() => onViewChange("eisenhower")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    </svg>
                    <span>{lang === "tr" ? "Eisenhower Matrisi" : "Eisenhower Matrix"}</span>
                  </button>
                );
              case "hifiz":
                return (
                  <button
                    key={key}
                    id="view-hifiz-btn"
                    className={itemClass}
                    onClick={() => onViewChange("hifiz")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span>{lang === "tr" ? "Ezberlerim" : "Memorizations"}</span>
                  </button>
                );
              case "notes":
                return (
                  <button
                    key={key}
                    id="view-notes-btn"
                    className={itemClass}
                    onClick={() => onViewChange("notes")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>{t.view_notes}</span>
                  </button>
                );
              case "srs":
                return (
                  <button
                    key={key}
                    id="view-srs-btn"
                    className={itemClass}
                    onClick={() => onViewChange("srs")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.84-10.4L2 8"></path>
                    </svg>
                    <span>{t.view_srs}</span>
                  </button>
                );
              case "calendar":
                return (
                  <button
                    key={key}
                    id="view-calendar-btn"
                    className={itemClass}
                    onClick={() => onViewChange("calendar")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{t.view_calendar}</span>
                  </button>
                );
              case "prayer":
                return (
                  <button
                    key={key}
                    id="view-prayer-btn"
                    className={itemClass}
                    onClick={() => onViewChange("prayer")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
                      <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                    <span>{t.view_prayer}</span>
                  </button>
                );
              case "kpss":
                return (
                  <button
                    key={key}
                    id="view-kpss-btn"
                    className={itemClass}
                    onClick={() => onViewChange("kpss")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      <path d="M12 6v4"></path>
                      <path d="M12 14v.01"></path>
                    </svg>
                    <span>{t.view_kpss}</span>
                  </button>
                );
              case "halka-arz":
                return (
                  <button
                    key={key}
                    id="view-halka-arz-btn"
                    className={itemClass}
                    onClick={() => onViewChange("halka-arz")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                    <span>{t.view_halka_arz}</span>
                  </button>
                );
              case "detox":
                return (
                  <button
                    key={key}
                    id="view-detox-btn"
                    className={itemClass}
                    onClick={() => onViewChange("detox")}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={(e) => handleDragOver(e, key)}
                    onDrop={(e) => handleDrop(e, key)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{t.view_detox}</span>
                  </button>
                );
              default:
                return null;
            }
          })}

          <div className="sidebar-divider"></div>

          <button
            id="settings-btn"
            className="sidebar-btn"
            onClick={onSettingsOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>{t.settings_title}</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
