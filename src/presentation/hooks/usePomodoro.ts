import { useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { usePomodoroState } from "@/presentation/store/pomodoroStore.js";

interface UsePomodoroOptions {
  lang: Language;
  t: Record<string, string>;
}

/**
 * Facade over usePomodoroState — all state + subscriptions + timers live in the store.
 * configure() is called every render to keep fresh closures (lang, t).
 */
export function usePomodoro({ lang, t }: UsePomodoroOptions) {
  const activeTab = usePomodoroState((s) => s.activeTab);
  const setActiveTab = usePomodoroState((s) => s.setActiveTab);
  const pomodoroHistory = usePomodoroState((s) => s.pomodoroHistory);
  const showPlantModal = usePomodoroState((s) => s.showPlantModal);
  const setShowPlantModal = usePomodoroState((s) => s.setShowPlantModal);
  const focusNote = usePomodoroState((s) => s.focusNote);
  const setFocusNote = usePomodoroState((s) => s.setFocusNote);
  const selectedElement = usePomodoroState((s) => s.selectedElement);
  const setSelectedElement = usePomodoroState((s) => s.setSelectedElement);
  const searchQuery = usePomodoroState((s) => s.searchQuery);
  const setSearchQuery = usePomodoroState((s) => s.setSearchQuery);
  const customTimes = usePomodoroState((s) => s.customTimes);
  const pomoMode = usePomodoroState((s) => s.pomoMode);
  const pomoTimeLeft = usePomodoroState((s) => s.pomoTimeLeft);
  const pomoRunning = usePomodoroState((s) => s.pomoRunning);
  const pomoTotalTime = usePomodoroState((s) => s.pomoTotalTime);
  const swTime = usePomodoroState((s) => s.swTime);
  const swRunning = usePomodoroState((s) => s.swRunning);
  const alarms = usePomodoroState((s) => s.alarms);
  const alarmInput = usePomodoroState((s) => s.alarmInput);
  const setAlarmInput = usePomodoroState((s) => s.setAlarmInput);
  const handlePomoModeChange = usePomodoroState((s) => s.handlePomoModeChange);
  const handleCustomTimeChange = usePomodoroState(
    (s) => s.handleCustomTimeChange,
  );
  const handlePomoStart = usePomodoroState((s) => s.handlePomoStart);
  const handlePomoPause = usePomodoroState((s) => s.handlePomoPause);
  const handlePomoReset = usePomodoroState((s) => s.handlePomoReset);
  const handleSwStart = usePomodoroState((s) => s.handleSwStart);
  const handleSwPause = usePomodoroState((s) => s.handleSwPause);
  const handleSwReset = usePomodoroState((s) => s.handleSwReset);
  const handleAddAlarm = usePomodoroState((s) => s.handleAddAlarm);
  const handleToggleAlarm = usePomodoroState((s) => s.handleToggleAlarm);
  const handleDeleteAlarm = usePomodoroState((s) => s.handleDeleteAlarm);
  const handlePlantElement = usePomodoroState((s) => s.handlePlantElement);

  // CRITICAL: configure on every render (fresh closures for lang/t)
  usePomodoroState.getState().configure({ lang, t });

  useEffect(() => {
    const cleanup = usePomodoroState.getState().init();
    return cleanup;
  }, []);

  return {
    activeTab,
    setActiveTab,
    pomodoroHistory,
    showPlantModal,
    setShowPlantModal,
    focusNote,
    setFocusNote,
    selectedElement,
    setSelectedElement,
    searchQuery,
    setSearchQuery,
    customTimes,
    pomoMode,
    pomoTimeLeft,
    pomoRunning,
    pomoTotalTime,
    swTime,
    swRunning,
    alarms,
    alarmInput,
    setAlarmInput,
    handlePomoModeChange,
    handleCustomTimeChange,
    handlePomoStart,
    handlePomoPause,
    handlePomoReset,
    handleSwStart,
    handleSwPause,
    handleSwReset,
    handleAddAlarm,
    handleToggleAlarm,
    handleDeleteAlarm,
    handlePlantElement,
  };
}
