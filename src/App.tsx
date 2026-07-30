import { useState, useEffect, useCallback } from "preact/hooks";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/domain/value-objects/Language.js";
import { useTodos } from "@/presentation/hooks/useTodos.js";
import { useSync } from "@/presentation/hooks/useSync.js";
import { useSettings } from "@/presentation/hooks/useSettings.js";
import { useUI } from "@/presentation/hooks/useUI.js";
import { useAppInit } from "@/presentation/hooks/useAppInit.js";
import { useAppTodoInput } from "@/presentation/hooks/useAppTodoInput.js";
import { useAppConfirmActions } from "@/presentation/hooks/useAppConfirmActions.js";
import { ChromeStorageTodoRepository } from "@/infrastructure/persistence/ChromeStorageTodoRepository.js";
import type { GoogleSyncSettings } from "@/domain/repositories/ISyncRepository.js";
import { kpssService } from "@/services/kpssService.js";

import { Sidebar } from "@/components/Sidebar.js";
import { ViewRouter } from "@/components/ViewRouter.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";
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
    autoGroupTabsEnabled,
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
    handleToggleAutoGroupTabs,
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
    googleUserEmail,
    setGoogleUserEmail,
    isSyncing,
    setIsSyncing,
    syncSettings,
    setSyncSettings,
    showAlert,
    showConfirm,
    handleTabChangeUI,
    handleOpenSettings,
    loadSidebarOrder,
    handleViewChange,
    refreshClock,
    refreshQuote,
  } = useUI();

  // ─── Sync Hook ────────────────────────────────────────────────────────────
  const {
    handleManualSyncTasks,
    handleGoogleLogin,
    handleGoogleLogout,
    handleExportBackup,
    handleImportBackup,
    handleBackupToGoogleDrive,
    handleRestoreFromGoogleDrive,
    triggerCloudBackup,
  } = useSync({
    showAlert,
    errorLabel: "Sync error",
    detailLabel: "Detail",
  });

  // ─── Todos Hook ───────────────────────────────────────────────────────────
  const {
    todos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMoveTaskStatus,
    handleMoveTaskDirection,
    handleUpdateTodoUrgentImportant,
    initTodos,
  } = useTodos(todoRepository, triggerCloudBackup, showAlert, getTranslation(lang as Language));

  // ─── App Init Hook ────────────────────────────────────────────────────────
  useAppInit({
    onSettingsLoaded: loadSettings,
    onTodosLoaded: initTodos,
    onSyncSettingsLoaded: (settings) => setSyncSettings(settings),
    onGoogleUserEmail: (email) => setGoogleUserEmail(email),
    onSidebarOrderLoaded: (order) => setSidebarOrder(order),
    onQuoteRefreshed: (l: Language) => refreshQuote(l),
    onClockStarted: () => refreshClock(lang as Language),
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

  // ─── Todo Input Hook ─────────────────────────────────────────────────────────
  const {
    todoText,
    setTodoText,
    todoRepeat,
    todoDueDate,
    setTodoDueDate,
    handleAddTodoClick,
    handleKeyPress,
    handleRepeatChange,
    handleTabChange,
  } = useAppTodoInput({
    lang: lang as Language,
    onAddTodo: handleAddTodo,
    activeTab,
    setActiveTab,
    setActiveView,
    handleTabChangeUI,
  });

  // ─── Confirm Actions Hook ────────────────────────────────────────────────────
  const { handleClearAllDataConfirm, handleResetKpssDataConfirm } =
    useAppConfirmActions({ showConfirm });

  // ─── Continue to Chat callback ──────────────────────────────────────────────
  const handleContinueToChat = useCallback((symbol: string) => {
    // Stock bilgisini sessionStorage'a yaz ki AI Chat okusun
    sessionStorage.setItem("hermes_pending_stock", symbol);
    handleViewChange("ai-chat");
  }, [handleViewChange]);

  // ─── JSX Template ─────────────────────────────────────────────────────────
  const t = getTranslation(lang as Language);
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
        onTabChange={handleTabChange}
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
                onInput={(e) =>
                  setTodoText((e.target as HTMLInputElement).value)
                }
                onKeyPress={handleKeyPress}
                placeholder={t.todo_placeholder}
                autocomplete="off"
              />
              <DatePicker
                value={todoDueDate}
                onChange={setTodoDueDate}
                lang={lang as Language}
              />
              <select
                id="repeat-select"
                className="repeat-select"
                value={todoRepeat}
                onChange={handleRepeatChange}
              >
                <option value="none">{t.repeat_none}</option>
                <option value="daily">{t.repeat_daily}</option>
                <option value="weekly">{t.repeat_weekly}</option>
                <option value="monthly">{t.repeat_monthly}</option>
              </select>
              <button
                id="add-btn"
                onClick={handleAddTodoClick}
                aria-label="Add Task"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
        autoGroupTabsEnabled={autoGroupTabsEnabled}
        onToggleAutoGroupTabs={handleToggleAutoGroupTabs}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={() => handleClearAllDataConfirm(handleClearAllData)}
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
        syncSettings={syncSettings}
        onBackupToGoogleDrive={handleBackupToGoogleDrive}
        onRestoreFromGoogleDrive={handleRestoreFromGoogleDrive}
        kpssGoalType={kpssGoalType}
        kpssTargetNet={kpssTargetNet}
        kpssTargetScore={kpssTargetScore}
        onKpssGoalTypeChange={handleKpssGoalTypeChange}
        onKpssTargetNetChange={handleKpssTargetNetChange}
        onKpssTargetScoreChange={handleKpssTargetScoreChange}
        onResetKpssData={() =>
          handleResetKpssDataConfirm(async () => {
            await kpssService.resetAllKpssData();
            showAlert(t.alert_kpss_reset_success);
          })
        }
        detoxLimits={detoxLimits}
        onDetoxLimitsChange={handleDetoxLimitsChange}
      />

      {/* Main Viewport */}
      <main id="container" className="container">
        {sidebarOrder.length > 0 && activeView === sidebarOrder[0] && (
          <HeroHeader clockText={clockText} dateText={dateText} />
        )}
        <ViewRouter
          activeView={activeView}
          lang={lang as Language}
          todos={todos}
          activeTab={activeTab}
          syncSettings={syncSettings}
          isSyncing={isSyncing}
          aiProvider={aiProvider}
          aiApiKey={aiApiKey}
          aiModel={aiModel}
          aiEndpoint={aiEndpoint}
          aiShowThinking={aiShowThinking}
          kpssGoalType={kpssGoalType}
          kpssTargetNet={kpssTargetNet}
          kpssTargetScore={kpssTargetScore}
          onTabChange={handleTabChange}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onMoveTaskStatus={handleMoveTaskStatus}
          onMoveTaskDirection={handleMoveTaskDirection}
          onUpdateTodoUrgentImportant={handleUpdateTodoUrgentImportant}
          onAddTodo={handleAddTodo}
          onManualSync={handleManualSyncTasks}
          onShowConfirm={showConfirm}
          onSettingsOpen={handleOpenSettings}
          onContinueToChat={handleContinueToChat}
        />
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
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={alertDialog.isOpen}
        message={alertDialog.message}
        lang={lang as Language}
        onConfirm={() => {
          if (alertDialog.onConfirm) {
            alertDialog.onConfirm();
          }
          setAlertDialog({ isOpen: false, message: "" });
        }}
        isAlert={true}
      />
    </>
  );
}
