import { Word, WordCategory } from "../types/word.js";
const DEFAULT_ICON = "book";
const DEFAULT_DESC = "Basic vocabulary";
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
const mergeTR = (enWords: RawWord[]): Word[] => enWords as unknown as Word[];
const enrich = (words: Word[], level: string): Word[] =>
  words.map((w) => ({ ...w, level: w.level || level }));

const byFreqDesc = (a: Word, b: Word) => (b.freq || 0) - (a.freq || 0);
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
const _dataPromises = new Map<LevelKey, Promise<RawWord[]>>();

const _loadJSON = (level: LevelKey): Promise<RawWord[]> => {
  if (_dataPromises.has(level)) {
    return _dataPromises.get(level)!;
  }

  const promise = (async () => {
    switch (level) {
      case "A1":
        return (await import("../data/vocabulary/a1.json"))
          .default as RawWord[];
      case "A2":
        return (await import("../data/vocabulary/a2.json"))
          .default as RawWord[];
      case "B1":
        return (await import("../data/vocabulary/b1.json"))
          .default as RawWord[];
      case "B2":
        return (await import("../data/vocabulary/b2.json"))
          .default as RawWord[];
      case "C1":
        return (await import("../data/vocabulary/c1.json"))
          .default as RawWord[];
      case "gre":
        return (await import("../data/vocabulary/gre.json"))
          .default as RawWord[];
      case "idiom":
        return (await import("../data/vocabulary/idioms.json"))
          .default as RawWord[];
      case "phrasal":
        return (await import("../data/vocabulary/phrasal.json"))
          .default as RawWord[];
      case "irregular":
        return (await import("../data/vocabulary/irregular.json"))
          .default as RawWord[];
      default:
        throw new Error(`Unknown level: ${level}`);
    }
  })();

  _dataPromises.set(level, promise);
  return promise;
};
const _levelCache = new Map<LevelKey, Word[]>();
const _buildLevel = async (level: LevelKey): Promise<Word[]> => {
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
let _allWordsCache: Word[] | null = null;
let _wordTextMap: Map<string, Word> | null = null;

const _buildAllWords = async (): Promise<Word[]> => {
  if (_allWordsCache) {
    return _allWordsCache;
  }

  const allLevels = await Promise.all([
    _buildLevel("A1"),
    _buildLevel("A2"),
    _buildLevel("B1"),
    _buildLevel("B2"),
    _buildLevel("C1"),
    _buildLevel("idiom"),
    _buildLevel("phrasal"),
    _buildLevel("gre"),
    _buildLevel("irregular"),
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
let CACHED_FULL: WordCategory[] | null = null;

const _makeCategory = async (
  id: string,
  name: string,
  color: string,
  level: LevelKey,
  icon = DEFAULT_ICON,
  description = DEFAULT_DESC,
  lazy = false,
): Promise<WordCategory> => ({
  id,
  name,
  icon,
  description,
  color,
  words: lazy ? [] : await _buildLevel(level),
});

export const getCoreVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> =>
  Promise.all([
    _makeCategory(
      "a1",
      "A1 Beginner",
      "blue",
      "A1",
      DEFAULT_ICON,
      DEFAULT_DESC,
      lazy,
    ),
    _makeCategory(
      "a2",
      "A2 Elementary",
      "green",
      "A2",
      DEFAULT_ICON,
      DEFAULT_DESC,
      lazy,
    ),
    _makeCategory(
      "b1",
      "B1 Intermediate",
      "yellow",
      "B1",
      DEFAULT_ICON,
      DEFAULT_DESC,
      lazy,
    ),
    _makeCategory(
      "b2",
      "B2 Upper-Intermediate",
      "orange",
      "B2",
      DEFAULT_ICON,
      DEFAULT_DESC,
      lazy,
    ),
    _makeCategory(
      "c1",
      "C1 Advanced",
      "red",
      "C1",
      DEFAULT_ICON,
      DEFAULT_DESC,
      lazy,
    ),
  ]);

export const getFullVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => {
  if (CACHED_FULL && !lazy) {
    return CACHED_FULL;
  }

  const data = [
    ...(await getCoreVocabulary(lazy)),
    ...(await getIdiomsVocabulary(lazy)),
    ...(await getPhrasalVocabulary(lazy)),
    ...(await getGreVocabulary(lazy)),
    ...(await getIrregularVocabulary(lazy)),
  ];

  if (!lazy) {
    CACHED_FULL = data;
  }
  return data;
};

export const loadVocabularyMetadataAsync = async (): Promise<WordCategory[]> =>
  getFullVocabulary(true);

export const loadCategoryWords = async (
  categoryId: string,
): Promise<Word[]> => {
  const levelMap: Record<string, LevelKey> = {
    a1: "A1",
    a2: "A2",
    b1: "B1",
    b2: "B2",
    c1: "C1",
    idioms: "idiom",
    phrasal: "phrasal",
    gre: "gre",
    irregular: "irregular",
  };
  const level = levelMap[categoryId];
  if (!level) {
    return [];
  }
  return _buildLevel(level);
};

export const loadVocabularyAsync = async (): Promise<WordCategory[]> =>
  getFullVocabulary();
export const getAllWords = async (): Promise<Word[]> => _buildAllWords();

export const getIdiomsVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await _makeCategory(
    "idioms",
    "Idioms",
    "cyan",
    "idiom",
    "book",
    "English Idioms",
    lazy,
  ),
];

export const getPhrasalVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await _makeCategory(
    "phrasal",
    "Phrasal Verbs",
    "indigo",
    "phrasal",
    "zap",
    "English Phrasal Verbs",
    lazy,
  ),
];

export const getIrregularVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await _makeCategory(
    "irregular",
    "Irregular Verbs",
    "rose",
    "irregular",
    "list",
    "English Irregular Verbs",
    lazy,
  ),
];

export const getGreVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await _makeCategory(
    "gre",
    "GRE Advanced",
    "purple",
    "gre",
    "brain",
    "Advanced academic vocabulary for GRE/TOEFL",
    lazy,
  ),
];
export const getIdioms = async (): Promise<Word[]> => _buildLevel("idiom");
export const getPhrasals = async (): Promise<Word[]> => _buildLevel("phrasal");
export const getIrregularVerbs = async (): Promise<Word[]> =>
  _buildLevel("irregular");

export const getPersonalVocabulary = async (
  srsWords: { wordId: string }[],
): Promise<WordCategory[]> => {
  const personalIds = new Set(srsWords.map((sw) => sw.wordId.toLowerCase()));
  if (!_wordTextMap) {
    await _buildAllWords();
  }
  const wordTextMap = _wordTextMap!;

  const personalWords: Word[] = [];

  personalIds.forEach((id) => {
    const existing = wordTextMap.get(id);
    if (existing) {
      personalWords.push({ ...existing, id: id });
    } else {
      personalWords.push({
        id: id,
        word: id,
        level: "custom",
        definitions: [],
        examples: [],
        synonyms: [],
        derivatives: [],
      });
    }
  });

  return [
    {
      id: "personal",
      name: "Personal Library",
      icon: "library",
      description: "Words you have saved and are learning",
      color: "rose",
      words: personalWords.sort(byFreqDesc),
    },
  ];
};
