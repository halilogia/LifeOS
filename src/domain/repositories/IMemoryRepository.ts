/**
 * IMemoryRepository Interface
 * Repository pattern for AI User Memory (aiUserMemory) persistence.
 * Domain layer — pure interface.
 */

export interface IMemoryRepository {
  /** Load the current AI user memory markdown string (or empty). */
  getMemory(): Promise<string>;

  /** Overwrite the entire AI user memory. */
  setMemory(memory: string): Promise<void>;
}
