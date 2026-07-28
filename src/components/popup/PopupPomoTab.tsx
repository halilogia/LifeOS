import { useState, useEffect, useRef } from "preact/hooks";
import {
  PomoState,
  AlarmItem,
} from "../../infrastructure/services/PomodoroManagerService.js";
import {
  createAmbientAudioEngine,
  AmbientSoundType,
} from "../../services/ambientAudioService.js";
import { PomoAmbientPlayerCard } from "../pomodoro/PomoAmbientPlayerCard.js";

interface PopupPomoTabProps {
  t: Record<string, string>;
  pomoState: PomoState;
  swRunning: boolean;
  swTime: number;
  alarms: AlarmItem[];
  alarmInput: string;
  setAlarmInput: (val: string) => void;
  handlePomoTabChange: (mode: "focus" | "short" | "long") => void;
  handlePomoPlayPause: () => void;
  handlePomoReset: () => void;
  handleSwPlayPause: () => void;
  handleSwReset: () => void;
  handleAddAlarm: () => void;
  handleToggleAlarm: (id: string, enabled: boolean) => void;
  handleDeleteAlarm: (id: string) => void;
}

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 53; // compact radius r=53

export function PopupPomoTab({
  t,
  pomoState,
  swRunning,
  swTime,
  alarms,
  alarmInput,
  setAlarmInput,
  handlePomoTabChange,
  handlePomoPlayPause,
  handlePomoReset,
  handleSwPlayPause,
  handleSwReset,
  handleAddAlarm,
  handleToggleAlarm,
  handleDeleteAlarm,
}: PopupPomoTabProps) {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioEngineRef = useRef<ReturnType<
    typeof createAmbientAudioEngine
  > | null>(null);

  if (!audioEngineRef.current) {
    audioEngineRef.current = createAmbientAudioEngine();
  }

  const playSoundInEngine = (soundType: AmbientSoundType, vol: number) => {
    if (!audioEngineRef.current) return;
    if (soundType === "none") {
      audioEngineRef.current.stopAllSounds();
    } else if (soundType === "rain") {
      audioEngineRef.current.playRain(vol);
    } else if (soundType === "wind") {
      audioEngineRef.current.playWind(vol);
    } else if (soundType === "white_noise") {
      audioEngineRef.current.playHairdryer(vol);
    } else if (soundType === "lofi") {
      audioEngineRef.current.playLofi(vol);
    }
  };

  useEffect(() => {
    if (audioEngineRef.current && isPlaying) {
      audioEngineRef.current.setVolume(volume);
    }
    chrome.runtime.sendMessage({ type: "set_ambient_volume", volume }).catch(() => {});
  }, [volume, isPlaying]);

  const handleSoundToggle = (soundType: AmbientSoundType) => {
    if (activeSound === soundType && isPlaying) {
      setActiveSound("none");
      setIsPlaying(false);
      playSoundInEngine("none", volume);
      chrome.runtime.sendMessage({
        type: "play_ambient_sound",
        soundType: "none",
        volume,
      }).catch(() => {});
    } else {
      setActiveSound(soundType);
      setIsPlaying(true);
      playSoundInEngine(soundType, volume);
      chrome.runtime.sendMessage({
        type: "play_ambient_sound",
        soundType,
        volume,
      }).catch(() => {});
    }
  };

  // Format Helper MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const percent = pomoState.timeLeft / pomoState.totalTime;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percent);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* Pomodoro Panel (Compact) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "12px 8px",
        }}
      >
        {/* Pomo modes selector */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            width: "100%",
            padding: "0 4px",
          }}
        >
          {(["focus", "short", "long"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handlePomoTabChange(m)}
              style={{
                flex: 1,
                background:
                  pomoState.mode === m ? "var(--accent-color)" : "transparent",
                border: "none",
                color: pomoState.mode === m ? "white" : "var(--text-secondary)",
                borderRadius: "6px",
                fontSize: "0.65rem",
                padding: "4px 0",
                fontWeight: "700",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {m === "focus" ? t.focus : m === "short" ? t.short : t.long}
            </button>
          ))}
        </div>

        {/* Timer visual circle progress overlay */}
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            style={{
              transform: "rotate(-90deg)",
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="53"
              fill="none"
              stroke="rgba(255,255,255,0.01)"
              stroke-width="6"
            />
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
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>
              {formatTime(pomoState.timeLeft)}
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                letterSpacing: "1px",
                opacity: 0.7,
                textTransform: "uppercase",
              }}
            >
              {pomoState.mode === "focus"
                ? t.focus
                : pomoState.mode === "short"
                  ? t.short
                  : t.long}
            </span>
          </div>
        </div>

        {/* Controls play pause reset */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handlePomoPlayPause}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--accent-color)",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {pomoState.running ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="4" y="4" width="4" height="16" rx="1" />
                <rect x="16" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handlePomoReset}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--card-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Synced Stopwatch Panel (Compact) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "10px 14px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--text-secondary)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {t.pomo_stopwatch}
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginTop: "2px",
            }}
          >
            {formatTime(swTime)}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={handleSwPlayPause}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "var(--accent-color)",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {swRunning ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="4" y="4" width="4" height="16" rx="1" />
                <rect x="16" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSwReset}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--card-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <polyline points="3 3 3 8 8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Synced Alarms Panel (Phone-style List) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "12px",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            color: "var(--text-secondary)",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {t.pomo_alarms}
        </span>

        {/* Quick entry form */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <input
            type="time"
            className="mini-alarm-input"
            style={{ flex: 1 }}
            value={alarmInput}
            onInput={(e) => setAlarmInput((e.target as HTMLInputElement).value)}
          />
          <button
            className="popup-alarm-add-btn"
            onClick={handleAddAlarm}
            title={t.pomo_alarms}
          >
            +
          </button>
        </div>

        {/* Alarms scroll list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "120px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {alarms.length === 0 ? (
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                textAlign: "center",
                padding: "10px 0",
              }}
            >
              {t.pomo_tab_alarms === "Alarms"
                ? "No alarms set"
                : "Kurulu alarm yok"}
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 10px",
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "10px",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: alarm.enabled ? "white" : "var(--text-secondary)",
                  }}
                >
                  {alarm.time}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <label className="popup-switch">
                    <input
                      type="checkbox"
                      checked={alarm.enabled}
                      onChange={(e) =>
                        handleToggleAlarm(
                          alarm.id,
                          (e.target as HTMLInputElement).checked,
                        )
                      }
                    />
                    <span className="popup-slider"></span>
                  </label>
                  <button
                    className="popup-alarm-delete-btn"
                    onClick={() => handleDeleteAlarm(alarm.id)}
                    title={t.delete || "Sil"}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Odak Müzikleri & Sesleri Mini Kartı */}
      <PomoAmbientPlayerCard
        title={t.pomo_focus_music || "Odak Müzikleri & Sesleri"}
        rainLabel={t.pomo_ambient_rain || "Yağmur"}
        windLabel={t.pomo_ambient_wind || "Rüzgar"}
        brownLabel={t.pomo_ambient_brown || "Kahverengi Gürültü"}
        lofiLabel={t.pomo_ambient_lofi || "Lo-Fi Radyo"}
        activeSound={activeSound}
        isPlaying={isPlaying}
        volume={volume}
        onSoundToggle={handleSoundToggle}
        onVolumeChange={setVolume}
      />
    </div>
  );
}
