import { useState, useEffect } from "preact/hooks";
import { storage } from "./core/storage.js";
import {
  checkAndResetRepeatingTasks,
  moveTaskWithStatus,
  getUpdatedStatuses,
} from "./features/tasks.js";
import { translations } from "./utils/i18n.js";
import { Language, Todo } from "./types/types.js";

// Import View Components
import { Sidebar } from "./components/Sidebar.js";
import { ListView } from "./components/ListView.js";
import { KanbanView } from "./components/KanbanView.js";
import { NotesView } from "./components/NotesView.js";
import { PomodoroView } from "./components/PomodoroView.js";
import { WillpowerView } from "./components/WillpowerView.js";
import { HifizView } from "./components/HifizView.js";
import { SrsView } from "./components/SrsView.js";
import { CalendarView } from "./components/CalendarView.js";
import { PrayerView } from "./components/PrayerView.js";
import { KpssView } from "./components/KpssView.js";
import { FreeGamesView } from "./components/FreeGamesView.js";
import { DetoxView } from "./components/DetoxView.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";

export function App() {
  // Navigation & UI States
  const [lang, setLang] = useState<Language>("tr");
  const [activeView, setActiveView] = useState<string>("free-games");
  const [activeTab, setActiveTab] = useState<"focus" | "routines">("focus");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Free games notification toggle
  const [freeGamesNotificationsEnabled, setFreeGamesNotificationsEnabled] =
    useState(true);

  // Universal Info Box / Inline Translation Bubble states
  const [universalInfoBoxEnabled, setUniversalInfoBoxEnabled] = useState(true);
  const [universalInfoBoxHotkey, setUniversalInfoBoxHotkey] = useState("none");

  // Custom confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Time & Date State
  const [clockText, setClockText] = useState("00:00");
  const [dateText, setDateText] = useState("");

  // Quotes State
  const [quoteText, setQuoteText] = useState("");

  // Global Sync Todos State
  const [todos, setTodos] = useState<Todo[]>([]);

  // Todo Input States (moved to root level for correct fixed-position layout alignment)
  const [todoText, setTodoText] = useState("");
  const [todoRepeat, setTodoRepeat] = useState<Todo["repeat"]>("none");

  useEffect(() => {
    setTodoRepeat(activeTab === "focus" ? "none" : "daily");
  }, [activeTab]);

  const t = translations[lang];

  // Initialize and load configurations
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Run storage migrations (sync storage setup)
      await storage.migrateLocalToSync();

      // 2. Load configurations
      const config = await storage.getSettings();
      setLang(config.lang);
      setSidebarOpen(config.sidebarOpen ?? true);
      setFreeGamesNotificationsEnabled(
        config.freeGamesNotificationsEnabled ?? true,
      );
      setUniversalInfoBoxEnabled(config.universalInfoBoxEnabled ?? true);
      setUniversalInfoBoxHotkey(config.universalInfoBoxHotkey || "none");

      // Apply body class for legacy CSS compatibilities
      document.body.classList.toggle(
        "sidebar-open",
        config.sidebarOpen ?? true,
      );

      // 3. Load and clean task items
      const loadedTodos = await storage.getTodos();
      const clone = JSON.parse(JSON.stringify(loadedTodos));
      const hasResets = checkAndResetRepeatingTasks(clone);
      if (hasResets) {
        await storage.setTodos(clone);
        setTodos(clone);
      } else {
        setTodos(loadedTodos);
      }

      // 4. Set quote
      refreshQuote(config.lang);
    };

    initializeApp();

    // Setup clocks ticking interval
    const clockInterval = setInterval(refreshClock, 1000);
    refreshClock();

    return () => clearInterval(clockInterval);
  }, []);

  // Update clock elements in real-time
  const refreshClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setClockText(`${hours}:${minutes}`);

    const locale = lang === "tr" ? "tr-TR" : "en-US";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    setDateText(now.toLocaleDateString(locale, options));
  };

  // Trigger language change updates
  useEffect(() => {
    refreshClock();
    refreshQuote(lang);
  }, [lang]);

  // Load a random quote from default translations + user custom quotes
  const refreshQuote = async (activeLang: Language) => {
    const customQuotes = await storage.getCustomQuotes();
    const defaultQuoteCount = 7;
    const poolSize = defaultQuoteCount + customQuotes.length;
    const randomIndex = Math.floor(Math.random() * poolSize);

    if (randomIndex < defaultQuoteCount) {
      const quoteKeys = [
        "quote_1",
        "quote_2",
        "quote_3",
        "quote_4",
        "quote_5",
        "quote_6",
        "quote_7",
      ];
      const randomKey = quoteKeys[
        randomIndex
      ] as keyof (typeof translations)["tr"];
      setQuoteText(translations[activeLang][randomKey]);
    } else {
      const custom = customQuotes[randomIndex - defaultQuoteCount];
      setQuoteText(
        custom.author
          ? `"${custom.text}" — ${custom.author}`
          : `"${custom.text}"`,
      );
    }
  };

  // --- Task Mutators ---
  const handleAddTodo = async (text: string, repeat: Todo["repeat"]) => {
    const newTodo: Todo = {
      text,
      completed: false,
      repeat,
      status: "todo",
      category: "general",
      lastCompletedDate: "",
    };
    const next = [...todos, newTodo];
    await storage.setTodos(next);
    setTodos(next);
  };

  const handleToggleTodo = async (index: number) => {
    const next = [...todos];
    const item = next[index];

    item.completed = !item.completed;
    item.status = item.completed ? "done" : "todo";

    if (item.completed) {
      const now = new Date().toISOString();
      item.lastCompletedDate = now;
      if (!item.completedDates) {
        item.completedDates = [];
      }
      item.completedDates.push(now);
    }

    await storage.setTodos(next);
    setTodos(next);
  };

  const handleDeleteTodo = async (index: number) => {
    const next = todos.filter((_, idx) => idx !== index);
    await storage.setTodos(next);
    setTodos(next);
  };

  const handleMoveTaskStatus = async (
    index: number,
    newStatus: Todo["status"],
  ) => {
    const next = [...todos];
    moveTaskWithStatus(index, newStatus, next);
    await storage.setTodos(next);
    setTodos(next);
  };

  const handleMoveTaskDirection = async (index: number, direction: number) => {
    const next = [...todos];
    const newStatus = getUpdatedStatuses(next, index, direction);
    if (newStatus) {
      moveTaskWithStatus(index, newStatus, next);
      await storage.setTodos(next);
      setTodos(next);
    }
  };

  // --- Sidebar toggles ---
  const handleSidebarToggle = () => {
    const stateVal = !sidebarOpen;
    setSidebarOpen(stateVal);
    storage.setSidebarOpen(stateVal);
    document.body.classList.toggle("sidebar-open", stateVal);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // --- Settings Panel operations ---
  const handleToggleLang = async () => {
    const nextLang: Language = lang === "tr" ? "en" : "tr";
    setLang(nextLang);
    await storage.setLang(nextLang);
  };

  const handleExportBackup = async () => {
    const dataList = await storage.getTodos();
    const blob = new Blob([JSON.stringify(dataList, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentodo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) {
          await storage.setTodos(parsed);
          setTodos(parsed);
          alert(translations[lang].alert_restore_success);
        } else {
          alert(translations[lang].alert_restore_invalid);
        }
      } catch (err) {
        console.error(err);
        alert(translations[lang].alert_restore_error);
      }
      input.value = "";
    };
    reader.readAsText(input.files[0]);
  };

  const handleToggleFreeGamesNotifications = async () => {
    const nextVal = !freeGamesNotificationsEnabled;
    await storage.setFreeGamesNotificationsEnabled(nextVal);
    setFreeGamesNotificationsEnabled(nextVal);
  };

  const handleToggleUniversalInfoBox = async () => {
    const nextVal = !universalInfoBoxEnabled;
    await storage.setUniversalInfoBox(nextVal, universalInfoBoxHotkey);
    setUniversalInfoBoxEnabled(nextVal);
  };

  const handleUniversalInfoBoxHotkeyChange = async (hotkey: string) => {
    await storage.setUniversalInfoBox(universalInfoBoxEnabled, hotkey);
    setUniversalInfoBoxHotkey(hotkey);
  };

  const handleClearAllData = async () => {
    const confirmMsg =
      lang === "tr"
        ? "Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?"
        : "All your data will be permanently deleted. Are you sure?";

    showConfirm(confirmMsg, async () => {
      await storage.clearAll(lang);
      window.location.reload();
    });
  };

  // Render current dashboard card sub-view
  const renderActiveViewComponent = () => {
    switch (activeView) {
      case "list":
        return (
          <ListView
            todos={todos}
            activeTab={activeTab}
            lang={lang}
            onTabChange={setActiveTab}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        );
      case "kanban":
        return (
          <KanbanView
            todos={todos}
            lang={lang}
            onMoveTaskStatus={handleMoveTaskStatus}
            onMoveTaskDirection={handleMoveTaskDirection}
          />
        );
      case "notes":
        return <NotesView lang={lang} onShowConfirm={showConfirm} />;
      case "pomodoro":
        return <PomodoroView lang={lang} />;
      case "willpower":
        return <WillpowerView lang={lang} onShowConfirm={showConfirm} />;
      case "hifiz":
        return <HifizView lang={lang} />;
      case "srs":
        return <SrsView lang={lang} />;
      case "calendar":
        return <CalendarView todos={todos} lang={lang} />;
      case "prayer":
        return <PrayerView lang={lang} />;
      case "kpss":
        return <KpssView lang={lang} onShowConfirm={showConfirm} />;
      case "free-games":
        return <FreeGamesView lang={lang} />;
      case "detox":
        return <DetoxView lang={lang} />;
      default:
        return <FreeGamesView lang={lang} />;
    }
  };

  return (
    <>
      {/* Background visual overlay blur */}
      <div className="background-overlay"></div>

      {/* Sidebar Navigation */}
      <Sidebar
        lang={lang}
        activeView={activeView}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onViewChange={handleViewChange}
        onTabChange={(tabVal) => {
          setActiveView("list");
          setActiveTab(tabVal);
        }}
        onSidebarToggle={handleSidebarToggle}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* Top Input Header (fixed positioning at the top viewport) */}
      {activeView === "list" && (
        <header className="top-header" style={{ display: "flex" }}>
          <div className="global-input-container">
            <div className="input-group">
              <input
                type="text"
                id="todo-input"
                value={todoText}
                onInput={(e) =>
                  setTodoText((e.target as HTMLInputElement).value)
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (todoText.trim()) {
                      handleAddTodo(todoText.trim(), todoRepeat);
                      setTodoText("");
                    }
                  }
                }}
                placeholder={t.todo_placeholder}
                autocomplete="off"
              />
              <select
                id="repeat-select"
                className="repeat-select"
                value={todoRepeat}
                onChange={(e) =>
                  setTodoRepeat(
                    (e.target as HTMLSelectElement).value as Todo["repeat"],
                  )
                }
              >
                <option value="none">{t.repeat_none}</option>
                <option value="daily">{t.repeat_daily}</option>
                <option value="weekly">{t.repeat_weekly}</option>
                <option value="monthly">{t.repeat_monthly}</option>
              </select>
              <button
                id="add-btn"
                onClick={() => {
                  if (todoText.trim()) {
                    handleAddTodo(todoText.trim(), todoRepeat);
                    setTodoText("");
                  }
                }}
                aria-label="Add Task"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Settings Panel Drawer Modal */}
      {settingsOpen && (
        <div
          className="settings-panel active"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="settings-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="settings-header">
              <h2>{t.settings_title}</h2>
              <button
                className="close-btn"
                onClick={() => setSettingsOpen(false)}
              >
                &times;
              </button>
            </header>

            <div className="settings-group">
              <h3>{t.settings_data_title}</h3>
              <div className="settings-actions">
                {/* Language Switch */}
                <button
                  className="settings-action-btn"
                  onClick={handleToggleLang}
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span>{t.change_lang}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: "var(--accent-color)",
                    }}
                  >
                    {lang.toUpperCase()}
                  </span>
                </button>

                {/* Free Games Notifications Toggle */}
                <button
                  className="settings-action-btn"
                  onClick={handleToggleFreeGamesNotifications}
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
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>{t.free_games_notifications_title}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: freeGamesNotificationsEnabled
                        ? "var(--accent-color)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {freeGamesNotificationsEnabled ? t.enabled : t.disabled}
                  </span>
                </button>

                {/* Universal Info Box Toggle */}
                <button
                  className="settings-action-btn"
                  onClick={handleToggleUniversalInfoBox}
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{t.uib_title}</span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontWeight: 700,
                      color: universalInfoBoxEnabled
                        ? "var(--accent-color)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {universalInfoBoxEnabled ? t.enabled : t.disabled}
                  </span>
                </button>

                {/* Universal Info Box Hotkey Selection */}
                {universalInfoBoxEnabled && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "6px",
                      margin: "2px 0 6px 0",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                      {t.uib_hotkey}:
                    </span>
                    <select
                      value={universalInfoBoxHotkey}
                      onChange={(e) =>
                        handleUniversalInfoBoxHotkeyChange(
                          (e.target as HTMLSelectElement).value,
                        )
                      }
                      style={{
                        marginLeft: "auto",
                        background: "#1e1e24",
                        color: "#f1f5f9",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.85rem",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="none"
                      >
                        {t.uib_hotkey_none}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="alt"
                      >
                        {t.uib_hotkey_alt}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="ctrl"
                      >
                        {t.uib_hotkey_ctrl}
                      </option>
                      <option
                        style={{ background: "#1e1e24", color: "#f1f5f9" }}
                        value="shift"
                      >
                        {t.uib_hotkey_shift}
                      </option>
                    </select>
                  </div>
                )}

                {/* Export Backup */}
                <button
                  className="settings-action-btn"
                  onClick={handleExportBackup}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>{t.backup}</span>
                </button>

                {/* Import Backup */}
                <label
                  className="settings-action-btn"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span style={{ flex: 1 }}>{t.restore}</span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleImportBackup}
                  />
                </label>

                {/* Delete / Reset All */}
                <button
                  className="settings-action-btn danger"
                  onClick={handleClearAllData}
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
                  <span>{t.clear_all}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Viewport Container */}
      <main id="container" className="container">
        {activeView === "free-games" && (
          <header className="hero">
            <div id="clock" className="clock">
              {clockText}
            </div>
            <div id="date" className="date">
              {dateText}
            </div>
          </header>
        )}

        {renderActiveViewComponent()}

        {/* Global Footer Quote Section */}
        {quoteText && (
          <footer className="footer-quote" style={{ marginTop: "30px" }}>
            <p
              id="quote"
              className="quote-text"
              style={{
                fontStyle: "italic",
                textAlign: "center",
                opacity: 0.85,
                fontSize: "0.95rem",
              }}
            >
              {quoteText}
            </p>
          </footer>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        lang={lang}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </>
  );
}
