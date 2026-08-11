/**
 * ViewRouter
 * Routes activeView string to the correct view component.
 * Reads data/actions directly from Zustand stores — App.tsx no longer passes props.
 */

import { lazy, Suspense } from "preact/compat";
import { ListView } from "@/components/ListView.js";

const EisenhowerView = lazy(() =>
  import("@/components/EisenhowerView.js").then((m) => ({
    default: m.EisenhowerView,
  })),
);
const NotesView = lazy(() =>
  import("@/components/NotesView.js").then((m) => ({ default: m.NotesView })),
);
const PomodoroView = lazy(() =>
  import("@/components/PomodoroView.js").then((m) => ({
    default: m.PomodoroView,
  })),
);
const WillpowerView = lazy(() =>
  import("@/components/WillpowerView.js").then((m) => ({
    default: m.WillpowerView,
  })),
);
const HifizView = lazy(() =>
  import("@/components/HifizView.js").then((m) => ({ default: m.HifizView })),
);
const SrsView = lazy(() =>
  import("@/components/SrsView.js").then((m) => ({ default: m.SrsView })),
);
const CalendarView = lazy(() =>
  import("@/components/CalendarView.js").then((m) => ({
    default: m.CalendarView,
  })),
);
const RssView = lazy(() =>
  import("@/components/RssView.js").then((m) => ({ default: m.RssView })),
);
const PrayerView = lazy(() =>
  import("@/components/PrayerView.js").then((m) => ({
    default: m.PrayerView,
  })),
);
const KpssView = lazy(() =>
  import("@/components/KpssView.js").then((m) => ({ default: m.KpssView })),
);
const FreeGamesView = lazy(() =>
  import("@/components/FreeGamesView.js").then((m) => ({
    default: m.FreeGamesView,
  })),
);
const ArcadeView = lazy(() =>
  import("@/components/ArcadeView.js").then((m) => ({
    default: m.ArcadeView,
  })),
);
const DetoxView = lazy(() =>
  import("@/components/DetoxView.js").then((m) => ({ default: m.DetoxView })),
);
const BistView = lazy(() =>
  import("@/components/BistView.js").then((m) => ({ default: m.BistView })),
);
const HalkaArzView = lazy(() =>
  import("@/components/HalkaArzView.js").then((m) => ({
    default: m.HalkaArzView,
  })),
);
const AIChatView = lazy(() =>
  import("@/components/AIChatView.js").then((m) => ({
    default: m.AIChatView,
  })),
);

import { useUIStore } from "@/presentation/store/uiStore.js";
import { useSettingsStore } from "@/presentation/store/settingsStore.js";
import { useTodosStore } from "@/presentation/store/todosStore.js";
import { useSyncStore } from "@/presentation/store/syncStore.js";

const ViewFallback = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "300px",
      color: "var(--text-dim, #94a3b8)",
    }}
  >
    <div style={{ fontSize: "14px", opacity: 0.8 }}>Loading...</div>
  </div>
);

export function ViewRouter() {
  const activeView = useUIStore((s) => s.activeView);
  const activeTab = useUIStore((s) => s.activeTab);
  const onTabChange = useUIStore((s) => s.handleTabChange);
  const showConfirm = useUIStore((s) => s.showConfirm);
  const handleOpenSettings = useUIStore((s) => s.handleOpenSettings);

  const lang = useSettingsStore((s) => s.lang);
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const aiApiKey = useSettingsStore((s) => s.aiApiKey);
  const aiModel = useSettingsStore((s) => s.aiModel);
  const aiEndpoint = useSettingsStore((s) => s.aiEndpoint);
  const aiShowThinking = useSettingsStore((s) => s.aiShowThinking);
  const kpssGoalType = useSettingsStore((s) => s.kpssGoalType);
  const kpssTargetNet = useSettingsStore((s) => s.kpssTargetNet);
  const kpssTargetScore = useSettingsStore((s) => s.kpssTargetScore);

  const todos = useTodosStore((s) => s.todos);
  const onToggleTodo = useTodosStore((s) => s.handleToggleTodo);
  const onDeleteTodo = useTodosStore((s) => s.handleDeleteTodo);
  const onMoveTaskStatus = useTodosStore((s) => s.handleMoveTaskStatus);
  const onMoveTaskDirection = useTodosStore((s) => s.handleMoveTaskDirection);
  const onUpdateTodoUrgentImportant = useTodosStore(
    (s) => s.handleUpdateTodoUrgentImportant,
  );
  const onAddTodo = useTodosStore((s) => s.handleAddTodo);

  const onManualSync = useSyncStore((s) => s.handleManualSyncTasks);
  const syncSettings = useUIStore((s) => s.syncSettings);
  const isSyncing = useUIStore((s) => s.isSyncing);

  const handleViewChange = useUIStore((s) => s.handleViewChange);

  const handleContinueToChat = (symbol: string) => {
    sessionStorage.setItem("hermes_pending_stock", symbol);
    handleViewChange("ai-chat");
  };

  const renderContent = () => {
    switch (activeView) {
      case "list":
        return (
          <ListView
            todos={todos}
            activeTab={activeTab}
            lang={lang}
            onTabChange={onTabChange}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
            googleSyncActive={syncSettings.enabled && syncSettings.tasksEnabled}
            isSyncing={isSyncing}
            onManualSync={onManualSync}
          />
        );
      case "kanban":
      case "eisenhower":
        return (
          <EisenhowerView
            todos={todos}
            lang={lang}
            defaultTab="kanban"
            onUpdateTodoUrgentImportant={(originalIndex, urgent, important) => {
              void onUpdateTodoUrgentImportant(
                originalIndex,
                urgent ?? false,
                important ?? false,
              );
            }}
            onMoveTaskStatus={onMoveTaskStatus}
            onMoveTaskDirection={(index, direction) => {
              void onMoveTaskDirection(index, direction as 1 | -1);
            }}
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
      case "rss":
        return <RssView lang={lang} />;
      case "prayer":
        return <PrayerView lang={lang} />;
      case "kpss":
        return (
          <KpssView
            lang={lang}
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
      case "arcade":
        return <ArcadeView lang={lang} />;
      case "free-games":
        return <FreeGamesView lang={lang} />;
      case "detox":
        return <DetoxView lang={lang} />;
      case "bist":
        return <BistView lang={lang} onContinueToChat={handleContinueToChat} />;
      case "halka-arz":
        return <HalkaArzView lang={lang} />;
      case "ai-chat":
        return (
          <AIChatView
            lang={lang}
            todos={todos}
            onAddTodo={onAddTodo}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
            onManualSync={onManualSync}
            aiProvider={aiProvider}
            aiApiKey={aiApiKey}
            aiModel={aiModel}
            aiEndpoint={aiEndpoint}
            aiShowThinking={aiShowThinking}
            onSettingsOpen={() => handleOpenSettings("ai")}
          />
        );
      default:
        return <FreeGamesView lang={lang} />;
    }
  };

  return <Suspense fallback={<ViewFallback />}>{renderContent()}</Suspense>;
}