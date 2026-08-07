import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { Language, PomodoroLog } from "@/types/types.js";
import {
  pomodoroManager,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import { logger } from "@/utils/logger.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";

interface UsePomodoroOptions {
  lang: Language;
  t: Record<string, string>;
}

/**
 * Pomodoro timer + stopwatch + alarms + zen garden state & handlers.
 * (AGENTS.md 6.3: presentation/hooks/) — View sadece JSX render eder.
 */
export function usePomodoro({ lang, t }: UsePomodoroOptions) {
  // Tab navigation
  const [activeTab, setActiveTab] = useState<"timer" | "zen">("timer");

  // Zen Garden & History states
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroLog[]>([]);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [focusNote, setFocusNote] = useState("");
  const [selectedElement, setSelectedElement] =
    useState<PomodoroLog["element"]>("bonsai");
  const [lastCompletedDuration, setLastCompletedDuration] = useState(25 * 60);
  const [lastCompletedStartTime, setLastCompletedStartTime] = useState("");
  const [lastCompletedEndTime, setLastCompletedEndTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pomodoro State
  const [customTimes, setCustomTimes] = useState<{
    focus: number;
    short: number;
    long: number;
  }>({
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  });
  const [pomoMode, setPomoMode] = useState<"focus" | "short" | "long">("focus");
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60);
  const [pomoTotalTime, setPomoTotalTime] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoEndTime, setPomoEndTime] = useState(0);
  const pomoTimerRef = useRef<number | null>(null);

  // Synced Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swStartTime, setSwStartTime] = useState(0);

  // Synced Alarms State
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [alarmInput, setAlarmInput] = useState("");

  // Notification and Audio Alert Helper
  const notify = useCallback((msg: string) => {
    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.volume = 0.4;
      audio.play();
    } catch (e) {
      logger.error("[PomodoroView] notify audio failed:", e);
    }
    if (Notification.permission === "granted") {
      new Notification("Life OS", { body: msg });
    } else {
      Notification.requestPermission();
    }
  }, []);

  // Sync with storage on mount and subscribe to changes
  useEffect(() => {
    // 1. Pomodoro initial state
    pomodoroManager.getState().then((state) => {
      setPomoMode(state.mode);
      setPomoTimeLeft(state.timeLeft);
      setPomoTotalTime(state.totalTime);
      setPomoRunning(state.running);
      setPomoEndTime(state.endTime);
    });

    const unsubPomo = pomodoroManager.onStateChanged((state) => {
      setPomoMode(state.mode);
      setPomoTimeLeft(state.timeLeft);
      setPomoTotalTime(state.totalTime);
      setPomoRunning(state.running);
      setPomoEndTime(state.endTime);
    });

    // 2. Stopwatch initial state
    pomodoroManager.getStopwatch().then((s) => {
      setSwRunning(s.running);
      setSwTime(s.time);
      setSwStartTime(s.startTime);
    });

    const unsubSw = pomodoroManager.onStopwatchChanged((s) => {
      setSwRunning(s.running);
      setSwTime(s.time);
      setSwStartTime(s.startTime);
    });

    // 3. Alarms initial state
    pomodoroManager.getAlarms().then((list) => {
      setAlarms(list);
    });

    const unsubAlarms = pomodoroManager.onAlarmsChanged((list) => {
      setAlarms(list);
    });

    // 4. Pomodoro history initial state
    chrome.storage.local.get(["pomodoroHistory"], (res) => {
      setPomodoroHistory((res.pomodoroHistory as PomodoroLog[]) || []);
    });

    // 5. Load custom times settings
    chrome.storage.local.get(["pomoCustomTimes"], (res) => {
      const times = res.pomoCustomTimes as
        { focus: number; short: number; long: number } | undefined;
      if (times) {
        setCustomTimes(times);
      }
    });

    return () => {
      unsubPomo();
      unsubSw();
      unsubAlarms();
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
      }
    };
  }, []);

  // Tick Pomodoro timer locally
  useEffect(() => {
    if (pomoTimerRef.current) {
      clearInterval(pomoTimerRef.current);
      pomoTimerRef.current = null;
    }

    if (pomoRunning) {
      pomoTimerRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((pomoEndTime - now) / 1000));

        setPomoTimeLeft(remaining);
        if (remaining === 0) {
          if (pomoTimerRef.current) {
            clearInterval(pomoTimerRef.current);
          }
          setPomoRunning(false);
          notify(
            pomoMode === "focus"
              ? "Focus session completed! Plant your Zen Element."
              : "Break finished!",
          );
          if (pomoMode === "focus") {
            setLastCompletedDuration(pomoTotalTime);
            setLastCompletedStartTime(
              new Date(Date.now() - pomoTotalTime * 1000).toISOString(),
            );
            setLastCompletedEndTime(new Date().toISOString());
            setShowPlantModal(true);
          }
        }
      }, 1000);
    }

    return () => {
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
      }
    };
  }, [pomoRunning, pomoEndTime, pomoMode, pomoTotalTime, notify]);

  // Tick Stopwatch locally
  useEffect(() => {
    let interval: number | null = null;
    if (swRunning) {
      interval = window.setInterval(() => {
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - swStartTime) / 1000),
        );
        chrome.storage.local.get(
          ["stopwatch_state"],
          (resData: { stopwatch_state?: { time?: number } }) => {
            const offset = resData?.stopwatch_state?.time || 0;
            setSwTime(offset + elapsed);
          },
        );
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [swRunning, swStartTime]);

  // Monitor active alarms list in real-time
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5);

      alarms.forEach(async (alarm) => {
        if (alarm.enabled && alarm.time === currentHHMM) {
          await pomodoroManager.toggleAlarm(alarm.id, false);
          notify(`${t.alarm_time_label} ${alarm.time}`);
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [alarms, lang, t, notify]);

  // Main Pomodoro Handlers
  const handlePomoModeChange = async (mode: "focus" | "short" | "long") => {
    const totalTime = customTimes[mode];
    await pomodoroManager.resetTimer(mode, totalTime);
  };

  const handleCustomTimeChange = async (
    mode: "focus" | "short" | "long",
    mins: number,
  ) => {
    if (isNaN(mins) || mins <= 0) {
      return;
    }
    const seconds = mins * 60;
    const newTimes = { ...customTimes, [mode]: seconds };
    setCustomTimes(newTimes);
    chrome.storage.local.set({ pomoCustomTimes: newTimes });
    scheduleCloudBackup();

    if (!pomoRunning && pomoMode === mode) {
      await pomodoroManager.resetTimer(mode, seconds);
    }
  };

  const handlePomoStart = async () => {
    await pomodoroManager.startTimer(pomoTimeLeft, pomoMode, pomoTotalTime);
  };

  const handlePomoPause = async () => {
    await pomodoroManager.pauseTimer(pomoTimeLeft);
  };

  const handlePomoReset = async () => {
    await pomodoroManager.resetTimer(pomoMode, pomoTotalTime);
  };

  // Synced Stopwatch Handlers
  const handleSwStart = async () => {
    const state = await pomodoroManager.startStopwatch(swTime);
    setSwRunning(true);
    setSwStartTime(state.startTime);
  };

  const handleSwPause = async () => {
    await pomodoroManager.pauseStopwatch(swTime);
    setSwRunning(false);
  };

  const handleSwReset = async () => {
    await pomodoroManager.resetStopwatch();
    setSwTime(0);
    setSwRunning(false);
  };

  // Synced Alarms Handlers
  const handleAddAlarm = async () => {
    if (!alarmInput) {
      return;
    }
    const list = await pomodoroManager.addAlarm(alarmInput);
    setAlarms(list);
    setAlarmInput("");
  };

  const handleToggleAlarm = async (id: string, enabled: boolean) => {
    const list = await pomodoroManager.toggleAlarm(id, enabled);
    setAlarms(list);
  };

  const handleDeleteAlarm = async (id: string) => {
    const list = await pomodoroManager.deleteAlarm(id);
    setAlarms(list);
  };

  // Zen Garden Handlers
  const handlePlantElement = async () => {
    let position = -1;
    const occupied = new Set(pomodoroHistory.map((h) => h.position));
    for (let i = 0; i < 25; i++) {
      if (!occupied.has(i)) {
        position = i;
        break;
      }
    }
    if (position === -1) {
      position = pomodoroHistory.length % 25;
    }

    const newLog: PomodoroLog = {
      id: Math.random().toString(36).substring(2, 9),
      startTime: lastCompletedStartTime || new Date().toISOString(),
      endTime: lastCompletedEndTime || new Date().toISOString(),
      duration: lastCompletedDuration,
      mode: "focus",
      note: focusNote.trim() || t.pomodoro_session_title,
      element: selectedElement,
      position,
    };

    const nextHistory = [
      ...pomodoroHistory.filter((h) => h.position !== position),
      newLog,
    ];
    await new Promise<void>((r) =>
      chrome.storage.local.set({ pomodoroHistory: nextHistory }, r),
    );
    setPomodoroHistory(nextHistory);
    setShowPlantModal(false);
    setFocusNote("");
    scheduleCloudBackup();
  };

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
