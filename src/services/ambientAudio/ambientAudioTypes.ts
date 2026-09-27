/**
 * ambientAudioTypes.ts
 * Katman 1 — Sözleşmeler (contracts).
 * Ortam sesi türleri, motorun dışarıya açtığı arayüz ve eski sürüm mesajları için
 * tür normalizasyonu burada tanımlanır. Alt katmanlar bu dosyayı import eder,
 * bu dosya hiçbir alt katmanı import etmez.
 */

export type AmbientSoundType =
  | "none"
  | "rain"
  | "wind"
  | "white_noise"
  | "lofi";

export const AMBIENT_SOUND_TYPES: readonly AmbientSoundType[] = [
  "none",
  "rain",
  "wind",
  "white_noise",
  "lofi",
];

/**
 * Eski sürümlerden gelen runtime mesajlarında kullanılan takma adlar.
 * "brown" / "hairdryer" eski popup sürümlerinden gönderiliyordu; kahverengi
 * gürültü üreten ses `white_noise` kanalına karşılık gelir.
 */
const AMBIENT_SOUND_ALIASES: Readonly<Record<string, AmbientSoundType>> = {
  brown: "white_noise",
  hairdryer: "white_noise",
};

export function isAmbientSoundType(value: unknown): value is AmbientSoundType {
  return AMBIENT_SOUND_TYPES.includes(value as AmbientSoundType);
}

/**
 * Serileştirilmiş mesaj verisini güvenli bir `AmbientSoundType` değerine çevirir.
 * Bilinmeyen / bozuk / eksik değerler sesi susturmayı (`"none"`) tercih eder.
 */
export function normalizeAmbientSoundType(value: unknown): AmbientSoundType {
  if (typeof value !== "string") {
    return "none";
  }
  if (isAmbientSoundType(value)) {
    return value;
  }
  return AMBIENT_SOUND_ALIASES[value] ?? "none";
}

/**
 * Ortam sesi motorunun dışarıya açtığı tek arayüz.
 * Ses türü -> üretici eşlemesi motorunun içindedir; çağıran taraf
 * `playRain` / `playHairdryer` gibi isimleri bilmez.
 */
export interface AmbientAudioEngine {
  /** Aktif sesi değiştirir. `"none"` sesi susturur. */
  play: (soundType: AmbientSoundType, volume: number) => void;
  /** Çalışan sesin master kazancını 0..1 aralığında günceller. */
  setVolume: (volume: number) => void;
  /** Tüm kaynakları, zamanlayıcıları ve ses düğümlerini serbest bırakır. */
  stopAllSounds: () => void;
}
