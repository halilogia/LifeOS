/**
 * IWikiNoteRepository Interface
 * Repository pattern for KPSS Wiki Notes persistence.
 * Domain layer — pure interface, no external dependencies.
 */

import type { KpssWikiNote } from "@/types/kpss.js";

export interface IWikiNoteRepository {
  getAll(): Promise<KpssWikiNote[]>;
  saveAll(notes: KpssWikiNote[]): Promise<void>;
  getAutoTitleSetting(): Promise<boolean>;
  saveAutoTitleSetting(enabled: boolean): Promise<void>;
}
