import { useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import { SidebarNavItem } from "./sidebar/SidebarNavItem.js";
import { SidebarIcon } from "./sidebar/SidebarIcons.js";
import { useSidebarOrder } from "@/presentation/hooks/useSidebarOrder.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { useSidebarUsageStore } from "@/presentation/store/sidebarUsageStore.js";

interface SidebarProps {
  lang: Language;
  activeView: string;
  activeTab: "focus" | "routines";
  sidebarOpen: boolean;
  onViewChange: (view: string) => void;
  onTabChange: (tab: "focus" | "routines") => void;
  onSidebarToggle: () => void;
  onSettingsOpen: () => void;
  onOrderChange?: (newOrder: string[]) => void;
}

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
  const { order, setOrder, saveOrder } = useSidebarOrder();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [hiddenDrawerOpen, setHiddenDrawerOpen] = useState(false);
  const pinnedViews = useSidebarUsageStore((s) => s.pinnedViews);
  const togglePin = useSidebarUsageStore((s) => s.togglePin);
  const hiddenViews = useSidebarUsageStore((s) => s.hiddenViews);
  const toggleHide = useSidebarUsageStore((s) => s.toggleHide);
  const unhideAll = useSidebarUsageStore((s) => s.unhideAll);

  const visibleOrder = order.filter((k) => !hiddenViews.includes(k));
  const hiddenOrder = order.filter((k) => hiddenViews.includes(k));

  const handlePinToggle = async (key: string) => {
    const usage = useSidebarUsageStore.getState();
    await usage.togglePin(key);
  };

  const handleHideToggle = async (key: string) => {
    const isCurrentlyHidden = hiddenViews.includes(key);
    if (!isCurrentlyHidden && activeView === key) {
      const remainingVisible = visibleOrder.filter((k) => k !== key);
      const nextView =
        remainingVisible.length > 0 ? remainingVisible[0] : "free-games";
      onViewChange(nextView);
    }
    await toggleHide(key);
  };

  const handleDragStart = (e: DragEvent, id: string) => {
    setDraggedItem(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
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

  const handleDrop = async (e: DragEvent, targetId: string) => {
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
    saveOrder(nextOrder);
    if (onOrderChange) {
      onOrderChange(nextOrder);
    }

    // Drag-drop = manuel müdahale → auto-sort kapatılır (kullanıcı isteği).
    // Aynı render tick içinde sıralamayı yeniden yazma (suppress flag).
    const ui = useUIStore.getState();
    if (ui.autoSortEnabled) {
      void ui.setAutoSortEnabled(false);
      ui.setAlertDialog({
        isOpen: true,
        message:
          (getTranslation(lang)
            .settings_sidebar_drag_disabled_auto_sort as string) ||
          "Otomatik sıralama kapatıldı — manuel sıralama aktif.",
        onConfirm: () => {
          ui.setAlertDialog({ isOpen: false, message: "" });
        },
      });
    }
  };

  const getItemLabel = (key: string): string => {
    switch (key) {
      case "list":
        return t.sidebar_focus;
      case "willpower":
        return t.sidebar_willpower;
      case "pomodoro":
        return t.view_pomodoro || "Pomodoro";
      case "eisenhower":
        return t.sidebar_kanban;
      case "ai-chat":
        return t.sidebar_ai_chat;
      case "notes":
        return t.sidebar_notes;
      case "calendar":
        return t.sidebar_calendar;
      case "srs":
        return t.sidebar_srs;
      case "rss":
        return t.rss_sidebar || "RSS";
      case "hifiz":
        return t.sidebar_hifiz;
      case "prayer":
        return t.sidebar_prayer;
      case "kpss":
        return t.sidebar_kpss;
      case "detox":
        return t.sidebar_detox;
      case "arcade":
        return t.sidebar_arcade;
      case "free-games":
        return t.sidebar_free_games;
      case "game-assets":
        return t.sidebar_game_assets || "Ücretsiz Assetler";
      case "city-pulse":
        return t.sidebar_city_pulse;
      case "gov-jobs":
        return t.sidebar_gov_jobs || "Kamu İşe Alım";
      case "bist":
        return t.sidebar_bist;
      case "network":
        return t.sidebar_network || "Network Health";
      case "media":
        return t.sidebar_media || "Media & Library";
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
          {visibleOrder.map((key) => (
            <SidebarNavItem
              key={key}
              itemKey={key}
              label={getItemLabel(key)}
              active={activeView === key}
              isDragging={draggedItem === key}
              isDragOver={dragOverItem === key}
              isPinned={pinnedViews.includes(key)}
              onPinToggle={() => handlePinToggle(key)}
              onHideToggle={() => handleHideToggle(key)}
              hideTitle={t.sidebar_hide_item}
              pinTitle={t.sidebar_pin_item}
              onClick={() => onViewChange(key)}
              onDragStart={(e) => handleDragStart(e, key)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={() => handleDragLeave(key)}
              onDrop={(e) => handleDrop(e, key)}
            />
          ))}

          {hiddenOrder.length > 0 && (
            <div className="sidebar-hidden-wrapper">
              <button
                type="button"
                className={`sidebar-hidden-toggle ${hiddenDrawerOpen ? "open" : ""}`}
                onClick={() => setHiddenDrawerOpen(!hiddenDrawerOpen)}
                title={t.sidebar_hidden_section}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="sidebar-hidden-icon"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span className="sidebar-hidden-label">
                  {t.sidebar_hidden_section}
                </span>
                <span className="sidebar-hidden-badge">
                  {hiddenOrder.length}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className={`sidebar-hidden-chevron ${hiddenDrawerOpen ? "rotated" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {hiddenDrawerOpen && (
                <div className="sidebar-hidden-drawer">
                  <div className="sidebar-hidden-header">
                    <button
                      type="button"
                      className="sidebar-unhide-all-btn"
                      onClick={() => void unhideAll()}
                    >
                      {t.sidebar_unhide_all}
                    </button>
                  </div>
                  <div className="sidebar-hidden-list">
                    {hiddenOrder.map((key) => (
                      <div key={key} className="sidebar-hidden-item">
                        <SidebarIcon itemKey={key} />
                        <span className="sidebar-hidden-item-name">
                          {getItemLabel(key)}
                        </span>
                        <button
                          type="button"
                          className="sidebar-unhide-btn"
                          title={t.sidebar_unhide_item}
                          onClick={() => void handleHideToggle(key)}
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
