import { useState, useEffect, useRef } from "preact/hooks";
import { Language, PomodoroLog } from "../types/types.js";
import {
  pomodoroManager,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import { translations } from "../utils/i18n.js";
import { PomoSidePanel } from "@/components/PomoSidePanel.js";
import { PomoTimerCard } from "@/components/pomodoro/PomoTimerCard.js";
import { PomoZenGardenCard } from "@/components/pomodoro/PomoZenGardenCard.js";
import { PomoZenHistoryCard } from "@/components/pomodoro/PomoZenHistoryCard.js";
import { PomoHeaderTabs } from "@/components/pomodoro/PomoHeaderTabs.js";
import { renderZenElementSvg } from "@/components/pomodoro/PomoZenElementSvgs.js";

interface PomodoroViewProps {
  lang: Language;
}

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
      const currentHHMM = now.toTimeString().slice(0, 5);

      alarms.forEach(async (alarm) => {
        if (alarm.enabled && alarm.time === currentHHMM) {
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
      note:
        focusNote.trim() ||
        (lang === "tr" ? "Odaklanma Seansı" : "Focus Session"),
      element: selectedElement,
      position,
    };

    const nextHistory = [
      ...pomodoroHistory.filter((h) => h.position !== position),
      newLog,
    ];
    await new Promise<void>((r) =>
      chrome.storage.sync.set({ pomodoroHistory: nextHistory }, r),
    );
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
                {new Date(log.endTime).toLocaleDateString(
                  lang === "tr" ? "tr-TR" : "en-US",
                )}
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
    .sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
    );

  return (
    <div id="pomodoro-view" className="view-content active">
      {/* Sub-Tab Navigation Header */}
      <PomoHeaderTabs
        activeTab={activeTab}
        pomoTabTimerLabel={t.pomo_tab_timer}
        pomoTabZenLabel={t.pomo_tab_zen}
        onTabChange={setActiveTab}
      />

      {activeTab === "timer" ? (
        <div className="pomodoro-dashboard">
          <PomoTimerCard
            lang={lang}
            pomoMode={pomoMode}
            pomoTimeLeft={pomoTimeLeft}
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
