import { useState, useEffect, useRef } from 'preact/hooks';
import { Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';
import { pomodoroManager, AlarmItem } from '../core/pomodoroManager.js';

interface PomodoroViewProps {
  lang: Language;
}

const MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODE_LABELS = { focus: 'FOCUS', short: 'SHORT', long: 'LONG' };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110;

export function PomodoroView({ lang }: PomodoroViewProps) {
  const t = translations[lang];

  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<'focus' | 'short' | 'long'>('focus');
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
  const [alarmInput, setAlarmInput] = useState('');

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

    return () => {
      unsubPomo();
      unsubSw();
      unsubAlarms();
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
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
          if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
          setPomoRunning(false);
          notify('Pomodoro finished!');
        }
      }, 1000);
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoRunning, pomoEndTime]);

  // Tick Stopwatch locally
  useEffect(() => {
    let interval: number | null = null;
    if (swRunning) {
      interval = window.setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - swStartTime) / 1000));
        chrome.storage.local.get(['stopwatch_state'], (res) => {
          const offset = res['stopwatch_state']?.time || 0;
          setSwTime(offset + elapsed);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
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
          notify(lang === 'tr' ? `Alarm Zamanı: ${alarm.time}` : `Alarm Triggered: ${alarm.time}`);
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [alarms, lang]);

  // --- Main Pomodoro Logic ---
  const handlePomoModeChange = async (mode: 'focus' | 'short' | 'long') => {
    const totalTime = MODE_TIMES[mode];
    await pomodoroManager.resetTimer(mode, totalTime);
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
    if (!alarmInput) return;
    const list = await pomodoroManager.addAlarm(alarmInput);
    setAlarms(list);
    setAlarmInput('');
  };

  const handleToggleAlarm = async (id: string, enabled: boolean) => {
    const list = await pomodoroManager.toggleAlarm(id, enabled);
    setAlarms(list);
  };

  const handleDeleteAlarm = async (id: string) => {
    const list = await pomodoroManager.deleteAlarm(id);
    setAlarms(list);
  };

  // Notification and Audio Alert Helper
  const notify = (msg: string) => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.4;
      audio.play();
    } catch (e) {
      console.error(e);
    }
    if (Notification.permission === 'granted') {
      new Notification('Life OS', { body: msg });
    } else {
      Notification.requestPermission();
    }
  };

  // Format Helper: Seconds to MM:SS
  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Progress Ring Offset
  const percent = pomoTimeLeft / pomoTotalTime;
  const progressOffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  return (
    <div id="pomodoro-view" className="view-content active">
      <div className="pomodoro-dashboard">
        {/* Main Pomodoro */}
        <div className="pomodoro-main-card">
          <div className="pomodoro-visual-container">
            <svg className="progress-ring-main" width="240" height="240">
              <circle
                className="progress-ring__circle-bg"
                stroke="rgba(255,255,255,0.05)"
                stroke-width="8"
                fill="transparent"
                r="110"
                cx="120"
                cy="120"
              />
              <circle
                id="pomodoro-progress"
                className="progress-ring__circle"
                stroke="var(--accent-color)"
                stroke-width="8"
                stroke-linecap="round"
                fill="transparent"
                r="110"
                cx="120"
                cy="120"
                style={{
                  strokeDasharray: CIRCLE_CIRCUMFERENCE,
                  strokeDashoffset: progressOffset,
                  transition: 'stroke-dashoffset 0.3s',
                }}
              />
            </svg>
            <div className="pomodoro-timer-inner">
              <div id="pomodoro-time">{formatTime(pomoTimeLeft)}</div>
              <div id="pomodoro-label">{MODE_LABELS[pomoMode]}</div>
            </div>
          </div>

          <div className="pomodoro-controls">
            <button
              id="pomodoro-reset"
              className="pomodoro-action-btn secondary"
              title="Reset"
              onClick={handlePomoReset}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
            </button>

            {!pomoRunning ? (
              <button
                id="pomodoro-start"
                className="pomodoro-action-btn primary play-btn"
                onClick={handlePomoStart}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                id="pomodoro-pause"
                className="pomodoro-action-btn primary pause-btn"
                onClick={handlePomoPause}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
            )}

            <div style={{ width: '20px' }}></div>
          </div>

          <div className="pomodoro-modes" id="pomodoro-modes-container">
            <button
              className={`pomodoro-mode-btn ${pomoMode === 'focus' ? 'active' : ''}`}
              onClick={() => handlePomoModeChange('focus')}
            >
              {lang === 'tr' ? 'Odaklanma' : 'Focus'}
            </button>
            <button
              className={`pomodoro-mode-btn ${pomoMode === 'short' ? 'active' : ''}`}
              onClick={() => handlePomoModeChange('short')}
            >
              {lang === 'tr' ? 'Kısa Mola' : 'Short'}
            </button>
            <button
              className={`pomodoro-mode-btn ${pomoMode === 'long' ? 'active' : ''}`}
              onClick={() => handlePomoModeChange('long')}
            >
              {lang === 'tr' ? 'Uzun Mola' : 'Long'}
            </button>
          </div>
        </div>

        {/* Side Panel: Stopwatch & Alarm */}
        <div className="pomodoro-side-panel">
          {/* Stopwatch Mini Card */}
          <div className="mini-tool-card" id="stopwatch-mini">
            <div className="mini-tool-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{lang === 'tr' ? 'Kronometre' : 'Stopwatch'}</span>
            </div>
            <div className="mini-tool-content">
              <div id="stopwatch-time" className="mini-time">
                {formatTime(swTime)}
              </div>
              <div className="mini-controls">
                {!swRunning ? (
                  <button id="sw-start-btn" className="mini-btn primary" onClick={handleSwStart}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                ) : (
                  <button id="sw-pause-btn" className="mini-btn primary" onClick={handleSwPause}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  </button>
                )}
                <button id="sw-reset-btn" className="mini-btn secondary" onClick={handleSwReset}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <polyline points="3 3 3 8 8 8"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Alarm Card (Phone-style list) */}
          <div className="mini-tool-card" id="alarm-mini" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px' }}>
            <div className="mini-tool-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>{lang === 'tr' ? 'Alarmlar' : 'Alarms'}</span>
            </div>
            
            {/* Input area */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input
                type="time"
                className="mini-alarm-input"
                style={{ flex: 1 }}
                value={alarmInput}
                onInput={(e) => setAlarmInput((e.target as HTMLInputElement).value)}
              />
              <button
                className="mini-btn primary"
                style={{ borderRadius: '8px', padding: '0 12px', height: '36px' }}
                onClick={handleAddAlarm}
              >
                +
              </button>
            </div>

            {/* Alarms list scroll viewport */}
            <div className="alarms-list-container" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', paddingRight: '4px' }}>
              {alarms.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
                  {lang === 'tr' ? 'Kurulu alarm yok' : 'No alarms set'}
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div key={alarm.id} className="alarm-row-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    gap: '12px'
                  }}>
                    {/* Time display */}
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: alarm.enabled ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1 }}>
                      {alarm.time}
                    </span>
                    
                    {/* Enable toggle checkbox styled as phone switch */}
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={(e) => handleToggleAlarm(alarm.id, (e.target as HTMLInputElement).checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: alarm.enabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                        transition: '.3s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '14px', width: '14px',
                          left: alarm.enabled ? '16px' : '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '.3s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>

                    {/* Delete button */}
                    <button onClick={() => handleDeleteAlarm(alarm.id)} style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      flexShrink: 0
                    }} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger)')} onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
