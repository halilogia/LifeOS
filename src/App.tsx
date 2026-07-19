import { useState, useEffect } from "preact/hooks";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/domain/value-objects/Language.js";
import { useTodos } from "@/presentation/hooks/useTodos.js";
import { useSync } from "@/presentation/hooks/useSync.js";
import { useSettings } from "@/presentation/hooks/useSettings.js";
import { useUI } from "@/presentation/hooks/useUI.js";
import { useAppInit } from "@/presentation/hooks/useAppInit.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";

import { Sidebar } from "@/components/Sidebar.js";
import { ListView } from "@/components/ListView.js";
import { NotesView } from "@/components/NotesView.js";
import { PomodoroView } from "@/components/PomodoroView.js";
import { WillpowerView } from "@/components/WillpowerView.js";
import { HifizView } from "@/components/HifizView.js";
import { SrsView } from "@/components/SrsView.js";
import { CalendarView } from "@/components/CalendarView.js";
import { PrayerView } from "@/components/PrayerView.js";
import { KpssView } from "@/components/KpssView.js";
import { FreeGamesView } from "@/components/FreeGamesView.js";
import { DetoxView } from "@/components/DetoxView.js";
import { HalkaArzView } from "@/components/HalkaArzView.js";
import { AIChatView } from "@/components/AIChatView.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";
import { EisenhowerView } from "@/components/EisenhowerView.js";
import { SettingsDrawer } from "@/components/SettingsDrawer.js";
import { HeroHeader } from "@/components/HeroHeader.js";
import { FooterQuote } from "@/components/FooterQuote.js";
import { DatePicker } from "@/components/DatePicker.js";
import type { Todo } from "@/types/types.js";

// Singleton repository — created once outside component to avoid re-instantiation
const todoRepository = new ChromeStorageTodoRepository();

export function App() {
  // ─── Settings Hook ────────────────────────────────────────────────────────
  const {
    lang,
    setLangState,
    sidebarOpen,
    setSidebarOpenState,
    freeGamesNotificationsEnabled,
    calendarNotificationsEnabled,
    pomoBlockEnabled,
    universalInfoBoxEnabled,
    universalInfoBoxHotkey,
    aiProvider,
    aiApiKey,
    aiModel,
    aiEndpoint,
    aiShowThinking,
    kpssGoalType,
    kpssTargetNet,
    kpssTargetScore,
    detoxLimits,
    loadSettings,
    handleToggleLang,
    handleSidebarToggle,
    handleToggleFreeGamesNotifications,
    handleToggleCalendarNotifications,
    handleTogglePomoBlock,
    handleToggleUniversalInfoBox,
    handleUniversalInfoBoxHotkeyChange,
    handleClearAllData,
    handleUpdateAIConfig,
    handleUpdateAIShowThinking,
    handleKpssGoalTypeChange,
    handleKpssTargetNetChange,
    handleKpssTargetScoreChange,
    handleDetoxLimitsChange,
  } = useSettings();

  // ─── UI Hook ──────────────────────────────────────────────────────────────
  const {
    activeView,
    setActiveView,
    sidebarOrder,
    setSidebarOrder,
    activeTab,
    setActiveTab,
    settingsOpen,
    setSettingsOpen,
    settingsInitialTab,
    clockText,
    dateText,
    quoteText,
    confirmDialog,
    setConfirmDialog,
    alertDialog,
    setAlertDialog,
    showConfirm,
    showAlert,
    refreshClock,
    refreshQuote,
    handleViewChange,
    handleTabChange: handleTabChangeUI,
    handleOpenSettings,
  } = useUI();

  const t = getTranslation(lang as Language);

  // ─── Sync Hook ────────────────────────────────────────────────────────────
  const {
    syncSettings,
    setSyncSettingsState,
    googleUserEmail,
    setGoogleUserEmail,
    isSyncing,
    handleGoogleLogin,
    handleGoogleLogout,
    handleManualSyncTasks,
    handleBackupToGoogleDrive,
    handleRestoreFromGoogleDrive,
    triggerCloudBackup,
  } = useSync({
    showAlert,
    errorLabel: t.google_sync_error,
    detailLabel: lang === "tr" ? "Detay" : "Detail",
    successBackupLabel: t.google_sync_success_backup,
    successRestoreLabel: t.google_sync_success_restore,
    noBackupLabel: t.google_sync_no_backup,
  });

  // ─── Todos Hook ───────────────────────────────────────────────────────────
  const {
    todos,
    setTodos,
    initTodos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMoveTaskStatus,
    handleMoveTaskDirection,
    handleUpdateTodoUrgentImportant,
    handleExportBackup,
    handleImportBackup,
  } = useTodos(todoRepository, syncSettings, triggerCloudBackup, showAlert, t as Record<string, string>);

  // ─── App Init ─────────────────────────────────────────────────────────────
  useAppInit({
    onSettingsLoaded: (config) => {
      setLangState(config.lang as Language);
      setSidebarOpenState(config.sidebarOpen);
      document.body.classList.toggle("sidebar-open", config.sidebarOpen);
      loadSettings(); // Load AI/KPSS/Detox settings too
    },
    onTodosLoaded: (loadedTodos) => {
      setTodos(loadedTodos as any);
    },
    onSyncSettingsLoaded: (settings) => {
      setSyncSettingsState(settings as any);
    },
    onGoogleUserEmail: (email) => {
      setGoogleUserEmail(email);
    },
    onSidebarOrderLoaded: (order) => {
      setSidebarOrder(order);
      if (order && order.length > 0) {
        setActiveView(order[0]);
      } else {
        setActiveView("free-games");
      }
    },
    onQuoteRefreshed: (langVal) => {
      refreshQuote(langVal as Language);
    },
    onClockStarted: () => {
      refreshClock(lang as Language);
    },
  });

  // Sync initTodos into the DI-backed useAppInit flow
  useEffect(() => {
    initTodos();
  }, []);

  // Re-render clock/quote on lang change
  useEffect(() => {
    refreshClock(lang as Language);
    refreshQuote(lang as Language);
  }, [lang]);

  // ─── Local todo input state (UI-only, belongs in App layout) ───────────────
  const [todoText, setTodoText] = useState("");
  const [todoRepeat, setTodoRepeat] = useState<Todo["repeat"]>("none");
  const [todoDueDate, setTodoDueDate] = useState("");

  const handleTabChange = (tabVal: "focus" | "routines") => {
    setActiveTab(tabVal);
    setTodoRepeat(tabVal === "focus" ? "none" : "daily");
    handleTabChangeUI(tabVal);
  };

  const handleClearAllDataConfirm = () => {
    const confirmMsg =
      lang === "tr"
        ? "Tüm verileriniz kalıcı olarak silinecektir. Emin misiniz?"
        : "All your data will be permanently deleted. Are you sure?";
    showConfirm(confirmMsg, async () => {
      await handleClearAllData();
      window.location.reload();
    });
  };

  // ─── View Router ───────────────────────────────────────────────────────────
  const renderActiveViewComponent = () => {
    switch (activeView) {
      case "list":
        return (
          <ListView
            todos={todos}
            activeTab={activeTab}
            lang={lang as Language}
            onTabChange={handleTabChange}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            googleSyncActive={syncSettings.enabled && syncSettings.tasksEnabled}
            isSyncing={isSyncing}
            onManualSync={handleManualSyncTasks}
          />
        );
      case "kanban":
      case "eisenhower":
        return (
          <EisenhowerView
            todos={todos as any}
            lang={lang as Language}
            defaultTab="kanban"
            onUpdateTodoUrgentImportant={handleUpdateTodoUrgentImportant}
            onMoveTaskStatus={handleMoveTaskStatus as any}
            onMoveTaskDirection={handleMoveTaskDirection as any}
          />
        );
      case "notes":
        return <NotesView lang={lang as Language} onShowConfirm={showConfirm} />;
      case "pomodoro":
        return <PomodoroView lang={lang as Language} />;
      case "willpower":
        return <WillpowerView lang={lang as Language} onShowConfirm={showConfirm} />;
      case "hifiz":
        return <HifizView lang={lang as Language} />;
      case "srs":
        return <SrsView lang={lang as Language} />;
      case "calendar":
        return <CalendarView todos={todos} lang={lang as Language} />;
      case "prayer":
        return <PrayerView lang={lang as Language} />;
      case "kpss":
        return (
          <KpssView
            lang={lang as Language}
            onShowConfirm={showConfirm}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            goalType={kpssGoalType}
            targetNet={kpssTargetNet}
            targetScore={kpssTargetScore}
          />
        );
      case "free-games":
        return <FreeGamesView lang={lang as Language} />;
      case "detox":
        return <DetoxView lang={lang as Language} />;
      case "halka-arz":
        return <HalkaArzView lang={lang as Language} />;
      case "ai-chat":
        return (
          <AIChatView
            lang={lang as Language}
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onManualSync={handleManualSyncTasks}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            aiShowThinking={aiShowThinking}
            onSettingsOpen={() => handleOpenSettings("ai")}
          />
        );
      default:
        return <FreeGamesView lang={lang as Language} />;
    }
  };

  // ─── JSX Template ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Background visual overlay blur */}
      <div className="background-overlay"></div>

      {/* Sidebar Navigation */}
      <Sidebar
        lang={lang as Language}
        activeView={activeView}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onViewChange={handleViewChange}
        onTabChange={(tabVal) => {
          setActiveView("list");
          handleTabChange(tabVal);
        }}
        onSidebarToggle={handleSidebarToggle}
        onSettingsOpen={() => handleOpenSettings("general")}
        onOrderChange={(newOrder) => setSidebarOrder(newOrder)}
      />

      {/* Top Input Header */}
      {activeView === "list" && (
        <header className="top-header" style={{ display: "flex" }}>
          <div className="global-input-container">
            <div className="input-group">
              <input
                type="text"
                id="todo-input"
                value={todoText}
                onInput={(e) => setTodoText((e.target as HTMLInputElement).value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && todoText.trim()) {
                    handleAddTodo(todoText.trim(), todoRepeat, todoDueDate);
                    setTodoText("");
                    setTodoDueDate("");
                  }
                }}
                placeholder={t.todo_placeholder}
                autocomplete="off"
              />
              <DatePicker value={todoDueDate} onChange={setTodoDueDate} lang={lang as Language} />
              <select
                id="repeat-select"
                className="repeat-select"
                value={todoRepeat}
                onChange={(e) => {
                  const val = (e.target as HTMLSelectElement).value as Todo["repeat"];
                  setTodoRepeat(val);
                  setActiveTab(val === "none" ? "focus" : "routines");
                }}
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
                    handleAddTodo(todoText.trim(), todoRepeat, todoDueDate);
                    setTodoText("");
                    setTodoDueDate("");
                  }
                }}
                aria-label="Add Task"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsInitialTab}
        lang={lang as Language}
        onToggleLang={handleToggleLang}
        freeGamesNotificationsEnabled={freeGamesNotificationsEnabled}
        onToggleFreeGamesNotifications={handleToggleFreeGamesNotifications}
        calendarNotificationsEnabled={calendarNotificationsEnabled}
        onToggleCalendarNotifications={handleToggleCalendarNotifications}
        pomoBlockEnabled={pomoBlockEnabled}
        onTogglePomoBlock={handleTogglePomoBlock}
        universalInfoBoxEnabled={universalInfoBoxEnabled}
        onToggleUniversalInfoBox={handleToggleUniversalInfoBox}
        universalInfoBoxHotkey={universalInfoBoxHotkey}
        onUniversalInfoBoxHotkeyChange={handleUniversalInfoBoxHotkeyChange}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllDataConfirm}
        aiApiKey={aiApiKey}
        aiModel={aiModel}
        aiEndpoint={aiEndpoint}
        onUpdateAIConfig={handleUpdateAIConfig}
        aiShowThinking={aiShowThinking}
        onUpdateAIShowThinking={handleUpdateAIShowThinking}
        googleUserEmail={googleUserEmail}
        isSyncing={isSyncing}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        syncSettings={syncSettings as any}
        onBackupToGoogleDrive={handleBackupToGoogleDrive}
        onRestoreFromGoogleDrive={handleRestoreFromGoogleDrive}
        kpssGoalType={kpssGoalType}
        kpssTargetNet={kpssTargetNet}
        kpssTargetScore={kpssTargetScore}
        onKpssGoalTypeChange={handleKpssGoalTypeChange}
        onKpssTargetNetChange={handleKpssTargetNetChange}
        onKpssTargetScoreChange={handleKpssTargetScoreChange}
        detoxLimits={detoxLimits}
        onDetoxLimitsChange={handleDetoxLimitsChange}
      />

      {/* Main Viewport */}
      <main id="container" className="container">
        {sidebarOrder.length > 0 && activeView === sidebarOrder[0] && (
          <HeroHeader clockText={clockText} dateText={dateText} />
        )}
        {renderActiveViewComponent()}
        {quoteText && activeView !== "ai-chat" && (
          <FooterQuote quoteText={quoteText} />
        )}
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        lang={lang as Language}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertDialog.isOpen}
        message={alertDialog.message}
        lang={lang as Language}
        onConfirm={() => {
          if (alertDialog.onConfirm) {alertDialog.onConfirm();}
          setAlertDialog({ isOpen: false, message: "" });
        }}
        isAlert={true}
      />
    </>
  );
}
