/**
 * ViewRouter
 * Routes activeView string to the correct view component.
 * Reads data/actions directly from Zustand stores — App.tsx no longer passes props.
 */

import { ListView } from "@/components/ListView.js";
import { EisenhowerView } from "@/components/EisenhowerView.js";
import { NotesView } from "@/components/NotesView.js";
import { PomodoroView } from "@/components/PomodoroView.js";
import { WillpowerView } from "@/components/WillpowerView.js";
import { HifizView } from "@/components/HifizView.js";
import { SrsView } from "@/components/SrsView.js";
import { CalendarView } from "@/components/CalendarView.js";
import { PrayerView } from "@/components/PrayerView.js";
import { KpssView } from "@/components/KpssView.js";
import { FreeGamesView } from "@/components/FreeGamesView.js";
import { ArcadeView } from "@/components/ArcadeView.js";
import { DetoxView } from "@/components/DetoxView.js";
import { BistView } from "@/components/BistView.js";
import { HalkaArzView } from "@/components/HalkaArzView.js";
import { AIChatView } from "@/components/AIChatView.js";

import { useUIStore } from "@/presentation/store/uiStore.js";
import { useSettingsStore } from "@/presentation/store/settingsStore.js";
import { useTodosStore } from "@/presentation/store/todosStore.js";
import { useSyncStore } from "@/presentation/store/syncStore.js";

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
}