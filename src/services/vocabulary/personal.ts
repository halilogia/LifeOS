import { Word, WordCategory } from "../../types/word.js";
import { byFreqDesc, getWordTextMap } from "./loader.js";

export const getPersonalVocabulary = async (
  srsWords: { wordId: string }[],
): Promise<WordCategory[]> => {
  const personalIds = new Set(srsWords.map((sw) => sw.wordId.toLowerCase()));
  const wordTextMap = await getWordTextMap();

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
