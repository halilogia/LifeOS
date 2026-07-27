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
      console.error("Failed to play hairdryer:", e);
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
      const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = rainBuffer.getChannelData(0);

      // 1. Background soft brown noise (rain hum)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.18;
      }

      // 2. Individual transient raindrop patters
      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() > 0.9996) {
          const clickAmp = Math.random() * 0.15 + 0.05;
          const decayLen = Math.floor(Math.random() * 400 + 150);
          for (let j = 0; j < decayLen && i + j < bufferSize; j++) {
            const t = j / ctx.sampleRate;
            const freq = Math.random() * 1400 + 1800;
            const envelope = Math.exp(-j / (decayLen / 4.5));
            output[i + j] +=
              Math.sin(2 * Math.PI * freq * t) * clickAmp * envelope;
          }
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = rainBuffer;
      noiseSource.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1600;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 120;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.8;
      whiteNoiseGainRef = gainNode;

      noiseSource.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      whiteNoiseSourceRef = noiseSource;
    } catch (e) {
      console.error("Failed to play rain:", e);
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
      console.error("Failed to play wind:", e);
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
      console.error("Failed to play lofi:", e);
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
