/**
 * ISrsProgressRepository Interface
 * Repository pattern for KPSS SRS (Spaced Repetition) flashcard progress + AI cards.
 * Domain layer — pure interface, no external dependencies.
 */

import type { KpssFlashcard } from "@/services/kpss/kpssService.js";

export interface ISrsProgressRepository {
  /** Load all SRS progress records. */
  getAll(): Promise<Record<string, unknown>[]>;

  /** Persist the full SRS progress array. */
  saveAll(items: Record<string, unknown>[]): Promise<void>;

  /** Load AI-generated KPSS flashcards. */
  getAiCards(): Promise<KpssFlashcard[]>;

  /** Save AI-generated KPSS flashcards. */
  saveAiCards(cards: KpssFlashcard[]): Promise<void>;
}
