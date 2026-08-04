import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import {
  pomodoroManager,
  PomoState,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import type { Language } from "@/domain/value-objects/Language.js";

const POMO_MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

export function usePopup() {
  const [popupTab, setPopupTab] = useState<"pomo" | "detox" | "volume">("pomo");
  const [lang, setLang] = useState<Language>("en");

  // --- Pomodoro Sync States ---
  const [pomoState, setPomoState] = useState<PomoState>({
    mode: "focus",
    running: false,
    timeLeft: POMO_MODE_TIMES.focus,
    totalTime: POMO_MODE_TIMES.focus,
    endTime: 0,
  });

  const pomoTimerRef = useRef<number | null>(null);

  // --- Stopwatch Sync States ---
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [swStartTime, setSwStartTime] = useState(0);

  // --- Alarms Sync States ---
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [alarmInput, setAlarmInput] = useState("");

  // --- Detox Sync States ---
  const [detoxEnabled, setDetoxEnabled] = useState(false);
  const [detoxBlockedSites, setDetoxBlockedSites] = useState<string[]>([]);
  const [detoxEndTime, setDetoxEndTime] = useState(0);
  const [detoxDuration, setDetoxDuration] = useState(30 * 60 * 1000); // 30m default
  const [detoxTimeLeft, setDetoxTimeLeft] = useState(0);

  const loadDetoxSettings = useCallback(() => {
    chrome.storage.sync.get(
      ["detox_enabled", "detox_blocked_sites", "detox_end_time"],
      (resData: {
        detox_enabled?: boolean;
        detox_blocked_sites?: string[];
        detox_end_time?: number;
      }) => {
        const isEnabled = resData.detox_enabled || false;
        const end = resData.detox_end_time || 0;
        setDetoxEnabled(isEnabled);
        setDetoxBlockedSites(resData.detox_blocked_sites || []);
        setDetoxEndTime(end);
      },
    );
  }, []);

  // 1. Initial State Retrieval & Synchronization Subscriptions
  useEffect(() => {
    // Load UI Language
    chrome.storage.sync.get(["lang"], (res) => {
      if (res.lang) {
        setLang(res.lang as Language);
      } else if (typeof chrome !== "undefined" && chrome.i18n) {
        const uiLang = chrome.i18n.getUILanguage();
        setLang(uiLang.startsWith("tr") ? "tr" : "en");
      }
    });

    // A. Pomodoro timers
    pomodoroManager.getState().then(setPomoState);
    const unsubPomo = pomodoroManager.onStateChanged(setPomoState);

    // B. Stopwatch
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

    // C. Alarms
    pomodoroManager.getAlarms().then(setAlarms);
    const unsubAlarms = pomodoroManager.onAlarmsChanged(setAlarms);

    // D. Detox Settings
    loadDetoxSettings();
    const unsubStorage = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "sync") {
        if (changes["lang"]) {
          setLang(changes["lang"].newValue as Language);
        }
        if (
          changes["detox_enabled"] ||
          changes["detox_blocked_sites"] ||
          changes["detox_end_time"]
        ) {
          loadDetoxSettings();
        }
      }
    };
    chrome.storage.onChanged.addListener(unsubStorage);

    return () => {
      unsubPomo();
      unsubSw();
      unsubAlarms();
      chrome.storage.onChanged.removeListener(unsubStorage);
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
      }
    };
  }, [loadDetoxSettings]);

  // 2. Tick Pomodoro Timer Locally
  useEffect(() => {
    if (pomoTimerRef.current) {
      clearInterval(pomoTimerRef.current);
      pomoTimerRef.current = null;
    }

    if (pomoState.running) {
      pomoTimerRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.round((pomoState.endTime - now) / 1000),
        );

        setPomoState((prev) => {
          if (remaining === 0) {
            if (pomoTimerRef.current) {
              clearInterval(pomoTimerRef.current);
            }
            return { ...prev, running: false, timeLeft: 0 };
          }
          return { ...prev, timeLeft: remaining };
        });
      }, 1000);
    }

    return () => {
      if (pomoTimerRef.current) {
        clearInterval(pomoTimerRef.current);
      }
    };
  }, [pomoState.running, pomoState.endTime]);

  // 3. Tick Stopwatch Locally
  useEffect(() => {
    let swInterval: number | null = null;
    if (swRunning) {
      swInterval = window.setInterval(() => {
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
      if (swInterval) {
        clearInterval(swInterval);
      }
    };
  }, [swRunning, swStartTime]);

  // 4. Tick Detoks Blocker Timer Locally
  useEffect(() => {
    let detoxInterval: number | null = null;
    if (detoxEnabled && detoxEndTime !== -1) {
      const calcDetox = () => {
        const remaining = Math.max(
          0,
          Math.round((detoxEndTime - Date.now()) / 1000),
        );
        setDetoxTimeLeft(remaining);
        if (remaining === 0) {
          handleDisableDetox();
        }
      };
      calcDetox();
      detoxInterval = window.setInterval(calcDetox, 1000);
    } else {
      setDetoxTimeLeft(0);
    }
    return () => {
      if (detoxInterval) {
        clearInterval(detoxInterval);
      }
    };
  }, [detoxEnabled, detoxEndTime]);

  // --- Pomodoro Action Handles ---
  const handlePomoTabChange = useCallback(
    async (mode: "focus" | "short" | "long") => {
      const totalTime = POMO_MODE_TIMES[mode];
      const newState = await pomodoroManager.resetTimer(mode, totalTime);
      setPomoState(newState);
    },
    [],
  );

  const handlePomoPlayPause = useCallback(async () => {
    if (pomoState.running) {
      const newState = await pomodoroManager.pauseTimer(pomoState.timeLeft);
      setPomoState(newState);
    } else {
      const newState = await pomodoroManager.startTimer(
        pomoState.timeLeft,
        pomoState.mode,
        pomoState.totalTime,
      );
      setPomoState(newState);
    }
  }, [pomoState]);

  const handlePomoReset = useCallback(async () => {
    const newState = await pomodoroManager.resetTimer(
      pomoState.mode,
      pomoState.totalTime,
    );
    setPomoState(newState);
  }, [pomoState]);

  // --- Stopwatch Action Handles ---
  const handleSwPlayPause = useCallback(async () => {
    if (swRunning) {
      await pomodoroManager.pauseStopwatch(swTime);
      setSwRunning(false);
    } else {
      const state = await pomodoroManager.startStopwatch(swTime);
      setSwRunning(true);
      setSwStartTime(state.startTime);
    }
  }, [swRunning, swTime]);

  const handleSwReset = useCallback(async () => {
    await pomodoroManager.resetStopwatch();
    setSwTime(0);
    setSwRunning(false);
  }, []);

  // --- Alarms Action Handles ---
  const handleAddAlarm = useCallback(async () => {
    if (!alarmInput) {
      return;
    }
    const list = await pomodoroManager.addAlarm(alarmInput);
    setAlarms(list);
    setAlarmInput("");
  }, [alarmInput]);

  const handleToggleAlarm = useCallback(
    async (id: string, enabled: boolean) => {
      const list = await pomodoroManager.toggleAlarm(id, enabled);
      setAlarms(list);
    },
    [],
  );

  const handleDeleteAlarm = useCallback(async (id: string) => {
    const list = await pomodoroManager.deleteAlarm(id);
    setAlarms(list);
  }, []);

  // --- Detoks Action Handles ---
  const handleTogglePopupSite = useCallback(
    (siteDomains: string[]) => {
      const isSelected = detoxBlockedSites.includes(siteDomains[0]);
      let updated;
      if (isSelected) {
        updated = detoxBlockedSites.filter((d) => !siteDomains.includes(d));
      } else {
        updated = [...detoxBlockedSites, ...siteDomains];
      }
      setDetoxBlockedSites(updated);
      chrome.storage.sync.set({ detox_blocked_sites: updated });
    },
    [detoxBlockedSites],
  );

  const handleEnableDetox = useCallback(() => {
    if (detoxBlockedSites.length === 0) {
      return;
    }
    const end = detoxDuration === -1 ? -1 : Date.now() + detoxDuration;
    chrome.storage.sync.set(
      {
        detox_enabled: true,
        detox_blocked_sites: detoxBlockedSites,
        detox_end_time: end,
      },
      () => {
        setDetoxEnabled(true);
        setDetoxEndTime(end);
      },
    );
  }, [detoxBlockedSites, detoxDuration]);

  const handleDisableDetox = useCallback(() => {
    chrome.storage.sync.set(
      {
        detox_enabled: false,
        detox_end_time: 0,
      },
      () => {
        setDetoxEnabled(false);
        setDetoxEndTime(0);
        setDetoxTimeLeft(0);
      },
    );
  }, []);

  return {
    popupTab,
    setPopupTab,
    lang,
    pomoState,
    swRunning,
    swTime,
    alarms,
    alarmInput,
    setAlarmInput,
    detoxEnabled,
    detoxBlockedSites,
    detoxEndTime,
    detoxDuration,
    setDetoxDuration,
    detoxTimeLeft,
    handlePomoTabChange,
    handlePomoPlayPause,
    handlePomoReset,
    handleSwPlayPause,
    handleSwReset,
    handleAddAlarm,
    handleToggleAlarm,
    handleDeleteAlarm,
    handleTogglePopupSite,
    handleEnableDetox,
    handleDisableDetox,
  };
}
