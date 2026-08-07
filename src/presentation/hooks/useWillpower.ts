import { useEffect } from "preact/hooks";
import { Language } from "@/types/types.js";
import { useWillpowerState } from "@/presentation/store/willpowerStore.js";

interface UseWillpowerOptions {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

/**
 * Facade over useWillpowerState — all state + timer + storage lives in the store.
 * configure() is called every render to keep fresh closures (lang, onShowConfirm).
 */
export function useWillpower({ lang, onShowConfirm }: UseWillpowerOptions) {
  const data = useWillpowerState((s) => s.data);
  const note = useWillpowerState((s) => s.note);
  const setNote = useWillpowerState((s) => s.setNote);
  const days = useWillpowerState((s) => s.days);
  const hours = useWillpowerState((s) => s.hours);
  const minutes = useWillpowerState((s) => s.minutes);
  const seconds = useWillpowerState((s) => s.seconds);
  const handleReset = useWillpowerState((s) => s.handleReset);
  const handleClearHistory = useWillpowerState((s) => s.handleClearHistory);

  // CRITICAL: configure on every render (fresh closures for lang/onShowConfirm).
  useWillpowerState.getState().configure({ lang, onShowConfirm });

  useEffect(() => {
    void useWillpowerState.getState().loadData();
  }, []);

  // Rank metadata (pure derivation — same thresholds as before)
  let rankKey: string;
  if (days < 3) {
    rankKey = "initiate";
  } else if (days < 7) {
    rankKey = "iron";
  } else if (days < 14) {
    rankKey = "control";
  } else if (days < 30) {
    rankKey = "warrior";
  } else if (days < 90) {
    rankKey = "knight";
  } else {
    rankKey = "master";
  }

  const currentBest = data ? Math.max(data.bestStreakDays, days) : days;
  const historyList = data ? data.history : [];

  return {
    data,
    note,
    setNote,
    days,
    hours,
    minutes,
    seconds,
    rankKey,
    currentBest,
    historyList,
    handleReset,
    handleClearHistory,
  };
}
