/**
 * ChromeStorageNoteRepository
 * Infrastructure implementation of INoteRepository using chrome.storage.sync.
 * Wraps the existing storage.getNotes/setNotes functions.
 */

import { storage } from "../../core/storage.js";
import type { INoteRepository, Note } from "../../domain/repositories/INoteRepository.js";

export class ChromeStorageNoteRepository implements INoteRepository {
    async getAll(): Promise<Note[]> {
        return storage.getNotes() as Promise<Note[]>;
    }

    async saveAll(notes: Note[]): Promise<void> {
        return storage.setNotes(notes as any);
    }
}