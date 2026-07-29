import { logger } from "@/utils/logger.js";

/**
 * ambientAudioService.ts
 * WebAudio API prosedürel ses üreticisi ve sentezleyici servisi.
 * Yağmur, Rüzgar, Fön / Kahverengi Gürültü ve LoFi akort sentezleme mantığı.
 */

export type AmbientSoundType =
  "none" | "rain" | "wind" | "white_noise" | "lofi";

export interface AmbientAudioEngine {
  stopAllSounds: () => void;
  playHairdryer: (volume: number) => void;
  playRain: (volume: number) => void;
  playWind: (volume: number) => void;
  playLofi: (volume: number) => void;
  setVolume: (volume: number) => void;
}

export function createAmbientAudioEngine(): AmbientAudioEngine {
  let audioRef: HTMLAudioElement | null = null;
  let audioContextRef: AudioContext | null = null;
  let whiteNoiseSourceRef: AudioBufferSourceNode | null = null;
  let whiteNoiseGainRef: GainNode | null = null;

  const stopAllSounds = () => {
    if (audioRef) {
      audioRef.pause();
      audioRef = null;
    }
    if (whiteNoiseSourceRef) {
      try {
        whiteNoiseSourceRef.stop();
      } catch {
        // ignore error if already stopped
      }
      whiteNoiseSourceRef = null;
    }
    whiteNoiseGainRef = null;
    if (audioContextRef && audioContextRef.state !== "closed") {
      audioContextRef.close();
      audioContextRef = null;
    }
    if ((window as any).lofiTimer) {
      clearInterval((window as any).lofiTimer);
      (window as any).lofiTimer = null;
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef) {
      audioRef.volume = volume;
    }
    if (whiteNoiseGainRef) {
      whiteNoiseGainRef.gain.value = volume;
    }
  };

  const playHairdryer = (volume: number) => {
    stopAllSounds();
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const brownNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = brownNoiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
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
      whiteNoiseGainRef = gainNode;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      motorOsc.connect(motorGain);
      motorGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      motorOsc.start();
      whiteNoiseSourceRef = noiseSource;
    } catch (e) {
      logger.error("Failed to play hairdryer:", e);
    }
  };

  const playRain = (volume: number) => {
    stopAllSounds();
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef = ctx;

      const bufferSize = 4 * ctx.sampleRate;
      const rainBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const left = rainBuffer.getChannelData(0);
      const right = rainBuffer.getChannelData(1);

      // 1. Continuous pink/brown background rain shower on asphalt
      let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;

        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.04;
        b6L = whiteL * 0.115926;

        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.04;
        b6R = whiteR * 0.115926;
      }

      // 2. Crisp asphalt raindrop patters (warm acoustic impact transients)
      const numDrops = Math.floor(bufferSize / 350);
      for (let d = 0; d < numDrops; d++) {
        const dropStart = Math.floor(Math.random() * (bufferSize - 1000));
        const dropFreq = Math.random() * 500 + 350; // Warm asphalt droplet frequency
        const dropAmp = Math.random() * 0.08 + 0.02;
        const decaySamples = Math.floor(Math.random() * 300 + 120);

        for (let s = 0; s < decaySamples; s++) {
          const idx = dropStart + s;
          if (idx >= bufferSize) {break;}
          const t = s / ctx.sampleRate;
          const env = Math.exp(-s / (decaySamples / 4.0));
          const dropSample = Math.sin(2 * Math.PI * dropFreq * t) * dropAmp * env;

          left[idx] += dropSample * 0.7;
          right[idx] += dropSample * 0.7;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = rainBuffer;
      noiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1100;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 140;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.95;
      whiteNoiseGainRef = gainNode;

      noiseSource.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      whiteNoiseSourceRef = noiseSource;
    } catch (e) {
      logger.error("Failed to play rain:", e);
    }
  };

  const playWind = (volume: number) => {
    stopAllSounds();
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef = ctx;

      const bufferSize = 4 * ctx.sampleRate;
      const brownBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = brownBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 1.8;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = brownBuffer;
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

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.6;
      whiteNoiseGainRef = gainNode;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      noiseSource.connect(bandpass);
      bandpass.connect(lowcut);
      lowcut.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start();
      noiseSource.start();
      whiteNoiseSourceRef = noiseSource;
    } catch (e) {
      logger.error("Failed to play wind:", e);
    }
  };

  const playLofi = (volume: number) => {
    stopAllSounds();
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const hiss = (Math.random() * 2 - 1) * 0.015;
        const crackle =
          Math.random() > 0.9995 ? (Math.random() * 2 - 1) * 0.4 : 0;
        output[i] = hiss + crackle;
      }

      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = noiseBuffer;
      crackleSource.loop = true;

      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = "bandpass";
      crackleFilter.frequency.value = 1000;
      crackleFilter.Q.value = 0.5;

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      whiteNoiseGainRef = masterGain;

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(masterGain);
      crackleSource.start();
      whiteNoiseSourceRef = crackleSource;

      const chords = [
        [130.81, 164.81, 196.0, 246.94], // Cmaj7
        [110.0, 130.81, 164.81, 196.0], // Am7
        [87.31, 110.0, 130.81, 164.81], // Fmaj7
        [98.0, 123.47, 146.83, 174.61], // G7
      ];

      let chordIdx = 0;

      const playNextChord = () => {
        if (!audioContextRef || audioContextRef.state === "closed") {
          return;
        }
        const now = ctx.currentTime;
        const chordNotes = chords[chordIdx];
        chordIdx = (chordIdx + 1) % chords.length;

        chordNotes.forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.value = freq;

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 500;

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 4);
        });
      };

      playNextChord();
      const timer = setInterval(playNextChord, 4000);
      (window as any).lofiTimer = timer;

      masterGain.connect(ctx.destination);
    } catch (e) {
      logger.error("Failed to play lofi:", e);
    }
  };

  return {
    stopAllSounds,
    playHairdryer,
    playRain,
    playWind,
    playLofi,
    setVolume,
  };
}
