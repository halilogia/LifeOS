/**
 * PomoAmbientPlayerCard.tsx
 * Pomodoro yan panel ortam sesleri oynatıcı kartı (Yağmur, Rüzgar, Fön, LoFi ve Ses Seviyesi).
 */

import { AmbientSoundType } from "@/services/ambientAudioService.js";

interface PomoAmbientPlayerCardProps {
  title: string;
  rainLabel: string;
  windLabel: string;
  brownLabel: string;
  lofiLabel: string;
  activeSound: AmbientSoundType;
  isPlaying: boolean;
  volume: number;
  onSoundToggle: (soundType: AmbientSoundType) => void;
  onVolumeChange: (newVolume: number) => void;
}

export function PomoAmbientPlayerCard({
  title,
  rainLabel,
  windLabel,
  brownLabel,
  lofiLabel,
  activeSound,
  isPlaying,
  volume,
  onSoundToggle,
  onVolumeChange,
}: PomoAmbientPlayerCardProps) {
  return (
    <div
      className="mini-tool-card"
      id="ambient-player-mini"
      style={{ marginTop: "16px" }}
    >
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
        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{title}</span>

        {/* Pulsing Sound wave visualizer when playing */}
        {isPlaying && (
          <div
            className="sound-visualizer"
            style={{
              display: "flex",
              gap: "2px",
              marginLeft: "auto",
              alignItems: "flex-end",
              height: "12px",
            }}
          >
            <span className="sound-bar bar-1"></span>
            <span className="sound-bar bar-2"></span>
            <span className="sound-bar bar-3"></span>
          </div>
        )}
      </div>

      <div
        className="ambient-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <button
          className={`ambient-btn ${activeSound === "rain" && isPlaying ? "active" : ""}`}
          onClick={() => onSoundToggle("rain")}
          style={{
            padding: "10px 8px",
            background:
              activeSound === "rain" && isPlaying
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.02)",
            border:
              activeSound === "rain" && isPlaying
                ? "1px solid var(--accent-color)"
                : "1px solid var(--card-border)",
            borderRadius: "10px",
            color:
              activeSound === "rain" && isPlaying
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            fontSize: "0.75rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
        >
          🌧️ {rainLabel}
        </button>

        <button
          className={`ambient-btn ${activeSound === "wind" && isPlaying ? "active" : ""}`}
          onClick={() => onSoundToggle("wind")}
          style={{
            padding: "10px 8px",
            background:
              activeSound === "wind" && isPlaying
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.02)",
            border:
              activeSound === "wind" && isPlaying
                ? "1px solid var(--accent-color)"
                : "1px solid var(--card-border)",
            borderRadius: "10px",
            color:
              activeSound === "wind" && isPlaying
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            fontSize: "0.75rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
        >
          🍃 {windLabel}
        </button>

        <button
          className={`ambient-btn ${activeSound === "white_noise" && isPlaying ? "active" : ""}`}
          onClick={() => onSoundToggle("white_noise")}
          style={{
            padding: "10px 8px",
            background:
              activeSound === "white_noise" && isPlaying
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.02)",
            border:
              activeSound === "white_noise" && isPlaying
                ? "1px solid var(--accent-color)"
                : "1px solid var(--card-border)",
            borderRadius: "10px",
            color:
              activeSound === "white_noise" && isPlaying
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            fontSize: "0.75rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
        >
          💨 {brownLabel}
        </button>

        <button
          className={`ambient-btn ${activeSound === "lofi" && isPlaying ? "active" : ""}`}
          onClick={() => onSoundToggle("lofi")}
          style={{
            padding: "10px 8px",
            background:
              activeSound === "lofi" && isPlaying
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.02)",
            border:
              activeSound === "lofi" && isPlaying
                ? "1px solid var(--accent-color)"
                : "1px solid var(--card-border)",
            borderRadius: "10px",
            color:
              activeSound === "lofi" && isPlaying
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            fontSize: "0.75rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
        >
          📻 {lofiLabel}
        </button>
      </div>

      {/* Volume Slider Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "12px",
          background: "rgba(0,0,0,0.15)",
          padding: "6px 10px",
          borderRadius: "8px",
        }}
      >
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
          onChange={(e) =>
            onVolumeChange(parseFloat((e.target as HTMLInputElement).value))
          }
          style={{
            flex: 1,
            height: "4px",
            borderRadius: "2px",
            background: "rgba(255, 255, 255, 0.1)",
            outline: "none",
            cursor: "pointer",
            WebkitAppearance: "none",
          }}
        />
        <span
          style={{
            fontSize: "0.68rem",
            color: "var(--text-secondary)",
            minWidth: "22px",
            textAlign: "right",
          }}
        >
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
