/**
 * voices.ts
 * Katman 3 — Ses grafikleri (voice builders).
 * Her üretici, verilen `AudioContext` üzerine kendi düğüm zincirini kurar ve
 * kapatma (teardown) için ihtiyaç duyduğu kaynakları `VoiceHandle` içinde
 * toplar. Ses türü -> üretici eşlemesi de bu katmanda yaşar; motor katmanı
 * yalnızca bu kaydı bilir.
 *
 * Katman sınırı: sesin *timbresi* ve sabit *trim* kazancı üreticinin, *kullanıcı
 * ses seviyesi* ise motorun (`masterGain`) sorumluluğundadır. Böylece seviye tek
 * bir yerden yönetilir ve hiçbir üretici "kaç desibel" kararını gizlemez.
 *
 * Üreticiler `AudioContext` yaşam döngüsünü bilmez; kapatma `stopAllSounds`
 * sorumluluğundadır. Bu ayrım, eski sürümde bir akor zamanlayıcısının yanlış
 * bağlama ses göndermesine yol açan hatanın kaynağını ortadan kaldırır.
 */

import type { AmbientSoundType } from "./ambientAudioTypes.js";
import {
  synthesizeBrownNoise,
  synthesizeRain,
  synthesizeVinylCrackle,
  toAudioBuffer,
} from "./noiseSynthesis.js";

/** Üreticinin kapatılırken serbest bırakması gereken kaynakları toplar. */
export interface VoiceHandle {
  /** Motorun kullanıcı ses seviyesini uyguladığı master kazanç. */
  masterGain: GainNode;
  /** Kapatıldığında durdurulması gereken zamanlanmış kaynak düğümleri. */
  sources: AudioScheduledSourceNode[];
  /** Kapatıldığında temizlenmesi gereken aralık zamanlayıcıları. */
  timers: ReturnType<typeof setInterval>[];
}

/**
 * @param ctx       Ses düğümlerinin kurulacağı bağlam
 * @param isActive Ses hâlâ aktif mi? Zamanlayıcı geri çağrıları, susturulmuş bir
 *                 sesin yeniden akıtmasını engellemek için bunu kullanır.
 */
export type VoiceFactory = (ctx: AudioContext, isActive: () => boolean) => VoiceHandle;

const BROWN_NOISE_AMPLIFICATION = 3.5;
const BROWN_NOISE_SECONDS = 2;
const RAIN_SECONDS = 4;
const WIND_SECONDS = 4;
const LOFI_CRACKLE_SECONDS = 2;
const WIND_BROWN_NOISE_AMPLIFICATION = 1.8;

/**
 * Sesi çıkışa bağlayan son aşama: `trimGain` (üretici sabiti) -> `masterGain`
 * (motor kontrolünde) -> destination. masterGain 1 ile başlar; motor `play()`
 * çağrısında gerçek seviyeyi uygular.
 */
function createOutputStage(
  ctx: AudioContext,
  trim: number,
): { trimGain: GainNode; masterGain: GainNode } {
  const trimGain = ctx.createGain();
  trimGain.gain.value = trim;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 1;

  trimGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  return { trimGain, masterGain };
}

/**
 * Kahverengi gürültü + alçak geçiren filtre + 90 Hz motor osilatörü.
 * Arayüzde "beyaz gürültü" adıyla sunulur; kablo adı eski sürümden kalma.
 */
const createBrownNoiseVoice: VoiceFactory = (ctx) => {
  const buffer = toAudioBuffer(ctx, [
    synthesizeBrownNoise(
      BROWN_NOISE_SECONDS * ctx.sampleRate,
      BROWN_NOISE_AMPLIFICATION,
    ),
  ]);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 350;

  const motor = ctx.createOscillator();
  motor.type = "sine";
  motor.frequency.value = 90;

  const motorGain = ctx.createGain();
  motorGain.gain.value = 0.15;

  const { trimGain, masterGain } = createOutputStage(ctx, 1);

  noiseSource.connect(lowpass);
  lowpass.connect(trimGain);
  motor.connect(motorGain);
  motorGain.connect(trimGain);

  noiseSource.start();
  motor.start();

  return { masterGain, sources: [noiseSource, motor], timers: [] };
};

/** Pembe gürültü gövdesi + asfalt damla çarpıntıları, bant sınırlı. */
const createRainVoice: VoiceFactory = (ctx) => {
  const sampleCount = RAIN_SECONDS * ctx.sampleRate;
  const buffer = toAudioBuffer(
    ctx,
    synthesizeRain(sampleCount, ctx.sampleRate),
  );

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 1100;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 140;

  const { trimGain, masterGain } = createOutputStage(ctx, 0.95);

  noiseSource.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(trimGain);

  noiseSource.start();

  return { masterGain, sources: [noiseSource], timers: [] };
};

/** Kahverengi gürültü, yavaş LFO ile süpürülen bant geçiren filtre. */
const createWindVoice: VoiceFactory = (ctx) => {
  const buffer = toAudioBuffer(ctx, [
    synthesizeBrownNoise(
      WIND_SECONDS * ctx.sampleRate,
      WIND_BROWN_NOISE_AMPLIFICATION,
    ),
  ]);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 1.8;
  bandpass.frequency.value = 300;

  const lowcut = ctx.createBiquadFilter();
  lowcut.type = "highpass";
  lowcut.frequency.value = 80;

  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.06;

  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 180;

  const { trimGain, masterGain } = createOutputStage(ctx, 0.6);

  lfo.connect(lfoDepth);
  lfoDepth.connect(bandpass.frequency);
  noiseSource.connect(bandpass);
  bandpass.connect(lowcut);
  lowcut.connect(trimGain);

  lfo.start();
  noiseSource.start();

  return { masterGain, sources: [noiseSource, lfo], timers: [] };
};

/** Lo-fi akor döngüsü: Cmaj7 → Am7 → Fmaj7 → G7, her biri 4 saniyede bir. */
const LOFI_CHORDS: readonly (readonly number[])[] = [
  [130.81, 164.81, 196.0, 246.94],
  [110.0, 130.81, 164.81, 196.0],
  [87.31, 110.0, 130.81, 164.81],
  [98.0, 123.47, 146.83, 174.61],
];
const LOFI_CHORD_INTERVAL_MS = 4000;
const LOFI_CHORD_ATTACK_S = 1.2;
const LOFI_CHORD_RELEASE_S = 3.8;
const LOFI_CHORD_LENGTH_S = 4;
const LOFI_CHORD_PEAK_GAIN = 0.12;

const createLofiVoice: VoiceFactory = (ctx, isActive) => {
  const buffer = toAudioBuffer(ctx, [
    synthesizeVinylCrackle(LOFI_CRACKLE_SECONDS * ctx.sampleRate),
  ]);

  const crackleSource = ctx.createBufferSource();
  crackleSource.buffer = buffer;
  crackleSource.loop = true;

  const crackleFilter = ctx.createBiquadFilter();
  crackleFilter.type = "bandpass";
  crackleFilter.frequency.value = 1000;
  crackleFilter.Q.value = 0.5;

  const { trimGain, masterGain } = createOutputStage(ctx, 1);

  crackleSource.connect(crackleFilter);
  crackleFilter.connect(trimGain);
  crackleSource.start();

  const sources: AudioScheduledSourceNode[] = [crackleSource];
  let chordIndex = 0;
  let liveChord: AudioScheduledSourceNode[] = [];

  const playNextChord = () => {
    // Ses susturulduysa yeni akor üretme; motor bir sonraki sesin üzerine
    // yazmasını engellemek için bu sesin zamanlayıcısını geçersiz kılar.
    if (!isActive()) {
      return;
    }
    const now = ctx.currentTime;
    const chord = LOFI_CHORDS[chordIndex];
    chordIndex = (chordIndex + 1) % LOFI_CHORDS.length;

    // Önceki akor bu noktada zaten sönümlenmiş olmalı (zarf +3.8s'de biter,
    // osilatör +4s'de durur). Yine de düğüm referanslarının sonsuza kadar
    // birikmemesi için önceki grubu serbest bırakıyoruz.
    for (const osc of liveChord) {
      osc.disconnect();
    }
    liveChord = [];

    for (const frequency of chord) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = frequency;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 500;

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(
        LOFI_CHORD_PEAK_GAIN,
        now + LOFI_CHORD_ATTACK_S,
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        now + LOFI_CHORD_RELEASE_S,
      );

      osc.connect(lowpass);
      lowpass.connect(envelope);
      envelope.connect(trimGain);

      osc.start(now);
      osc.stop(now + LOFI_CHORD_LENGTH_S);
      liveChord.push(osc);
    }

    sources.push(...liveChord);
    // Yalnızca hâlâ ses üreten son akor grubu teardown listesinde tutulur.
    sources.splice(1, sources.length - 1 - liveChord.length);
  };

  playNextChord();
  const timer = setInterval(playNextChord, LOFI_CHORD_INTERVAL_MS);

  return { masterGain, sources, timers: [timer] };
};

/** Ses türü -> üretici kaydı. `"none"` bir üreticiye karşılık gelmez. */
export const VOICE_FACTORIES: Readonly<
  Record<Exclude<AmbientSoundType, "none">, VoiceFactory>
> = {
  rain: createRainVoice,
  wind: createWindVoice,
  white_noise: createBrownNoiseVoice,
  lofi: createLofiVoice,
};
