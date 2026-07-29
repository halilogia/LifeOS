/**
 * ChromeStorageWikiNoteRepository
 * Infrastructure implementation of IWikiNoteRepository using chrome.storage.sync
 * for KPSS wiki notes and auto-title settings.
 */

import type { IWikiNoteRepository } from "@/domain/repositories/IWikiNoteRepository.js";
import type { KpssWikiNote } from "@/types/kpss.js";

const STORAGE_KEY = "kpss_wiki_notes";
const AUTO_TITLE_SETTING_KEY = "kpss_auto_title_enabled";

export class ChromeStorageWikiNoteRepository implements IWikiNoteRepository {
  async getAll(): Promise<KpssWikiNote[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (res) => {
        resolve((res[STORAGE_KEY] as KpssWikiNote[]) || []);
      });
    });
  }

  async saveAll(notes: KpssWikiNote[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: notes }, resolve);
    });
  }

  async getAutoTitleSetting(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([AUTO_TITLE_SETTING_KEY], (res) => {
        resolve(res[AUTO_TITLE_SETTING_KEY] === true);
      });
    });
  }

  async saveAutoTitleSetting(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [AUTO_TITLE_SETTING_KEY]: enabled }, resolve);
    });
  }
}
