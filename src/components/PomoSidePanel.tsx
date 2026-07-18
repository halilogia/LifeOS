import { AlarmItem } from "../core/pomodoroManager.js";
import { Language } from "../types/types.js";
import { useState, useEffect, useRef } from "preact/hooks";

interface PomoSidePanelProps {
  lang: Language;
  swTime: number;
  swRunning: boolean;
  onSwStart: () => void;
  onSwPause: () => void;
  onSwReset: () => void;
  alarms: AlarmItem[];
  alarmInput: string;
  onAlarmInput: (val: string) => void;
  onAddAlarm: () => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onDeleteAlarm: (id: string) => void;
}

export function PomoSidePanel({
  lang,
  swTime,
  swRunning,
  onSwStart,
  onSwPause,
  onSwReset,
  alarms,
  alarmInput,
  onAlarmInput,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
}: PomoSidePanelProps) {
  const [activeSound, setActiveSound] = useState<"none" | "rain" | "wind" | "white_noise" | "lofi">("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const whiteNoiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const whiteNoiseGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (whiteNoiseGainRef.current) {
      whiteNoiseGainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (whiteNoiseSourceRef.current) {
      try {
        whiteNoiseSourceRef.current.stop();
      } catch (e) {}
      whiteNoiseSourceRef.current = null;
    }
    whiteNoiseGainRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playHairdryer = () => {
    stopAllSounds();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const brownNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = brownNoiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = brownNoiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 350;

      const motorOsc = ctx.createOscillator();
      motorOsc.type = "sine";
      motorOsc.frequency.value = 90;

      const motorGain = ctx.createGain();
      motorGain.gain.value = 0.15;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      whiteNoiseGainRef.current = gainNode;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      motorOsc.connect(motorGain);
      motorGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      motorOsc.start();
      whiteNoiseSourceRef.current = noiseSource as any;
    } catch (e) {
      console.error("Failed to play hairdryer:", e);
    }
  };

  const playAudioUrl = (url: string) => {
    stopAllSounds();
    const audio = new Audio(url);
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;
    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
    });
  };

  const handleSoundToggle = (soundType: typeof activeSound) => {
    if (activeSound === soundType && isPlaying) {
      stopAllSounds();
      setIsPlaying(false);
    } else {
      setActiveSound(soundType);
      setIsPlaying(true);
      if (soundType === "white_noise") {
        playHairdryer();
      } else if (soundType === "rain") {
        playAudioUrl("https://www.soundjay.com/nature/sounds/rain-07.mp3");
      } else if (soundType === "wind") {
        playAudioUrl("https://www.soundjay.com/nature/sounds/wind-howl-01.mp3");
      } else if (soundType === "lofi") {
        playAudioUrl("https://lofi.stream.laut.fm/lofi");
      }
    }
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = timeInSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-side-panel">
      {/* Stopwatch Mini Card */}
      <div className="mini-tool-card" id="stopwatch-mini">
        <div className="mini-tool-header">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{lang === "tr" ? "Kronometre" : "Stopwatch"}</span>
        </div>
        <div className="mini-tool-content">
          <div id="stopwatch-time" className="mini-time">
            {formatTime(swTime)}
          </div>
          <div className="mini-controls">
            {!swRunning ? (
              <button
                id="sw-start-btn"
                className="mini-btn primary"
                onClick={onSwStart}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                id="sw-pause-btn"
                className="mini-btn primary"
                onClick={onSwPause}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>
            )}
            <button
              id="sw-reset-btn"
              className="mini-btn secondary"
              onClick={onSwReset}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Alarm Card (Phone-style list) */}
      <div
        className="mini-tool-card"
        id="alarm-mini"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minHeight: "260px",
        }}
      >
        <div className="mini-tool-header">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span>{lang === "tr" ? "Alarmlar" : "Alarms"}</span>
        </div>

        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <input
            type="time"
            className="mini-alarm-input"
            style={{ flex: 1 }}
            value={alarmInput}
            onInput={(e) =>
              onAlarmInput((e.target as HTMLInputElement).value)
            }
          />
          <button
            className="newtab-alarm-add-btn"
            onClick={onAddAlarm}
            title={lang === "tr" ? "Alarm Ekle" : "Add Alarm"}
          >
            +
          </button>
        </div>

        <div
          className="alarms-list-container"
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "180px",
            paddingRight: "4px",
          }}
        >
          {alarms.length === 0 ? (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                textAlign: "center",
                marginTop: "1rem",
              }}
            >
              {lang === "tr" ? "Kurulu alarm yok" : "No alarms set"}
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="alarm-row-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: alarm.enabled
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    flex: 1,
                  }}
                >
                  {alarm.time}
                </span>

                <label
                  className="switch"
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "34px",
                    height: "20px",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={(e) =>
                      onToggleAlarm(
                        alarm.id,
                        (e.target as HTMLInputElement).checked,
                      )
                    }
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    className="slider round"
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: alarm.enabled
                        ? "var(--accent-color)"
                        : "rgba(255,255,255,0.1)",
                      transition: ".3s",
                      borderRadius: "34px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: "14px",
                        width: "14px",
                        left: alarm.enabled ? "16px" : "3px",
                        bottom: "3px",
                        backgroundColor: "white",
                        transition: ".3s",
                        borderRadius: "50%",
                      }}
                    ></span>
                  </span>
                </label>

                <button
                  onClick={() => onDeleteAlarm(alarm.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                    flexShrink: 0,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "var(--danger)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ambient Sounds Player Mini Card */}
      <div className="mini-tool-card" id="ambient-player-mini" style={{ marginTop: "16px" }}>
        <div className="mini-tool-header">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
            {lang === "tr" ? "Odak Müzikleri & Sesleri" : "Focus Sounds & Music"}
          </span>
          
          {/* Pulsing Sound wave visualizer when playing */}
          {isPlaying && (
            <div className="sound-visualizer" style={{ display: "flex", gap: "2px", marginLeft: "auto", alignItems: "flex-end", height: "12px" }}>
              <span className="sound-bar bar-1"></span>
              <span className="sound-bar bar-2"></span>
              <span className="sound-bar bar-3"></span>
            </div>
          )}
        </div>

        <div className="ambient-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
          <button
            className={`ambient-btn ${activeSound === "rain" && isPlaying ? "active" : ""}`}
            onClick={() => handleSoundToggle("rain")}
            style={{
              padding: "10px 8px",
              background: activeSound === "rain" && isPlaying ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeSound === "rain" && isPlaying ? "1px solid var(--accent-color)" : "1px solid var(--card-border)",
              borderRadius: "10px",
              color: activeSound === "rain" && isPlaying ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            🌧️ {lang === "tr" ? "Yağmur" : "Rain"}
          </button>

          <button
            className={`ambient-btn ${activeSound === "wind" && isPlaying ? "active" : ""}`}
            onClick={() => handleSoundToggle("wind")}
            style={{
              padding: "10px 8px",
              background: activeSound === "wind" && isPlaying ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeSound === "wind" && isPlaying ? "1px solid var(--accent-color)" : "1px solid var(--card-border)",
              borderRadius: "10px",
              color: activeSound === "wind" && isPlaying ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            🍃 {lang === "tr" ? "Rüzgar" : "Wind"}
          </button>

          <button
            className={`ambient-btn ${activeSound === "white_noise" && isPlaying ? "active" : ""}`}
            onClick={() => handleSoundToggle("white_noise")}
            style={{
              padding: "10px 8px",
              background: activeSound === "white_noise" && isPlaying ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeSound === "white_noise" && isPlaying ? "1px solid var(--accent-color)" : "1px solid var(--card-border)",
              borderRadius: "10px",
              color: activeSound === "white_noise" && isPlaying ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            💨 {lang === "tr" ? "Saç Kurutma" : "Hairdryer"}
          </button>

          <button
            className={`ambient-btn ${activeSound === "lofi" && isPlaying ? "active" : ""}`}
            onClick={() => handleSoundToggle("lofi")}
            style={{
              padding: "10px 8px",
              background: activeSound === "lofi" && isPlaying ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeSound === "lofi" && isPlaying ? "1px solid var(--accent-color)" : "1px solid var(--card-border)",
              borderRadius: "10px",
              color: activeSound === "lofi" && isPlaying ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            📻 {lang === "tr" ? "Lo-Fi Radyo" : "Lo-Fi Radio"}
          </button>
        </div>

        {/* Volume Slider Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", background: "rgba(0,0,0,0.15)", padding: "6px 10px", borderRadius: "8px" }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            style={{ color: "var(--text-secondary)" }}
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255, 255, 255, 0.1)",
              outline: "none",
              cursor: "pointer",
              WebkitAppearance: "none"
            }}
          />
          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", minWidth: "22px", textAlign: "right" }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
