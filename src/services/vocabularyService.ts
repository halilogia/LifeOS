import { Word, WordCategory } from "@/types/word.js";
import { buildLevel, buildAllWords } from "./vocabulary/loader.js";
import {
  getCoreVocabulary,
  getFullVocabulary,
  loadCategoryWords,
  getIdiomsVocabulary,
  getPhrasalVocabulary,
  getIrregularVocabulary,
  getGreVocabulary,
} from "./vocabulary/categories.js";
import { getPersonalVocabulary } from "./vocabulary/personal.js";

export {
  getCoreVocabulary,
  getFullVocabulary,
  loadCategoryWords,
  getIdiomsVocabulary,
  getPhrasalVocabulary,
  getIrregularVocabulary,
  getGreVocabulary,
  getPersonalVocabulary,
};

export const loadVocabularyMetadataAsync = async (): Promise<WordCategory[]> =>
  getFullVocabulary(true);

export const loadVocabularyAsync = async (): Promise<WordCategory[]> =>
  getFullVocabulary();

export const getAllWords = async (): Promise<Word[]> => buildAllWords();

export const getIdioms = async (): Promise<Word[]> => buildLevel("idiom");

export const getPhrasals = async (): Promise<Word[]> => buildLevel("phrasal");

export const getIrregularVerbs = async (): Promise<Word[]> =>
  buildLevel("irregular");
