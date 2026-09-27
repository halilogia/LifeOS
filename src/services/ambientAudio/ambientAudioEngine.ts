/**
 * ambientAudioEngine.ts
 * Katman 4 — Yaşam döngüsü ve orkestrasyon.
 * Tek bir `AudioContext` sahiplenir, aktif sesi (voice) tutar, kullanıcı ses
 * seviyesini uygular ve kapatma sırasında tüm alt katman kaynaklarını serbest
 * bırakır. Ses türü -> üretici kararını `VOICE_FACTORIES` tablosuna devreder;
 * çağıran taraf (popup, side panel, offscreen) tek bir `play()` çağırır.
 */

import { logger } from "@/utils/logger.js";
import type {
  AmbientAudioEngine,
  AmbientSoundType,
} from "./ambientAudioTypes.js";
import { VOICE_FACTORIES, type VoiceHandle } from "./voices.js";

const DEFAULT_VOLUME = 0.5;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) {
    return DEFAULT_VOLUME;
  }
  return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, volume));
}

function createAudioContext(): AudioContext {
  const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioCtor) {
    throw new Error("Web Audio API is not available in this context");
  }
  return new AudioCtor();
}

export function createAmbientAudioEngine(): AmbientAudioEngine {
  let ctx: AudioContext | null = null;
  let voice: VoiceHandle | null = null;
  /**
   * Zamanlayıcı geri çağrılarının, susturulmuş bir sesi yeniden akıtmaması için
   * kullanılan jeton. Her `play` / `stopAllSounds` çağrısı bu değeri artırır.
   */
  let generation = 0;

  const stopAllSounds = () => {
    generation += 1;

    if (!voice) {
      return;
    }
    for (const timer of voice.timers) {
      clearInterval(timer);
    }
    for (const source of voice.sources) {
      try {
        source.stop();
      } catch {
        // Zaten durmuş ya da hiç başlatılmamış kaynakları yoksay.
      }
      source.disconnect();
    }
    voice.masterGain.disconnect();
    voice = null;
  };

  const setVolume = (volume: number) => {
    if (!voice) {
      return;
    }
    voice.masterGain.gain.value = clampVolume(volume);
  };

  const play = (soundType: AmbientSoundType, volume: number) => {
    stopAllSounds();

    if (soundType === "none") {
      return;
    }

    const factory = VOICE_FACTORIES[soundType];
    if (!factory) {
      return;
    }

    const myGeneration = generation;

    try {
      if (!ctx) {
        ctx = createAudioContext();
      }
      // Tarayıcı otomatik oynatma politikası bağlamı askıya alabilir; eski
      // sürüm her çalmada yeni bir bağlam açarak bunu dolaylı olarak çözüyordu.
      if (ctx.state === "suspended") {
        void ctx.resume().catch((e) => {
          logger.error("Failed to resume ambient audio context:", e);
        });
      }

      voice = factory(ctx, () => generation === myGeneration);
      voice.masterGain.gain.value = clampVolume(volume);
    } catch (e) {
      logger.error(`Failed to play ambient sound "${soundType}":`, e);
      voice = null;
    }
  };

  return { play, setVolume, stopAllSounds };
}
