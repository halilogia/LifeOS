import { useState, useEffect, useRef } from "preact/hooks";
import { Language, PomodoroLog } from "../types/types.js";
import { pomodoroManager, AlarmItem } from "@/infrastructure/services/PomodoroManagerService.js";
import { translations } from "../utils/i18n.js";
import { PomoSidePanel } from "@/components/PomoSidePanel.js";
import { PomoTimerCard } from "@/components/pomodoro/PomoTimerCard.js";
import { PomoZenGardenCard } from "@/components/pomodoro/PomoZenGardenCard.js";
import { PomoZenHistoryCard } from "@/components/pomodoro/PomoZenHistoryCard.js";

interface PomodoroViewProps {
  lang: Language;
}

const MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODE_LABELS = { focus: "FOCUS", short: "SHORT", long: "LONG" };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110;

export function PomodoroView({ lang }: PomodoroViewProps) {
  const t = translations[lang];

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"timer" | "zen">("timer");

  // Zen Garden & History states
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroLog[]>([]);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [focusNote, setFocusNote] = useState("");
  const [selectedElement, setSelectedElement] = useState<PomodoroLog["element"]>("bonsai");
  const [lastCompletedDuration, setLastCompletedDuration] = useState(25 * 60);
  const [lastCompletedStartTime, setLastCompletedStartTime] = useState("");
  const [lastCompletedEndTime, setLastCompletedEndTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pomodoro State
  const [customTimes, setCustomTimes] = useState<{ focus: number; short: number; long: number }>({
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
    chrome.storage.sync.get(["pomodoroHistory"], (res) => {
      setPomodoroHistory((res.pomodoroHistory as PomodoroLog[]) || []);
    });

    // 5. Load custom times settings
    chrome.storage.sync.get(["pomoCustomTimes"], (res) => {
      const times = res.pomoCustomTimes as { focus: number; short: number; long: number } | undefined;
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
  }, [pomoRunning, pomoEndTime, pomoMode, pomoTotalTime]);

  // Tick Stopwatch locally
  useEffect(() => {
    let interval: number | null = null;
    if (swRunning) {
      interval = window.setInterval(() => {
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - swStartTime) / 1000),
        );
        chrome.storage.local.get(["stopwatch_state"], (resData) => {
          const res = resData as Record<string, any>;
          const offset = res["stopwatch_state"]?.time || 0;
          setSwTime(offset + elapsed);
        });
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
      const currentHHMM = now.toTimeString().slice(0, 5); // "HH:MM"

      alarms.forEach(async (alarm) => {
        if (alarm.enabled && alarm.time === currentHHMM) {
          // Disable so it triggers only once during this minute
          await pomodoroManager.toggleAlarm(alarm.id, false);
          notify(
            lang === "tr"
              ? `Alarm Zamanı: ${alarm.time}`
              : `Alarm Triggered: ${alarm.time}`,
          );
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [alarms, lang]);

  // --- Main Pomodoro Logic ---
  const handlePomoModeChange = async (mode: "focus" | "short" | "long") => {
    const totalTime = customTimes[mode];
    await pomodoroManager.resetTimer(mode, totalTime);
  };

  const handleCustomTimeChange = async (mode: "focus" | "short" | "long", mins: number) => {
    if (isNaN(mins) || mins <= 0) return;
    const seconds = mins * 60;
    const newTimes = { ...customTimes, [mode]: seconds };
    setCustomTimes(newTimes);
    chrome.storage.sync.set({ pomoCustomTimes: newTimes });

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

  // --- Synced Stopwatch Handlers ---
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

  // --- Synced Alarms Handlers ---
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

  // --- Zen Garden Handlers ---
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
      note: focusNote.trim() || (lang === "tr" ? "Odaklanma Seansı" : "Focus Session"),
      element: selectedElement,
      position,
    };

    const nextHistory = [...pomodoroHistory.filter((h) => h.position !== position), newLog];
    await new Promise<void>((r) => chrome.storage.sync.set({ pomodoroHistory: nextHistory }, r));
    setPomodoroHistory(nextHistory);
    setShowPlantModal(false);
    setFocusNote("");
  };

  // Notification and Audio Alert Helper
  const notify = (msg: string) => {
    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.volume = 0.4;
      audio.play();
    } catch (e) {
      console.error(e);
    }
    if (Notification.permission === "granted") {
      new Notification("Life OS", { body: msg });
    } else {
      Notification.requestPermission();
    }
  };

  // Format Helper: Seconds to MM:SS
  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate Progress Ring Offset
  const percent = pomoTimeLeft / pomoTotalTime;
  const progressOffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  const renderZenElementSvg = (element: PomodoroLog["element"]) => {
    switch (element) {
      case "bonsai":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M12 48h40l-4 8H16l-4-8z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
            <rect x="20" y="56" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.15)"/>
            <rect x="38" y="56" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.15)"/>
            <path d="M32 48c0 0-4-8 1-14c5-6-2-12-2-12s-4 4-2 8c2 4-2 7-3 10c-1 3-3 8-3 8z" fill="#a1887f" stroke="#8d6e63" stroke-width="1.5"/>
            <circle cx="25" cy="22" r="8" fill="rgba(129,199,132,0.85)" />
            <circle cx="36" cy="18" r="9" fill="rgba(76,175,80,0.85)" />
            <circle cx="44" cy="24" r="6.5" fill="rgba(129,199,132,0.85)" />
          </svg>
        );
      case "koi":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="26" fill="rgba(129,212,250,0.1)" stroke="rgba(129,212,250,0.3)" stroke-width="1.5"/>
            <path d="M22 36c4-4 12-2 16-6s4-12 4-12s-6 2-10 6s-2 12-2 12z" fill="#ffb74d" stroke="#f57c00" stroke-width="1.5"/>
            <path d="M38 30c2-2 6-1 8-3s2-6 2-6s-3 1-5 3s-1 6-1 6z" fill="#e0e0e0" stroke="#9e9e9e" stroke-width="1"/>
            <path d="M22 36c-2 2-6 2-6 2s1-4 3-6" stroke="#f57c00" stroke-width="1.5"/>
          </svg>
        );
      case "pagoda":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <rect x="22" y="50" width="20" height="6" rx="1" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
            <path d="M16 46h32l-4-10H20l-4 10z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M20 34h24l-3-8H23l-3 8z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M23 24h18l-2-6H25l-2 6z" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
            <line x1="32" y1="18" x2="32" y2="10" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
          </svg>
        );
      case "lantern":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M16 26c8-4 24-4 32 0l-4-6H20l-4 6z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <rect x="22" y="26" width="20" height="18" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
            <circle cx="32" cy="36" r="5" fill="#ffb74d" />
            <rect x="28" y="44" width="8" height="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
          </svg>
        );
      case "bamboo":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <rect x="28" y="10" width="5" height="12" rx="1" fill="rgba(129,199,132,0.7)" stroke="rgba(76,175,80,0.8)" stroke-width="1.5"/>
            <rect x="28" y="24" width="5" height="12" rx="1" fill="rgba(129,199,132,0.7)" stroke="rgba(76,175,80,0.8)" stroke-width="1.5"/>
            <rect x="28" y="38" width="5" height="12" rx="1" fill="rgba(129,199,132,0.7)" stroke="rgba(76,175,80,0.8)" stroke-width="1.5"/>
            <path d="M33 16c4 0 8-3 10-6c-2 4-6 6-10 6z" fill="rgba(76,175,80,0.9)"/>
            <path d="M28 30c-4 0-8-3-10-6c2 4 6 6 10 6z" fill="rgba(76,175,80,0.9)"/>
            <path d="M33 44c4-1 8-4 9-8c-2 3-5 7-9 8z" fill="rgba(76,175,80,0.9)"/>
          </svg>
        );
      case "pebble":
        return (
          <svg viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="50" rx="20" ry="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
            <ellipse cx="32" cy="40" rx="15" ry="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <ellipse cx="32" cy="32" rx="10" ry="4" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const gridCells: any[] = [];
  for (let i = 0; i < 25; i++) {
    const log = pomodoroHistory.find((h) => h.position === i);
    gridCells.push(
      <div key={i} className="zen-grid-cell">
        {log ? (
          <>
            <div className={`zen-element-wrapper ${log.element}`}>
              {renderZenElementSvg(log.element)}
            </div>
            <div className="zen-tooltip">
              <span className="zen-tooltip-note">{log.note}</span>
              <span className="zen-tooltip-time">
                {new Date(log.endTime).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
              </span>
              <span className="zen-tooltip-time">
                {Math.round(log.duration / 60)} {t.minutes_abbr}
              </span>
            </div>
          </>
        ) : (
          <span style={{ opacity: 0.1, fontSize: "0.65rem" }}>+</span>
        )}
      </div>,
    );
  }

  const filteredHistory = pomodoroHistory
    .filter((log) => {
      if (!searchQuery.trim()) {
        return true;
      }
      return log.note?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

  return (
    <div id="pomodoro-view" className="view-content active">
      {/* Sub-Tab Navigation Header */}
      <div className="pomodoro-tab-header">
        <button
          className={`pomo-tab-link ${activeTab === "timer" ? "active" : ""}`}
          onClick={() => setActiveTab("timer")}
        >
          {t.pomo_tab_timer}
        </button>
        <button
          className={`pomo-tab-link ${activeTab === "zen" ? "active" : ""}`}
          onClick={() => setActiveTab("zen")}
        >
          {t.pomo_tab_zen}
        </button>
      </div>

      {activeTab === "timer" ? (
        <div className="pomodoro-dashboard">
          <PomoTimerCard
            lang={lang}
            pomoMode={pomoMode}
            pomoTimeLeft={pomoTimeLeft}
            pomoTotalTime={pomoTotalTime}
            pomoRunning={pomoRunning}
            customTimes={customTimes}
            progressOffset={progressOffset}
            CIRCLE_CIRCUMFERENCE={CIRCLE_CIRCUMFERENCE}
            MODE_LABELS={MODE_LABELS}
            formatTime={formatTime}
            onPomoReset={handlePomoReset}
            onPomoStart={handlePomoStart}
            onPomoPause={handlePomoPause}
            onPomoModeChange={handlePomoModeChange}
            onCustomTimeChange={handleCustomTimeChange}
          />

          {/* Side Panel: Stopwatch & Alarm */}
          <PomoSidePanel
            lang={lang}
            swTime={swTime}
            swRunning={swRunning}
            onSwStart={handleSwStart}
            onSwPause={handleSwPause}
            onSwReset={handleSwReset}
            alarms={alarms}
            alarmInput={alarmInput}
            onAlarmInput={setAlarmInput}
            onAddAlarm={handleAddAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        </div>
      ) : (
        <div className="zen-garden-panel">
          <PomoZenGardenCard
            lang={lang}
            gridCells={gridCells}
            showPlantModal={showPlantModal}
            focusNote={focusNote}
            selectedElement={selectedElement}
            t={t}
            onSetFocusNote={setFocusNote}
            onSetSelectedElement={setSelectedElement}
            onPlantElement={handlePlantElement}
            renderZenElementSvg={renderZenElementSvg}
          />

          <PomoZenHistoryCard
            lang={lang}
            searchQuery={searchQuery}
            onSearchQueryInput={setSearchQuery}
            filteredHistory={filteredHistory}
            t={t}
            renderZenElementSvg={renderZenElementSvg}
          />
        </div>
      )}
    </div>
  );
}
