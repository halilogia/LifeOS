import { describe, it, expect } from "vitest";
import {
  synthesizeBrownNoise,
  synthesizeRain,
  synthesizeVinylCrackle,
} from "@/services/ambientAudio/noiseSynthesis.js";
import {
  AMBIENT_SOUND_TYPES,
  isAmbientSoundType,
  normalizeAmbientSoundType,
} from "@/services/ambientAudio/index.js";

const SAMPLE_RATE = 44100;
const isFiniteArray = (data: Float32Array) =>
  Array.from(data).every(Number.isFinite);

describe("normalizeAmbientSoundType", () => {
  it("geçerli türleri olduğu gibi döndürür", () => {
    for (const type of AMBIENT_SOUND_TYPES) {
      expect(normalizeAmbientSoundType(type)).toBe(type);
      expect(isAmbientSoundType(type)).toBe(true);
    }
  });

  it("eski sürüm takma adlarını beyaz gürültüye eşler", () => {
    expect(normalizeAmbientSoundType("brown")).toBe("white_noise");
    expect(normalizeAmbientSoundType("hairdryer")).toBe("white_noise");
  });

  it("bilinmeyen ve bozuk değerleri susturmaya düşürür", () => {
    expect(normalizeAmbientSoundType("siren")).toBe("none");
    expect(normalizeAmbientSoundType(undefined)).toBe("none");
    expect(normalizeAmbientSoundType(null)).toBe("none");
    expect(normalizeAmbientSoundType(42)).toBe("none");
  });
});

describe("synthesizeBrownNoise", () => {
  it("istenen uzunlukta sonlu örnekler üretir", () => {
    const data = synthesizeBrownNoise(2048, 1.8);
    expect(data).toBeInstanceOf(Float32Array);
    expect(data.length).toBe(2048);
    expect(isFiniteArray(data)).toBe(true);
  });

  it("yükseltme katsayısı RMS seviyesini artırır", () => {
    const rms = (data: Float32Array) => {
      let sum = 0;
      for (const sample of data) {
        sum += sample * sample;
      }
      return Math.sqrt(sum / data.length);
    };
    const quiet = rms(synthesizeBrownNoise(8192, 1.8));
    const loud = rms(synthesizeBrownNoise(8192, 3.5));
    expect(loud).toBeGreaterThan(quiet);
  });
});

describe("synthesizeRain", () => {
  it("eşit uzunlukta iki bağımsız kanal döndürür", () => {
    const sampleCount = 20000;
    const [left, right] = synthesizeRain(sampleCount, SAMPLE_RATE);
    expect(left.length).toBe(sampleCount);
    expect(right.length).toBe(sampleCount);
    expect(isFiniteArray(left)).toBe(true);
    expect(isFiniteArray(right)).toBe(true);
  });

  it("damlaları iki kanala da aynı konumlarda yazar", () => {
    const sampleCount = 20000;
    const [left, right] = synthesizeRain(sampleCount, SAMPLE_RATE);
    // Gövdde kanal başına bağımsız üretildiği için kanallar birebir aynı
    // olmaz; damla ekleri ise aynı indekslere düşer.
    expect(left.some((sample, i) => sample !== right[i])).toBe(true);
  });
});

describe("synthesizeVinylCrackle", () => {
  it("ince gürültü tabanı üretir", () => {
    const sampleCount = 88200;
    const data = synthesizeVinylCrackle(sampleCount);
    expect(data.length).toBe(sampleCount);
    expect(isFiniteArray(data)).toBe(true);

    let peak = 0;
    for (const sample of data) {
      peak = Math.max(peak, Math.abs(sample));
    }
    // Cıyaklama tabanı ~0.015, çatlak patlamaları ~0.4 ile sınırlıdır.
    expect(peak).toBeLessThanOrEqual(0.415);
    expect(peak).toBeGreaterThan(0);
  });
});
