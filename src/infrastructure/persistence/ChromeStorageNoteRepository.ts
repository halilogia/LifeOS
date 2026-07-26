/**
 * ChromeStorageNoteRepository
 * Infrastructure implementation of INoteRepository using chrome.storage.sync
 * directly (not wrapping legacy storage.ts).
 */

import type {
  INoteRepository,
  Note,
} from "../../domain/repositories/INoteRepository.js";

export class ChromeStorageNoteRepository implements INoteRepository {
  async getAll(): Promise<Note[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["notes"], (result) => {
        resolve((result.notes as Note[]) || []);
      });
    });
  }

  async saveAll(notes: Note[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ notes }, resolve);
    });
  }
}
