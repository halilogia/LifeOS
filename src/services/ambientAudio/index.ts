/**
 * index.ts — Ambient Audio modülünün tek giriş noktası (barrel).
 *
 * Katman sırası (aşağıdan yukarıya bağımlılık):
 *   1. ambientAudioTypes  — sözleşmeler (bağımlılığı yok)
 *   2. noiseSynthesis     — saf DSP (yalnızca 1)
 *   3. voices             — ses grafikleri (yalnızca 1, 2)
 *   4. ambientAudioEngine— yaşam döngüsü (yalnızca 1, 3)
 *
 * Çağıran taraf yalnızca bu modülü import eder; iç katmanlara doğrudan
 * erişmesi gerekmez.
 */

export {
  AMBIENT_SOUND_TYPES,
  isAmbientSoundType,
  normalizeAmbientSoundType,
} from "./ambientAudioTypes.js";
export type {
  AmbientAudioEngine,
  AmbientSoundType,
} from "./ambientAudioTypes.js";
export { createAmbientAudioEngine } from "./ambientAudioEngine.js";
