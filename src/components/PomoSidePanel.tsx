/**
 * PomoSidePanel.tsx
 * Pomodoro yan panel bileşeni (Kronometre, Telefon tarzı Alarmlar ve Odak Sesleri Sentezleyicisi).
 * Layout Assembly Pattern ile parçalarına ayrıştırılmıştır.
 */

import { useState, useEffect, useRef } from "preact/hooks";
import { AlarmItem } from "@/infrastructure/services/PomodoroManagerService.js";
import { Language } from "@/types/types.js";
import { getTranslation } from "@/utils/i18n.js";
import {
  createAmbientAudioEngine,
  AmbientSoundType,
} from "@/services/ambientAudioService.js";

// Extracted Sub-components
import { PomoStopwatchCard } from "@/components/pomodoro/PomoStopwatchCard.js";
import { PomoAlarmsCard } from "@/components/pomodoro/PomoAlarmsCard.js";
import { PomoAmbientPlayerCard } from "@/components/pomodoro/PomoAmbientPlayerCard.js";

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
  const t = getTranslation(lang);

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
    audioEngineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    return () => {
      audioEngineRef.current?.stopAllSounds();
    };
  }, []);

  const handleSoundToggle = (soundType: AmbientSoundType) => {
    const engine = audioEngineRef.current;
    if (!engine) {return;}

    if (activeSound === soundType && isPlaying) {
      engine.stopAllSounds();
      setIsPlaying(false);
    } else {
      setActiveSound(soundType);
      setIsPlaying(true);
      if (soundType === "white_noise") {
        engine.playHairdryer(volume);
      } else if (soundType === "rain") {
        engine.playRain(volume);
      } else if (soundType === "wind") {
        engine.playWind(volume);
      } else if (soundType === "lofi") {
        engine.playLofi(volume);
      }
    }
  };

  return (
    <div className="pomodoro-side-panel">
      {/* Stopwatch Mini Card */}
      <PomoStopwatchCard
        title={t.pomo_stopwatch}
        swTime={swTime}
        swRunning={swRunning}
        onSwStart={onSwStart}
        onSwPause={onSwPause}
        onSwReset={onSwReset}
      />

      {/* Alarm Card (Phone-style list) */}
      <PomoAlarmsCard
        title={t.pomo_alarms}
        noAlarmsText={t.pomo_no_alarms}
        alarms={alarms}
        alarmInput={alarmInput}
        onAlarmInput={onAlarmInput}
        onAddAlarm={onAddAlarm}
        onToggleAlarm={onToggleAlarm}
        onDeleteAlarm={onDeleteAlarm}
      />

      {/* Ambient Sounds Player Mini Card */}
      <PomoAmbientPlayerCard
        title={t.pomo_focus_music}
        rainLabel={t.pomo_ambient_rain}
        windLabel={t.pomo_ambient_wind}
        brownLabel={t.pomo_ambient_brown || t.pomo_ambient_hairdryer}
        lofiLabel={t.pomo_ambient_lofi}
        activeSound={activeSound}
        isPlaying={isPlaying}
        volume={volume}
        onSoundToggle={handleSoundToggle}
        onVolumeChange={setVolume}
      />
    </div>
  );
}
