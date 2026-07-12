import { Word } from "../../types/word.js";

export const DEFAULT_ICON = "book";
export const DEFAULT_DESC = "Basic vocabulary";
export const IRREGULAR_VERB_CLASS = "IRREGULAR VERB";

export interface RawWord {
  id: string | number;
  word: string;
  freq?: number;
  level?: string;
  class?: string;
  definitions?: string[];
  examples?: string[];
  [key: string]: unknown;
}

export type LevelKey =
  "A1" | "A2" | "B1" | "B2" | "C1" | "idiom" | "phrasal" | "gre" | "irregular";

export const mergeTR = (enWords: RawWord[]): Word[] =>
  enWords as unknown as Word[];

export const enrich = (words: Word[], level: string): Word[] =>
  words.map((w) => ({ ...w, level: w.level || level }));

export const byFreqDesc = (a: Word, b: Word) => (b.freq || 0) - (a.freq || 0);

const _dataPromises = new Map<LevelKey, Promise<RawWord[]>>();
const _levelCache = new Map<LevelKey, Word[]>();
let _allWordsCache: Word[] | null = null;
let _wordTextMap: Map<string, Word> | null = null;

const _loadJSON = (level: LevelKey): Promise<RawWord[]> => {
  if (_dataPromises.has(level)) {
    return _dataPromises.get(level)!;
  }

  const promise = (async () => {
    const fileNameMap: Record<LevelKey, string> = {
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

    const fileName = fileNameMap[level];
    if (!fileName) {
      throw new Error(`Unknown level: ${level}`);
    }

    const response = await fetch(
      chrome.runtime.getURL(`data/vocabulary/${fileName}`),
    );
    return await response.json();
  })();

  _dataPromises.set(level, promise);
  return promise;
};

export const buildLevel = async (level: LevelKey): Promise<Word[]> => {
  if (_levelCache.has(level)) {
    return _levelCache.get(level)!;
  }

  const rawData = await _loadJSON(level);

  let words: Word[];
  if (level === "irregular") {
    words = mergeTR(rawData).map((w) => ({
      ...w,
      v1: w.v1 || w.word,
      class: IRREGULAR_VERB_CLASS,
      level: w.level || "irregular",
    }));
  } else {
    words = enrich(mergeTR(rawData), level);
  }

  const sorted = words.sort(byFreqDesc);
  _levelCache.set(level, sorted);
  return sorted;
};

export const buildAllWords = async (): Promise<Word[]> => {
  if (_allWordsCache) {
    return _allWordsCache;
  }

  const allLevels = await Promise.all([
    buildLevel("A1"),
    buildLevel("A2"),
    buildLevel("B1"),
    buildLevel("B2"),
    buildLevel("C1"),
    buildLevel("idiom"),
    buildLevel("phrasal"),
    buildLevel("gre"),
    buildLevel("irregular"),
  ]);

  _allWordsCache = allLevels.flat() as unknown as Word[];
  _allWordsCache = _allWordsCache.sort(byFreqDesc);
  _wordTextMap = new Map<string, Word>();
  _allWordsCache.forEach((w) => {
    _wordTextMap!.set(w.word.toLowerCase(), w);
    _wordTextMap!.set(w.id.toLowerCase(), w);
  });
  return _allWordsCache;
};

export const getWordTextMap = async (): Promise<Map<string, Word>> => {
  if (!_wordTextMap) {
    await buildAllWords();
  }
  return _wordTextMap!;
};
