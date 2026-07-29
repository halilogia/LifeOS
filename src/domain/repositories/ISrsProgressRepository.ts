/**
 * ISrsProgressRepository Interface
 * Repository pattern for KPSS SRS (Spaced Repetition) flashcard progress.
 * Domain layer — pure interface, no external dependencies.
 */

export interface ISrsProgressRepository {
  /** Load all SRS progress records. */
  getAll(): Promise<Record<string, unknown>[]>;

  /** Persist the full SRS progress array. */
  saveAll(items: Record<string, unknown>[]): Promise<void>;
}
