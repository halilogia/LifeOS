import { useEffect } from "preact/hooks";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/domain/value-objects/Language.js";

import { useSettingsStore } from "@/presentation/store/settingsStore.js";
import { useUIStore } from "@/presentation/store/uiStore.js";
import { useTodosStore } from "@/presentation/store/todosStore.js";
import { useSyncStore } from "@/presentation/store/syncStore.js";

import { Sidebar } from "@/components/Sidebar.js";
import { ViewRouter } from "@/components/ViewRouter.js";
import { ConfirmModal } from "@/components/ConfirmModal.js";
import { SettingsDrawer } from "@/components/SettingsDrawer.js";
import { HeroHeader } from "@/components/HeroHeader.js";
import { FooterQuote } from "@/components/FooterQuote.js";
import { AppTopHeader } from "@/components/AppTopHeader.js";
import { KpssNotesDashboard } from "@/components/kpss/wiki/KpssNotesDashboard.js";

export function App() {
  // --- Settings (shared store) ---
  const lang = useSettingsStore((s) => s.lang);
  const sidebarOpen = useSettingsStore((s) => s.sidebarOpen);
  const handleSidebarToggle = useSettingsStore((s) => s.handleSidebarToggle);

  // --- UI (shared store) ---
  const activeView = useUIStore((s) => s.activeView);
  const sidebarOrder = useUIStore((s) => s.sidebarOrder);
  const setSidebarOrder = useUIStore((s) => s.setSidebarOrder);
  const activeTab = useUIStore((s) => s.activeTab);
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const settingsInitialTab = useUIStore((s) => s.settingsInitialTab);
  const clockText = useUIStore((s) => s.clockText);
  const dateText = useUIStore((s) => s.dateText);
  const quoteText = useUIStore((s) => s.quoteText);
  const confirmDialog = useUIStore((s) => s.confirmDialog);
  const setConfirmDialog = useUIStore((s) => s.setConfirmDialog);
  const alertDialog = useUIStore((s) => s.alertDialog);
  const setAlertDialog = useUIStore((s) => s.setAlertDialog);
  const showAlert = useUIStore((s) => s.showAlert);
  const handleViewChange = useUIStore((s) => s.handleViewChange);
  const handleTabChange = useUIStore((s) => s.handleTabChange);
  const handleOpenSettings = useUIStore((s) => s.handleOpenSettings);
  const refreshClock = useUIStore((s) => s.refreshClock);
  const refreshQuote = useUIStore((s) => s.refreshQuote);
  const setGoogleUserEmail = useUIStore((s) => s.setGoogleUserEmail);
  const setSyncSettings = useUIStore((s) => s.setSyncSettings);

  // --- Sync (shared store) ---
  useSyncStore(); // ensure labels default
  useSyncStore((s) => s.triggerCloudBackup); // keep referenced

  // --- Init effect: load settings/ui/sidebar order + refresh clock/quote once ---
  useEffect(() => {
    const s = useSettingsStore.getState();
    const ui = useUIStore.getState();
    const sync = useSyncStore.getState();
    const todos = useTodosStore.getState();

    void (async () => {
      await s.loadSettings();
      await sync.loadSyncSettings();
      await ui.loadSidebarOrder();
      setGoogleUserEmail(useUIStore.getState().googleUserEmail);
      await todos.initTodos();
      const langNow = useSettingsStore.getState().lang;
      ui.refreshClock(langNow);
      ui.refreshQuote(langNow);
    })();
  }, []);

  // Keep clock/quote in sync when lang changes (e.g. toggled in drawer)
  useEffect(() => {
    refreshClock(lang);
    refreshQuote(lang);
  }, [lang]);

  useEffect(() => {
    setSyncSettings(useUIStore.getState().syncSettings);
  }, []);

  const t = getTranslation(lang);

  if (
    typeof window !== "undefined" &&
    window.location.search.includes("view=kpss-notes")
  ) {
    return <KpssNotesDashboard lang={lang as Language} t={t} />;
  }

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

      {/* Top Input Header — view= list only */}
      {activeView === "list" && <AppTopHeader lang={lang} t={t} />}

      {/* Settings Drawer — pulls everything from stores internally */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsInitialTab}
        onNotify={(message: string) => showAlert(message)}
      />

      {/* Main Viewport */}
      <main id="container" className="container">
        {sidebarOrder.length > 0 && activeView === sidebarOrder[0] && (
          <HeroHeader clockText={clockText} dateText={dateText} />
        )}
        <ViewRouter />
      </main>

      {/* Footer Quote — outside container, zero layout impact */}
      {quoteText && activeView !== "ai-chat" && (
        <FooterQuote quoteText={quoteText} />
      )}

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