/**
 * ViewRouter
 * Pure routing component — maps activeView string to the correct view component.
 * Extracted from App.tsx to reduce its monolith size.
 */

import type { Language } from "@/domain/value-objects/Language.js";
import type { RepeatType } from "@/domain/value-objects/RepeatType.js";
import type { Todo } from "@/domain/entities/Todo.js";

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

export interface ViewRouterProps {
  activeView: string;
  lang: Language;
  todos: Todo[];
  activeTab: "focus" | "routines";
  syncSettings: { enabled: boolean; tasksEnabled: boolean };
  isSyncing: boolean;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  aiShowThinking: boolean;
  kpssGoalType: "net" | "score";
  kpssTargetNet: number;
  kpssTargetScore: number;
  onTabChange: (tabVal: "focus" | "routines") => void;
  onToggleTodo: (index: number) => Promise<void>;
  onDeleteTodo: (index: number) => Promise<void>;
  onMoveTaskStatus: (index: number, status: Todo["status"]) => void;
  onMoveTaskDirection: (index: number, direction: 1 | -1) => Promise<void>;
  onUpdateTodoUrgentImportant: (
    index: number,
    urgent: boolean,
    important: boolean,
  ) => Promise<void>;
  onAddTodo: (
    text: string,
    repeat: RepeatType,
    dueDate?: string,
  ) => Promise<void>;
  onManualSync: () => Promise<void>;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
  onSettingsOpen: (tab: "general" | "kpss" | "detox" | "ai" | "sync") => void;
  onContinueToChat?: (symbol: string) => void;
}

export function ViewRouter(props: ViewRouterProps) {
  switch (props.activeView) {
    case "list":
      return (
        <ListView
          todos={props.todos}
          activeTab={props.activeTab}
          lang={props.lang}
          onTabChange={props.onTabChange}
          onToggleTodo={props.onToggleTodo}
          onDeleteTodo={props.onDeleteTodo}
          googleSyncActive={
            props.syncSettings.enabled && props.syncSettings.tasksEnabled
          }
          isSyncing={props.isSyncing}
          onManualSync={props.onManualSync}
        />
      );
    case "kanban":
    case "eisenhower":
      return (
        <EisenhowerView
          todos={props.todos}
          lang={props.lang}
          defaultTab="kanban"
          onUpdateTodoUrgentImportant={(originalIndex, urgent, important) => {
            void props.onUpdateTodoUrgentImportant(
              originalIndex,
              urgent ?? false,
              important ?? false,
            );
          }}
          onMoveTaskStatus={props.onMoveTaskStatus}
          onMoveTaskDirection={(index, direction) => {
            void props.onMoveTaskDirection(index, direction as 1 | -1);
          }}
        />
      );
    case "notes":
      return (
        <NotesView lang={props.lang} onShowConfirm={props.onShowConfirm} />
      );
    case "pomodoro":
      return <PomodoroView lang={props.lang} />;
    case "willpower":
      return (
        <WillpowerView lang={props.lang} onShowConfirm={props.onShowConfirm} />
      );
    case "hifiz":
      return <HifizView lang={props.lang} />;
    case "srs":
      return <SrsView lang={props.lang} />;
    case "calendar":
      return <CalendarView todos={props.todos} lang={props.lang} />;
    case "prayer":
      return <PrayerView lang={props.lang} />;
    case "kpss":
      return (
        <KpssView
          lang={props.lang}
          onShowConfirm={props.onShowConfirm}
          aiProvider={props.aiProvider}
          aiApiKey={props.aiApiKey}
          aiModel={props.aiModel}
          aiEndpoint={props.aiEndpoint}
          goalType={props.kpssGoalType}
          targetNet={props.kpssTargetNet}
          targetScore={props.kpssTargetScore}
        />
      );
    case "arcade":
      return <ArcadeView lang={props.lang} />;
    case "free-games":
      return <FreeGamesView lang={props.lang} />;
    case "detox":
      return <DetoxView lang={props.lang} />;
    case "bist":
      return (
        <BistView lang={props.lang} onContinueToChat={props.onContinueToChat} />
      );
    case "halka-arz":
      return <HalkaArzView lang={props.lang} />;
    case "ai-chat":
      return (
        <AIChatView
          lang={props.lang}
          todos={props.todos}
          onAddTodo={props.onAddTodo}
          onToggleTodo={props.onToggleTodo}
          onDeleteTodo={props.onDeleteTodo}
          onManualSync={props.onManualSync}
          aiProvider={props.aiProvider}
          aiApiKey={props.aiApiKey}
          aiModel={props.aiModel}
          aiEndpoint={props.aiEndpoint}
          aiShowThinking={props.aiShowThinking}
          onSettingsOpen={() => props.onSettingsOpen("ai")}
        />
      );
    default:
      return <FreeGamesView lang={props.lang} />;
  }
}
