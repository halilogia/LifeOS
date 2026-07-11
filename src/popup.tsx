import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { pomodoroManager, PomoState, AlarmItem, StopwatchState } from './core/pomodoroManager.js';

const POMO_MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 55; // Smaller circle for compact view (r=55)

function PopupApp() {
  const [popupTab, setPopupTab] = useState<'pomo' | 'detox'>('pomo');

  // --- Pomodoro Sync States ---
  const [pomoState, setPomoState] = useState<PomoState>({
    mode: 'focus',
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
  const [alarmInput, setAlarmInput] = useState('');

  // --- Detox Sync States ---
  const [detoxEnabled, setDetoxEnabled] = useState(false);
  const [detoxBlockedSites, setDetoxBlockedSites] = useState<string[]>([]);
  const [detoxEndTime, setDetoxEndTime] = useState(0);
  const [detoxDuration, setDetoxDuration] = useState(30 * 60 * 1000); // 30m default
  const [detoxTimeLeft, setDetoxTimeLeft] = useState(0);
  const [detoxInput, setDetoxInput] = useState('');

  // 1. Initial State Retrieval & Synchronization Subscriptions
  useEffect(() => {
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
    const unsubStorage = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync') {
        if (changes['detox_enabled'] || changes['detox_blocked_sites'] || changes['detox_end_time']) {
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
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, []);

  const loadDetoxSettings = () => {
    chrome.storage.sync.get(['detox_enabled', 'detox_blocked_sites', 'detox_end_time'], (res) => {
      const isEnabled = res.detox_enabled || false;
      const end = res.detox_end_time || 0;
      setDetoxEnabled(isEnabled);
      setDetoxBlockedSites(res.detox_blocked_sites || []);
      setDetoxEndTime(end);
    });
  };

  // 2. Tick Pomodoro Timer Locally
  useEffect(() => {
    if (pomoTimerRef.current) {
      clearInterval(pomoTimerRef.current);
      pomoTimerRef.current = null;
    }

    if (pomoState.running) {
      pomoTimerRef.current = window.setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((pomoState.endTime - now) / 1000));
        
        setPomoState((prev) => {
          if (remaining === 0) {
            if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
            return { ...prev, running: false, timeLeft: 0 };
          }
          return { ...prev, timeLeft: remaining };
        });
      }, 1000);
    }

    return () => {
      if (pomoTimerRef.current) clearInterval(pomoTimerRef.current);
    };
  }, [pomoState.running, pomoState.endTime]);

  // 3. Tick Stopwatch Locally
  useEffect(() => {
    let swInterval: number | null = null;
    if (swRunning) {
      swInterval = window.setInterval(() => {
        const elapsed = Math.max(0, Math.floor((Date.now() - swStartTime) / 1000));
        chrome.storage.local.get(['stopwatch_state'], (res) => {
          const offset = res['stopwatch_state']?.time || 0;
          setSwTime(offset + elapsed);
        });
      }, 1000);
    }
    return () => {
      if (swInterval) clearInterval(swInterval);
    };
  }, [swRunning, swStartTime]);

  // 4. Tick Detoks Blocker Timer Locally
  useEffect(() => {
    let detoxInterval: number | null = null;
    if (detoxEnabled && detoxEndTime !== -1) {
      const calcDetox = () => {
        const remaining = Math.max(0, Math.round((detoxEndTime - Date.now()) / 1000));
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
      if (detoxInterval) clearInterval(detoxInterval);
    };
  }, [detoxEnabled, detoxEndTime]);

  // --- Pomodoro Action Handles ---
  const handlePomoTabChange = async (mode: 'focus' | 'short' | 'long') => {
    const totalTime = POMO_MODE_TIMES[mode];
    const newState = await pomodoroManager.resetTimer(mode, totalTime);
    setPomoState(newState);
  };

  const handlePomoPlayPause = async () => {
    if (pomoState.running) {
      const newState = await pomodoroManager.pauseTimer(pomoState.timeLeft);
      setPomoState(newState);
    } else {
      const newState = await pomodoroManager.startTimer(pomoState.timeLeft, pomoState.mode, pomoState.totalTime);
      setPomoState(newState);
    }
  };

  const handlePomoReset = async () => {
    const newState = await pomodoroManager.resetTimer(pomoState.mode, pomoState.totalTime);
    setPomoState(newState);
  };

  // --- Stopwatch Action Handles ---
  const handleSwPlayPause = async () => {
    if (swRunning) {
      await pomodoroManager.pauseStopwatch(swTime);
      setSwRunning(false);
    } else {
      const state = await pomodoroManager.startStopwatch(swTime);
      setSwRunning(true);
      setSwStartTime(state.startTime);
    }
  };

  const handleSwReset = async () => {
    await pomodoroManager.resetStopwatch();
    setSwTime(0);
    setSwRunning(false);
  };

  // --- Alarms Action Handles ---
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

  // --- Detoks Action Handles ---
  const handleAddDetoxSite = () => {
    let site = detoxInput.trim().toLowerCase();
    if (!site) return;
    site = site.replace(/^(https?:\/\/)?(www\.)?/, '');
    if (!site) return;

    const updated = [...detoxBlockedSites, site];
    setDetoxBlockedSites(updated);
    chrome.storage.sync.set({ detox_blocked_sites: updated });
    setDetoxInput('');
  };

  const handleRemoveDetoxSite = (site: string) => {
    const updated = detoxBlockedSites.filter((s) => s !== site);
    setDetoxBlockedSites(updated);
    chrome.storage.sync.set({ detox_blocked_sites: updated });
  };

  const handleEnableDetox = () => {
    if (detoxBlockedSites.length === 0) return;
    const end = detoxDuration === -1 ? -1 : Date.now() + detoxDuration;
    chrome.storage.sync.set({
      detox_enabled: true,
      detox_blocked_sites: detoxBlockedSites,
      detox_end_time: end,
    }, () => {
      setDetoxEnabled(true);
      setDetoxEndTime(end);
    });
  };

  const handleDisableDetox = () => {
    chrome.storage.sync.set({
      detox_enabled: false,
      detox_end_time: 0,
    }, () => {
      setDetoxEnabled(false);
      setDetoxEndTime(0);
      setDetoxTimeLeft(0);
    });
  };

  // Format Helper MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatLongTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    let str = '';
    if (h > 0) {
      str += `${h.toString().padStart(2, '0')}:`;
    }
    str += `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return str;
  };

  // Pomodoro Visual
  const percent = pomoState.timeLeft / pomoState.totalTime;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  return (
    <div className="popup-container" style={{ padding: '1rem', width: '330px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header with App Tab Switchers */}
      <div className="popup-tabs" style={{ background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '12px', border: '1px solid var(--card-border)', width: '100%', display: 'flex' }}>
        <button
          className={`popup-tab-btn ${popupTab === 'pomo' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem' }}
          onClick={() => setPopupTab('pomo')}
        >
          Pomodoro & Alarmlar
        </button>
        <button
          className={`popup-tab-btn ${popupTab === 'detox' ? 'active' : ''}`}
          style={{ flex: 1, padding: '8px 0', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', fontWeight: '600', fontSize: '0.8rem' }}
          onClick={() => setPopupTab('detox')}
        >
          Detoks
        </button>
      </div>

      {popupTab === 'pomo' ? (
        // --- POMODORO & STOPWATCH & ALARMS LAYOUT ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          
          {/* Pomodoro Panel (Compact) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '12px 8px' }}>
            {/* Pomo modes selector */}
            <div style={{ display: 'flex', gap: '4px', width: '100%', padding: '0 4px' }}>
              {(['focus', 'short', 'long'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handlePomoTabChange(m)}
                  style={{
                    flex: 1,
                    background: pomoState.mode === m ? 'var(--accent-color)' : 'transparent',
                    border: 'none',
                    color: pomoState.mode === m ? 'white' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    padding: '4px 0',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {m === 'focus' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
                </button>
              ))}
            </div>

            {/* Timer visual circle progress overlay */}
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="53" fill="none" stroke="rgba(255,255,255,0.01)" stroke-width="6" />
                <circle
                  cx="60"
                  cy="60"
                  r="53"
                  fill="none"
                  stroke="var(--accent-color)"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-dasharray={CIRCLE_CIRCUMFERENCE}
                  stroke-dashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '700' }}>{formatTime(pomoState.timeLeft)}</span>
                <span style={{ fontSize: '0.55rem', letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase' }}>{pomoState.mode}</span>
              </div>
            </div>

            {/* Controls play pause reset */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePomoPlayPause}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-color)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {pomoState.running ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="4" height="16" rx="1" />
                    <rect x="16" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handlePomoReset}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Synced Stopwatch Panel (Compact) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kronometre</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '2px' }}>{formatTime(swTime)}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleSwPlayPause}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-color)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                {swRunning ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="4" height="16" rx="1" />
                    <rect x="16" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleSwReset}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--card-border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <polyline points="3 3 3 8 8 8" />
                </svg>
              </button>
            </div>
          </div>

          {/* Synced Alarms Panel (Phone-style List) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '12px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alarmlar</span>
            
            {/* Quick entry form */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="time"
                className="mini-alarm-input"
                style={{ flex: 1, height: '30px', fontSize: '0.8rem', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                value={alarmInput}
                onInput={(e) => setAlarmInput((e.target as HTMLInputElement).value)}
              />
              <button
                className="mini-btn primary"
                style={{ borderRadius: '8px', height: '30px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                onClick={handleAddAlarm}
              >
                +
              </button>
            </div>

            {/* Alarms scroll list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '2px' }}>
              {alarms.length === 0 ? (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>Kurulu alarm yok</div>
              ) : (
                alarms.map((alarm) => (
                  <div key={alarm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '10px', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: alarm.enabled ? 'white' : 'var(--text-secondary)' }}>{alarm.time}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={(e) => handleToggleAlarm(alarm.id, (e.target as HTMLInputElement).checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        // --- DETOKS INTERFACE LAYOUT ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Durum</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: detoxEnabled ? '#10b981' : 'var(--text-secondary)', marginTop: '2px' }}>
                  {detoxEnabled ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {detoxEnabled && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {detoxEndTime === -1 ? 'Süresiz' : formatLongTime(detoxTimeLeft)}
                </div>
              )}
            </div>

            {detoxEnabled ? (
              <button className="detox-btn danger" style={{ padding: '8px 0', fontSize: '0.8rem', borderRadius: '8px' }} onClick={handleDisableDetox}>
                Detoksu Sonlandır
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Duration select */}
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Süre Belirleyin</span>
                  <select
                    className="free-games-select detox-select"
                    style={{ width: '120px', height: '30px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)' }}
                    value={detoxDuration}
                    onChange={(e) => setDetoxDuration(Number((e.target as HTMLSelectElement).value))}
                  >
                    <option value={15 * 60 * 1000}>15 Dakika</option>
                    <option value={30 * 60 * 1000}>30 Dakika</option>
                    <option value={60 * 60 * 1000}>1 Saat</option>
                    <option value={120 * 60 * 1000}>2 Saat</option>
                    <option value={240 * 60 * 1000}>4 Saat</option>
                    <option value={-1}>Süresiz</option>
                  </select>
                </div>

                {/* Manual site entry */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    style={{ flex: 1, height: '30px', fontSize: '0.75rem', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)', color: 'white' }}
                    placeholder="Site Ekle: reddit.com..."
                    value={detoxInput}
                    onInput={(e) => setDetoxInput((e.target as HTMLInputElement).value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddDetoxSite();
                    }}
                  />
                  <button
                    className="mini-btn primary"
                    style={{ borderRadius: '8px', height: '30px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                    onClick={handleAddDetoxSite}
                  >
                    +
                  </button>
                </div>

                {/* custom blocked list scroll */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto', margin: '4px 0', paddingRight: '2px' }}>
                  {detoxBlockedSites.length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>Engelli site yok</div>
                  ) : (
                    detoxBlockedSites.map((site) => (
                      <div key={site} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', borderRadius: '8px', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{site}</span>
                        <button
                          onClick={() => handleRemoveDetoxSite(site)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button className="detox-btn primary" style={{ padding: '8px 0', fontSize: '0.8rem', borderRadius: '8px', width: '100%', marginTop: '6px' }} onClick={handleEnableDetox}>
                  Detoksu Başlat
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

const container = document.getElementById('popup-app');
if (container) {
  render(<PopupApp />, container);
}
