/**
 * vocabularyService.ts
 * SRS sözlüğünün tek giriş noktası. Tüketici yalnızca `getAllWords` kullanır
 * (bkz. `presentation/store/srsStore.ts`); sözlük derleme ve kategori
 * fonksiyonları doğrudan `vocabulary/*` alt modüllerinden import edilir.
 */

import { Word } from "@/types/word.js";
import { buildAllWords } from "./vocabulary/loader.js";

export const getAllWords = async (): Promise<Word[]> => buildAllWords();
