import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { WillpowerStreak, Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";

interface UseWillpowerOptions {
  lang: Language;
  onShowConfirm: (message: string, onConfirm: () => void) => void;
}

/**
 * Willpower sayaç + timer + geçmiş state mantığı (AGENTS.md 6.3: presentation/hooks/).
 * View sadece JSX render eder.
 */
export function useWillpower({ lang, onShowConfirm }: UseWillpowerOptions) {
  const t = getTranslation(lang);

  const [data, setData] = useState<WillpowerStreak | null>(null);
  const [note, setNote] = useState("");

  // Elapsed countdown states
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef<number | null>(null);

  const calculateTime = useCallback((startDateStr: string) => {
    const start = new Date(startDateStr).getTime();
    const now = new Date().getTime();
    const diffMs = Math.max(0, now - start);

    const diffSecs = Math.floor(diffMs / 1000);
    setDays(Math.floor(diffSecs / 86400));
    setHours(Math.floor((diffSecs % 86400) / 3600));
    setMinutes(Math.floor((diffSecs % 3600) / 60));
    setSeconds(diffSecs % 60);
  }, []);

  const loadData = useCallback(async () => {
    const result = await new Promise<any>((resolve) =>
      chrome.storage.sync.get(["willpowerStreak"], (res) =>
        resolve(res.willpowerStreak),
      ),
    );
    let streakData = result;
    if (!streakData) {
      streakData = {
        startDate: new Date().toISOString(),
        bestStreakDays: 0,
        history: [],
      };
      chrome.storage.sync.set({ willpowerStreak: streakData });
    }
    setData(streakData);
    calculateTime(streakData.startDate);

    // Setup active countdown timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      calculateTime(streakData!.startDate);
    }, 1000);
  }, [calculateTime]);

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loadData]);

  const handleReset = () => {
    if (!data) {
      return;
    }

    const confirmMsg = t.willpower_reset_confirm;
    onShowConfirm(confirmMsg, async () => {
      // Calculate elapsed days
      const start = new Date(data.startDate).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      const diffSecs = Math.floor(diffMs / 1000);
      const finalDays = Math.floor(diffSecs / 86400);

      const nowStr = new Date().toISOString();

      // Push new history item
      const historyItem = {
        startDate: data.startDate,
        endDate: nowStr,
        days: finalDays,
        note: note.trim() || undefined,
      };

      const updatedData: WillpowerStreak = {
        startDate: nowStr,
        bestStreakDays: Math.max(data.bestStreakDays, finalDays),
        history: [...data.history, historyItem],
      };

      await new Promise<void>((resolve) =>
        chrome.storage.sync.set({ willpowerStreak: updatedData }, resolve),
      );
      setNote("");
      setData(updatedData);
      calculateTime(nowStr);

      // Restart timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        calculateTime(nowStr);
      }, 1000);
    });
  };

  const handleClearHistory = () => {
    if (!data) {
      return;
    }
    const confirmMsg = t.willpower_clear_history_confirm;
    onShowConfirm(confirmMsg, async () => {
      const updatedData: WillpowerStreak = {
        ...data,
        history: [],
      };
      await new Promise<void>((resolve) =>
        chrome.storage.sync.set({ willpowerStreak: updatedData }, resolve),
      );
      setData(updatedData);
    });
  };

  // Determine Rank Metadata
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
