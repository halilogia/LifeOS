import { useState, useEffect, useRef } from "preact/hooks";
import {
  PomoState,
  AlarmItem,
} from "@/infrastructure/services/PomodoroManagerService.js";
import {
  createAmbientAudioEngine,
  AmbientSoundType,
} from "@/services/ambientAudio/index.js";
import { PomoAmbientPlayerCard } from "@/components/pomodoro/PomoAmbientPlayerCard.js";
import { PomoTimerPanel } from "./pomo/PomoTimerPanel.js";
import { PomoStopwatchPanel } from "./pomo/PomoStopwatchPanel.js";
import { PomoAlarmsPanel } from "./pomo/PomoAlarmsPanel.js";

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

  useEffect(() => {
    if (audioEngineRef.current && isPlaying) {
      audioEngineRef.current.setVolume(volume);
    }
    chrome.runtime
      .sendMessage({ type: "set_ambient_volume", volume })
      .catch(() => {});
  }, [volume, isPlaying]);

  const handleSoundToggle = (soundType: AmbientSoundType) => {
    // Popup hem yerel motoru hem de offscreen belgesini sürer; ikisi de aynı
    // ses türü sözleşmesini kullanır.
    const nextSound =
      activeSound === soundType && isPlaying ? "none" : soundType;

    setActiveSound(nextSound);
    setIsPlaying(nextSound !== "none");
    audioEngineRef.current?.play(nextSound, volume);
    chrome.runtime
      .sendMessage({
        type: "play_ambient_sound",
        soundType: nextSound,
        volume,
      })
      .catch(() => {});
  };

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
      <PomoTimerPanel
        t={t}
        pomoState={pomoState}
        onTabChange={handlePomoTabChange}
        onPlayPause={handlePomoPlayPause}
        onReset={handlePomoReset}
      />

      {/* Synced Stopwatch Panel (Compact) */}
      <PomoStopwatchPanel
        t={t}
        swRunning={swRunning}
        swTime={swTime}
        onPlayPause={handleSwPlayPause}
        onReset={handleSwReset}
      />

      {/* Synced Alarms Panel (Phone-style List) */}
      <PomoAlarmsPanel
        t={t}
        alarms={alarms}
        alarmInput={alarmInput}
        onAlarmInputChange={setAlarmInput}
        onAddAlarm={handleAddAlarm}
        onToggleAlarm={handleToggleAlarm}
        onDeleteAlarm={handleDeleteAlarm}
      />

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
