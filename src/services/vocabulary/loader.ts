/**
 * loader.ts
 * SRS sözlüğü veri yükleme ve derleme katmanı.
 *
 * Modül tek bir dışa açılan fonksiyon sunar: `buildAllWords()`. Seviye
 * (A1..C1) ve kategori (idiom / phrasal / gre / irregular) ayrımı yalnızca
 * dosya adı çözümlemesi ve sıralama için içeride yaşar; dışarıda ayrı bir
 * kategori API'si yoktur (bkz. `vocabularyService.ts`).
 */

import { Word } from "@/types/word.js";

const IRREGULAR_VERB_CLASS = "IRREGULAR VERB";

interface RawWord {
  id: string | number;
  word: string;
  freq?: number;
  level?: string;
  class?: string;
  definitions?: string[];
  examples?: string[];
  [key: string]: unknown;
}

type LevelKey =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "idiom"
  | "phrasal"
  | "gre"
  | "irregular";

const FILE_NAMES: Record<LevelKey, string> = {
  A1: "a1.json",
  A2: "a2.json",
  B1: "b1.json",
  B2: "b2.json",
  C1: "c1.json",
  gre: "gre.json",
  idiom: "idioms.json",
  phrasal: "phrasal.json",
  irregular: "irregular.json",
};

const ALL_LEVELS: readonly LevelKey[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "idiom",
  "phrasal",
  "gre",
  "irregular",
];

const byFreqDesc = (a: Word, b: Word) => (b.freq || 0) - (a.freq || 0);

const dataPromises = new Map<LevelKey, Promise<RawWord[]>>();
const levelCache = new Map<LevelKey, Word[]>();
let allWordsCache: Word[] | null = null;

const loadJSON = (level: LevelKey): Promise<RawWord[]> => {
  const cached = dataPromises.get(level);
  if (cached) {
    return cached;
  }

  const fileName = FILE_NAMES[level];
  const promise = fetch(chrome.runtime.getURL(`data/vocabulary/${fileName}`)).then(
    (response) => response.json() as Promise<RawWord[]>,
  );

  dataPromises.set(level, promise);
  return promise;
};

const buildLevel = async (level: LevelKey): Promise<Word[]> => {
  const cached = levelCache.get(level);
  if (cached) {
    return cached;
  }

  const raw = (await loadJSON(level)) as unknown as Word[];

  const words =
    level === "irregular"
      ? raw.map((w) => ({
          ...w,
          v1: w.v1 || w.word,
          class: IRREGULAR_VERB_CLASS,
          level: w.level || "irregular",
        }))
      : raw.map((w) => ({ ...w, level: w.level || level }));

  const sorted = words.sort(byFreqDesc);
  levelCache.set(level, sorted);
  return sorted;
};

/**
 * Tüm seviye ve kategorileri birleştirip frekansa göre sıralanmış tek dizi
 * döndürür. Sonuç bellekte önbelleklenir.
 */
export const buildAllWords = async (): Promise<Word[]> => {
  if (allWordsCache) {
    return allWordsCache;
  }

  const perLevel = await Promise.all(ALL_LEVELS.map(buildLevel));
  allWordsCache = (perLevel.flat() as unknown as Word[]).sort(byFreqDesc);
  return allWordsCache;
};
