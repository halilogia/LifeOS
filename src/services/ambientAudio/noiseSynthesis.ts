/**
 * noiseSynthesis.ts
 * Katman 2 — Saf gürültü sentezi (DSP).
 * Yalnızca örnek dizileri (Float32Array) üretir; `AudioContext`, düğüm kurulumu
 * veya yaşam döngüsü bu katmanda yoktur. Bu sayede tarayıcı bağımsız
 * (node) test edilebilir ve ses grafiklerinden bağımsız olarak değiştirilebilir.
 */

/** Yağmur damlalarının kanallara karıştırma katsayısı (genel seviye ayarı). */
const RAINDROP_MIX = 0.7;

/** [-1, 1] aralığında tek beyaz gürültü örneği üretir. */
function whiteSample(): number {
  return Math.random() * 2 - 1;
}

/**
 * Kümülatif ortalama (Paul Kellet) tabanlı kahverengi gürültü.
 * Rüzgâr ve fön seslerinin düşük uçlu gövdesi budur.
 */
export function synthesizeBrownNoise(
  sampleCount: number,
  amplification = 1.8,
): Float32Array<ArrayBuffer> {
  const data = new Float32Array(sampleCount);
  let lastOut = 0;
  for (let i = 0; i < sampleCount; i++) {
    lastOut = (lastOut + 0.02 * whiteSample()) / 1.02;
    data[i] = lastOut * amplification;
  }
  return data;
}

/**
 * Yedi bantlı (Paul Kellet) pembe gürültü — yağmurun sürekli arka planı.
 * Her iki kanal bağımsız üretilir; `mid` kanalı kaydırma yerine kullanılır.
 */
function synthesizePinkChannel(sampleCount: number): Float32Array<ArrayBuffer> {
  const data = new Float32Array(sampleCount);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;

  for (let i = 0; i < sampleCount; i++) {
    const white = whiteSample();
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
    b6 = white * 0.115926;
  }
  return data;
}

/**
 * Sıcak akustik çarpıntı: orta frekanslı bir damla darbesinin üstel sönümü.
 */
function addRaindrop(
  channel: Float32Array<ArrayBuffer>,
  startIndex: number,
  sampleRate: number,
): void {
  const decaySamples = Math.floor(Math.random() * 300 + 120);
  const frequency = Math.random() * 500 + 350;
  const amplitude = Math.random() * 0.08 + 0.02;

  for (let s = 0; s < decaySamples; s++) {
    const index = startIndex + s;
    if (index >= channel.length) {
      break;
    }
    const t = s / sampleRate;
    const envelope = Math.exp(-s / (decaySamples / 4.0));
    channel[index] +=
      Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope * RAINDROP_MIX;
  }
}

/**
 * Asfalt üzerinde sürekli yağmur: pembe gürültü gövdesi + rastgele damla
 * çarpıntıları. Kanal başına bağımsız pembe gürültü kullanılır ve damlalar
 * iki kanala da eşit karıştırılır (geniş, doğal bir sağ-sol imajı).
 */
export function synthesizeRain(
  sampleCount: number,
  sampleRate: number,
): readonly [Float32Array<ArrayBuffer>, Float32Array<ArrayBuffer>] {
  const left = synthesizePinkChannel(sampleCount);
  const right = synthesizePinkChannel(sampleCount);

  const dropCount = Math.floor(sampleCount / 350);
  for (let d = 0; d < dropCount; d++) {
    const startIndex = Math.floor(Math.random() * (sampleCount - 1000));
    // Damla her iki kanala aynı örneklerle yazıldığı için `left` tamponundaki
    // göreli konum ikinci kanal için de geçerlidir (tamponlar eşit uzunlukta).
    addRaindrop(left, startIndex, sampleRate);
    addRaindrop(right, startIndex, sampleRate);
  }

  return [left, right];
}

/**
 * Lo-Fi plak yüzeyi: ince vinyl cıyaklaması + nadir çatlak patlamaları.
 */
export function synthesizeVinylCrackle(sampleCount: number): Float32Array<ArrayBuffer> {
  const data = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    const hiss = whiteSample() * 0.015;
    const crackle = Math.random() > 0.9995 ? whiteSample() * 0.4 : 0;
    data[i] = hiss + crackle;
  }
  return data;
}

/** Bir veya daha fazla kanal dizisini bağlama bağlı bir `AudioBuffer` yaratır. */
export function toAudioBuffer(
  ctx: BaseAudioContext,
  channels: readonly Float32Array<ArrayBuffer>[],
): AudioBuffer {
  const buffer = ctx.createBuffer(
    channels.length,
    channels[0].length,
    ctx.sampleRate,
  );
  channels.forEach((channel, index) => {
    buffer.copyToChannel(channel, index);
  });
  return buffer;
}
