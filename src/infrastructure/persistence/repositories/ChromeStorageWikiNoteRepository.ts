/**
 * ChromeStorageWikiNoteRepository
 * Infrastructure implementation of IWikiNoteRepository using chrome.storage.local
 * for KPSS wiki notes and auto-title settings.
 */

import type { IWikiNoteRepository } from "@/domain/repositories/IWikiNoteRepository.js";
import type { KpssWikiNote } from "@/types/kpss.js";
import {
  SYNC_KPSS_WIKI_NOTES,
  SYNC_KPSS_AUTO_TITLE,
} from "@/infrastructure/storage/keys.js";

const STORAGE_KEY = SYNC_KPSS_WIKI_NOTES;
const AUTO_TITLE_SETTING_KEY = SYNC_KPSS_AUTO_TITLE;

export class ChromeStorageWikiNoteRepository implements IWikiNoteRepository {
  async getAll(): Promise<KpssWikiNote[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        resolve((res[STORAGE_KEY] as KpssWikiNote[]) || []);
      });
    });
  }

  async saveAll(notes: KpssWikiNote[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: notes }, resolve);
    });
  }

  async getAutoTitleSetting(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get([AUTO_TITLE_SETTING_KEY], (res) => {
        resolve(res[AUTO_TITLE_SETTING_KEY] === true);
      });
    });
  }

  async saveAutoTitleSetting(enabled: boolean): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [AUTO_TITLE_SETTING_KEY]: enabled }, resolve);
    });
  }
}
