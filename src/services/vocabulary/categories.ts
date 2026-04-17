import { Word, WordCategory } from "../../types/word.js";
import {
  DEFAULT_ICON,
  DEFAULT_DESC,
  LevelKey,
  buildLevel,
} from "./loader.js";

let CACHED_FULL: WordCategory[] | null = null;

export const makeCategory = async (
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
  words: lazy ? [] : await buildLevel(level),
});

export const getCoreVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> =>
  Promise.all([
    makeCategory("a1", "A1 Beginner", "blue", "A1", DEFAULT_ICON, DEFAULT_DESC, lazy),
    makeCategory("a2", "A2 Elementary", "green", "A2", DEFAULT_ICON, DEFAULT_DESC, lazy),
    makeCategory("b1", "B1 Intermediate", "yellow", "B1", DEFAULT_ICON, DEFAULT_DESC, lazy),
    makeCategory("b2", "B2 Upper-Intermediate", "orange", "B2", DEFAULT_ICON, DEFAULT_DESC, lazy),
    makeCategory("c1", "C1 Advanced", "red", "C1", DEFAULT_ICON, DEFAULT_DESC, lazy),
  ]);

export const getIdiomsVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await makeCategory("idioms", "Idioms", "cyan", "idiom", "book", "English Idioms", lazy),
];

export const getPhrasalVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await makeCategory("phrasal", "Phrasal Verbs", "indigo", "phrasal", "zap", "English Phrasal Verbs", lazy),
];

export const getIrregularVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await makeCategory("irregular", "Irregular Verbs", "rose", "irregular", "list", "English Irregular Verbs", lazy),
];

export const getGreVocabulary = async (
  lazy = false,
): Promise<WordCategory[]> => [
  await makeCategory("gre", "GRE Advanced", "purple", "gre", "brain", "Advanced academic vocabulary for GRE/TOEFL", lazy),
];

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
  return buildLevel(level);
};
