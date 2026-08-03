/**
 * kpssSrsService.ts
 * Service for loading SRS queues and saving review qualities for KPSS flashcards.
 * Supports preset cards, user notes cards, or combined cards.
 */

import {
  calculateSM2,
  prepareSRSQueue,
  createInitialSRSWord,
  type SRSWordWithInfo,
  type ReviewQuality,
  type WordReviewData,
} from "@/domain/services/SrsService.js";
import { kpssDummyFlashcards } from "@/domain/constants/kpssFlashcards.js";
import { KpssFlashcard } from "@/services/kpss/kpssService.js";
import {
  getKpssWikiNotes,
  getSubjectLabel,
  type KpssWikiNote,
} from "@/services/kpss/kpssWikiService.js";
import type { ISrsProgressRepository } from "@/domain/repositories/ISrsProgressRepository.js";

export function extractCardsFromUserNotes(notes: KpssWikiNote[]): KpssFlashcard[] {
  const cards: KpssFlashcard[] = [];
  notes.forEach((note) => {
    if (!note.content) {
      return;
    }
    const lines = note.content.split("\n");
    let foundLineCard = false;
    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      if (
        !trimmed ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("http") ||
        trimmed.startsWith("![")
      ) {
        return;
      }
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        const key = trimmed
          .slice(0, colonIdx)
          .replace(/^[-*_`\s]+/, "")
          .trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (key && val && key.length < 35 && val.length <= 90 && !val.includes(". ")) {
          cards.push({
            id: `note-card-${note.id}-${idx}`,
            question: key,
            answer: val,
            category: getSubjectLabel(note.subject),
            hint: note.title ? `Ders Notu: ${note.title}` : "",
          });
          foundLineCard = true;
        }
      }
    });

    if (!foundLineCard && note.title) {
      const cleanContent = note.content
        .replace(/^#+\s*.*/gm, "")
        .trim();
      if (cleanContent) {
        cards.push({
          id: `note-card-${note.id}-summary`,
          question: `Ders Notu: ${note.title}`,
          answer: cleanContent.slice(0, 160) + (cleanContent.length > 160 ? "..." : ""),
          category: getSubjectLabel(note.subject),
          hint: note.title ? `Ders Notu: ${note.title}` : "",
        });
      }
    }
  });

  return cards;
}

export function createKpssSrsService(srsRepo: ISrsProgressRepository) {
  return {
    /** Extracts flashcards from user's custom notes. */
    async getUserNotesFlashcards(): Promise<KpssFlashcard[]> {
      const notes = await getKpssWikiNotes();
      return extractCardsFromUserNotes(notes);
    },

    /** Loads enriched SRS flashcard queue and universe based on source mode. */
    async loadSrsQueue(
      sourceMode: "all" | "preset" | "notes" = "all",
    ): Promise<{ queue: WordReviewData[]; universe: KpssFlashcard[] }> {
      const progress: Record<string, unknown>[] = await srsRepo.getAll();
      const userNotes = await getKpssWikiNotes();
      const userNoteCards = extractCardsFromUserNotes(userNotes);

      let activeUniverseCards: KpssFlashcard[] = [];
      if (sourceMode === "preset") {
        activeUniverseCards = kpssDummyFlashcards;
      } else if (sourceMode === "notes") {
        activeUniverseCards = userNoteCards;
      } else {
        activeUniverseCards = [...kpssDummyFlashcards, ...userNoteCards];
      }

      const progressMap = new Map<string, WordReviewData>();
      progress.forEach((p) =>
        progressMap.set(p.wordId as string, p as unknown as WordReviewData),
      );

      const srsUniverse: SRSWordWithInfo[] = activeUniverseCards.map((w) => {
        const p =
          progressMap.get(w.id) || createInitialSRSWord(w.id, "vocabulary");
        return { ...p, level: w.category, listType: "kpss", freq: 0 };
      });

      const enrichedProgress: SRSWordWithInfo[] = progress
        .filter((p) => activeUniverseCards.some((c) => c.id === p.wordId))
        .map((p) => {
          const wInfo = activeUniverseCards.find((w) => w.id === p.wordId);
          return {
            ...p,
            level: wInfo?.category || "KPSS",
            listType: "kpss",
            freq: 0,
          } as unknown as SRSWordWithInfo;
        });

      const queue = prepareSRSQueue(enrichedProgress, {
        dailyGoal: 15,
        isCustomMode: true,
        filters: { listType: "kpss", levels: [] },
        universe: srsUniverse,
      });

      return { queue, universe: activeUniverseCards };
    },

    /** Processes review quality rating with SM-2 algorithm and persists. */
    async saveSrsReview(
      reviewData: WordReviewData,
      quality: ReviewQuality,
    ): Promise<void> {
      const outcome = calculateSM2(reviewData, quality, new Date());

      const progress = await srsRepo.getAll();
      const idx = progress.findIndex((p) => p.wordId === outcome.wordId);
      if (idx >= 0) {
        progress[idx] = outcome as unknown as Record<string, unknown>;
      } else {
        progress.push(outcome as unknown as Record<string, unknown>);
      }

      await srsRepo.saveAll(progress);
    },
  };
}

export type KpssSrsService = ReturnType<typeof createKpssSrsService>;

/* ------------------------------------------------------------------ */
/* Singleton with default repository                                   */
/* ------------------------------------------------------------------ */

import { ChromeStorageSrsProgressRepository } from "@/infrastructure/persistence/repositories/ChromeStorageSrsProgressRepository.js";

const _defaultSrsRepo = new ChromeStorageSrsProgressRepository();
const _defaultSrsService = createKpssSrsService(_defaultSrsRepo);

export const kpssSrsService = _defaultSrsService;

