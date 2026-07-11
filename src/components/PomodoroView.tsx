import { useState, useEffect, useRef } from 'preact/hooks';
import { Language } from '../types/types.js';
import { translations } from '../utils/i18n.js';

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
  const pomoTimerRef = useRef<number | null>(null);

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swTimerRef = useRef<number | null>(null);

  // Alarm State
  const [alarmTarget, setAlarmTarget] = useState('');
  const [alarmRunning, setAlarmRunning] = useState(false);
  const alarmTimerRef = useRef<number | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
      if (swTimerRef.current) clearInterval(swTimerRef.current);
      if (alarmTimerRef.current) clearInterval(alarmTimerRef.current);
    };
  }, []);

  // --- Main Pomodoro Logic ---
  const handlePomoModeChange = (mode: 'focus' | 'short' | 'long') => {
    handlePomoPause();
    setPomoMode(mode);
    setPomoTimeLeft(MODE_TIMES[mode]);
    setPomoTotalTime(MODE_TIMES[mode]);
  };

  const handlePomoStart = () => {
    if (pomoRunning) return;
    setPomoRunning(true);
    pomoTimerRef.current = window.setInterval(() => {
      setPomoTimeLeft((prev) => {
        if (prev <= 1) {
          handlePomoPause();
          notify('Pomodoro finished!');
          // Auto switch mode
          const nextMode = pomoMode === 'focus' ? 'short' : 'focus';
          setPomoMode(nextMode);
          setPomoTimeLeft(MODE_TIMES[nextMode]);
          setPomoTotalTime(MODE_TIMES[nextMode]);
          return MODE_TIMES[nextMode];
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePomoPause = () => {
    if (pomoTimerRef.current) {
      clearInterval(pomoTimerRef.current);
      pomoTimerRef.current = null;
    }
    setPomoRunning(false);
  };

  const handlePomoReset = () => {
    handlePomoPause();
    setPomoTimeLeft(MODE_TIMES[pomoMode]);
    setPomoTotalTime(MODE_TIMES[pomoMode]);
  };

  // --- Stopwatch Logic ---
  const handleSwStart = () => {
    if (swRunning) return;
    setSwRunning(true);
    swTimerRef.current = window.setInterval(() => {
      setSwTime((prev) => prev + 1);
    }, 1000);
  };

  const handleSwPause = () => {
    if (swTimerRef.current) {
      clearInterval(swTimerRef.current);
      swTimerRef.current = null;
    }
    setSwRunning(false);
  };

  const handleSwReset = () => {
    handleSwPause();
    setSwTime(0);
  };

  // --- Alarm Logic ---
  const handleAlarmStart = () => {
    if (!alarmTarget) return;
    setAlarmRunning(true);

    if (alarmTimerRef.current) {
      clearInterval(alarmTimerRef.current);
    }

    alarmTimerRef.current = window.setInterval(() => {
      const now = new Date().toTimeString().slice(0, 5);
      if (now === alarmTarget) {
        handleAlarmStop();
        notify('ALARM!');
      }
    }, 1000);
  };

  const handleAlarmStop = () => {
    if (alarmTimerRef.current) {
      clearInterval(alarmTimerRef.current);
      alarmTimerRef.current = null;
    }
    setAlarmRunning(false);
    setAlarmTarget('');
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

          {/* Alarm Mini Card */}
          <div className="mini-tool-card" id="alarm-mini">
            <div className="mini-tool-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>{lang === 'tr' ? 'Alarm' : 'Alarm'}</span>
            </div>
            <div className="mini-tool-content">
              <input
                type="time"
                id="alarm-time-input"
                className="mini-alarm-input"
                value={alarmTarget}
                onInput={(e) => setAlarmTarget((e.target as HTMLInputElement).value)}
                disabled={alarmRunning}
              />
              <div className="mini-controls">
                {!alarmRunning ? (
                  <button id="alarm-start-btn" className="mini-btn primary" onClick={handleAlarmStart}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                ) : (
                  <button id="alarm-stop-btn" className="mini-btn primary" onClick={handleAlarmStop}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
