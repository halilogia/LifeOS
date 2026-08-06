/**
 * ChromeStorageNoteRepository
 * Infrastructure implementation of INoteRepository using chrome.storage.local
 * directly (not wrapping legacy storage.ts).
 */

import type {
  INoteRepository,
  Note,
} from "../../../domain/repositories/INoteRepository.js";
import { SYNC_NOTES } from "@/infrastructure/storage/keys.js";

export class ChromeStorageNoteRepository implements INoteRepository {
  async getAll(): Promise<Note[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([SYNC_NOTES], (result) => {
        resolve((result[SYNC_NOTES] as Note[]) || []);
      });
    });
  }

  async saveAll(notes: Note[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_NOTES]: notes }, resolve);
    });
  }
}
