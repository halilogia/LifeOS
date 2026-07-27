import { useState, useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { SidebarNavItem } from "./sidebar/SidebarNavItem.js";
import { SidebarIcon } from "./sidebar/SidebarIcons.js";

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
  "list",
  "willpower",
  "pomodoro",
  "eisenhower",
  "ai-chat",
  "notes",
  "calendar",
  "srs",
  "hifiz",
  "prayer",
  "kpss",
  "detox",
  "free-games",
  "bist",
];

export function Sidebar({
  lang,
  activeView,
  activeTab: _activeTab,
  sidebarOpen,
  onViewChange,
  onTabChange: _onTabChange,
  onSidebarToggle,
  onSettingsOpen,
  onOrderChange,
}: SidebarProps) {
  const t = getTranslation(lang);
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  useEffect(() => {
    new Promise<string[]>((resolve) =>
      chrome.storage.sync.get(["sidebarOrder"], (res) =>
        resolve((res.sidebarOrder as string[]) || []),
      ),
    ).then((saved) => {
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

  const handleDragOver = (e: any, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverItem !== id) {
      setDragOverItem(id);
    }
  };

  const handleDragLeave = (id: string) => {
    if (dragOverItem === id) {
      setDragOverItem(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = async (e: any, targetId: string) => {
    e.preventDefault();
    const currentItem = draggedItem;
    setDraggedItem(null);
    setDragOverItem(null);
    if (!currentItem || currentItem === targetId) {
      return;
    }

    const nextOrder = [...order];
    const draggedIdx = nextOrder.indexOf(currentItem);
    const targetIdx = nextOrder.indexOf(targetId);

    if (draggedIdx === -1 || targetIdx === -1) {
      return;
    }

    nextOrder.splice(draggedIdx, 1);
    nextOrder.splice(targetIdx, 0, currentItem);

    setOrder(nextOrder);
    chrome.storage.sync.set({ sidebarOrder: nextOrder });
    if (onOrderChange) {
      onOrderChange(nextOrder);
    }
  };

  const getItemLabel = (key: string): string => {
    switch (key) {
      case "list":
        return (
          t.view_todos ||
          (lang === "tr" ? "Odağım (Görev Listesi)" : "My Focus")
        );
      case "willpower":
        return (
          t.view_willpower || (lang === "tr" ? "Kişisel Disiplin" : "Willpower")
        );
      case "pomodoro":
        return t.view_pomodoro || "Pomodoro";
      case "eisenhower":
        return (
          t.view_eisenhower ||
          (lang === "tr" ? "Kanban Matrisi" : "Kanban Board")
        );
      case "ai-chat":
        return (
          t.view_ai_chat || (lang === "tr" ? "AI Asistan" : "AI Assistant")
        );
      case "notes":
        return t.view_notes || (lang === "tr" ? "Günlüğüm" : "My Diary");
      case "calendar":
        return t.view_calendar || (lang === "tr" ? "Takvim" : "Calendar");
      case "srs":
        return (
          t.view_srs ||
          (lang === "tr" ? "Aralıklı Tekrar" : "Spaced Repetition")
        );
      case "hifiz":
        return (
          t.view_hifiz ||
          (lang === "tr" ? "Aday Din Görevlisi Yeterlilikleri" : "Competencies")
        );
      case "prayer":
        return (
          t.view_prayer || (lang === "tr" ? "Namaz Vakitleri" : "Prayer Times")
        );
      case "kpss":
        return t.view_kpss || (lang === "tr" ? "KPSS Ders Takip" : "KPSS Prep");
      case "detox":
        return (
          t.view_detox || (lang === "tr" ? "Dijital Detoks" : "Digital Detox")
        );
      case "free-games":
        return (
          t.view_free_games ||
          (lang === "tr" ? "Ücretsiz Oyunlar" : "Free Games")
        );
      case "bist":
        return lang === "tr" ? "BIST & Halka Arz OS" : "BIST & IPOs OS";
      case "halka-arz":
        return (
          t.view_halka_arz ||
          (lang === "tr" ? "Halka Arz & Hisse" : "IPOs & Stocks")
        );
      default:
        return key;
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
          {order.map((key) => (
            <SidebarNavItem
              key={key}
              itemKey={key}
              label={getItemLabel(key)}
              active={activeView === key}
              isDragging={draggedItem === key}
              isDragOver={dragOverItem === key}
              onClick={() => onViewChange(key)}
              onDragStart={(e) => handleDragStart(e, key)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={() => handleDragLeave(key)}
              onDrop={(e) => handleDrop(e, key)}
            />
          ))}

          <div className="sidebar-divider"></div>

          <button
            id="settings-btn"
            className="sidebar-btn"
            onClick={onSettingsOpen}
          >
            <SidebarIcon itemKey="settings" />
            <span>{t.settings_title}</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
