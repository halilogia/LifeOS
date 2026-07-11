import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { pomodoroManager, PomoState } from './core/pomodoroManager.js';

const MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 70; // r=70 stroke progress

function PopupApp() {
  const [state, setState] = useState<PomoState>({
    mode: 'focus',
    running: false,
    timeLeft: MODE_TIMES.focus,
    totalTime: MODE_TIMES.focus,
    endTime: 0,
  });

  const timerRef = useRef<number | null>(null);

  // Load initial state and subscribe to sync changes
  useEffect(() => {
    pomodoroManager.getState().then((initialState) => {
      setState(initialState);
    });

    const unsubscribe = pomodoroManager.onStateChanged((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Tick timer locally if running
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (state.running) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((state.endTime - now) / 1000));
        
        setState((prev) => {
          if (remaining === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Trigger audio alert or notification if wanted
            chrome.notifications?.create({
              type: 'basic',
              iconUrl: 'icons/icon_128.png', // Fallback icon path
              title: 'Life OS Pomodoro',
              message: prev.mode === 'focus' ? 'Focus session completed! Time for a break.' : 'Break finished! Back to work.',
            });
            return {
              ...prev,
              running: false,
              timeLeft: 0,
            };
          }
          return {
            ...prev,
            timeLeft: remaining,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.running, state.endTime]);

  const handleTabChange = async (mode: 'focus' | 'short' | 'long') => {
    const totalTime = MODE_TIMES[mode];
    const newState = await pomodoroManager.resetTimer(mode, totalTime);
    setState(newState);
  };

  const handlePlayPause = async () => {
    if (state.running) {
      const newState = await pomodoroManager.pauseTimer(state.timeLeft);
      setState(newState);
    } else {
      const newState = await pomodoroManager.startTimer(state.timeLeft, state.mode, state.totalTime);
      setState(newState);
    }
  };

  const handleReset = async () => {
    const newState = await pomodoroManager.resetTimer(state.mode, state.totalTime);
    setState(newState);
  };

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // SVG Circle stroke calculation
  const progressRatio = state.timeLeft / state.totalTime;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progressRatio);

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Life OS</h1>
        <span className="logo-tag">Pomodoro</span>
      </header>

      {/* Tabs */}
      <div className="popup-tabs">
        <button
          className={`popup-tab-btn ${state.mode === 'focus' ? 'active' : ''}`}
          onClick={() => handleTabChange('focus')}
        >
          Focus
        </button>
        <button
          className={`popup-tab-btn ${state.mode === 'short' ? 'active' : ''}`}
          onClick={() => handleTabChange('short')}
        >
          Short
        </button>
        <button
          className={`popup-tab-btn ${state.mode === 'long' ? 'active' : ''}`}
          onClick={() => handleTabChange('long')}
        >
          Long
        </button>
      </div>

      {/* Circular Timer Progress */}
      <div className="timer-circle-container">
        <svg className="timer-svg" viewBox="0 0 160 160">
          <circle className="timer-circle-bg" cx="80" cy="80" r="70" />
          <circle
            className="timer-circle-progress"
            cx="80"
            cy="80"
            r="70"
            stroke-dasharray={CIRCLE_CIRCUMFERENCE}
            stroke-dashoffset={strokeDashoffset}
          />
        </svg>
        <div className="timer-text-overlay">
          <span className="timer-time">{formatTime(state.timeLeft)}</span>
          <span className="timer-mode-label">{state.mode}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="popup-controls">
        <button className="control-btn play-pause" onClick={handlePlayPause}>
          {state.running ? (
            // Pause Icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            // Play Icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button className="control-btn reset" onClick={handleReset}>
          {/* Reset/Stop Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const container = document.getElementById('popup-app');
if (container) {
  render(<PopupApp />, container);
}
