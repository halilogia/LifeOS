/**
 * SyncToLocalMigration
 * Infrastructure implementation for migrating data from chrome.storage.local to chrome.storage.local.
 *
 * Life OS is local-first: ALL data lives in chrome.storage.local (10MB quota, never silently
 * drops writes). Cloud sync is opt-in via Google Drive backup (manual or scheduled).
 * This migration runs once at app init: copies any legacy sync data into local,
 * then clears the sync area so the 100KB quota can never silently eat writes again.
 */

import { logger } from "@/utils/logger.js";

export class SyncToLocalMigration {
  /**
   * Migrates data from sync storage to local storage (one-time).
   * Copies known keys from chrome.storage.local → chrome.storage.local,
   * then clears chrome.storage.local entirely.
   */
  async migrate(): Promise<void> {
    const syncData = await this.getSyncAll();
    const keys = Object.keys(syncData);
    if (keys.length === 0) {
      await this.clearSync();
      return;
    }
    // Local, sync'te OLAN tüm key'leri alır — bilinmeyen/ekstra key'ler de
    // taşınır ki clear() hiçbir veri kaybettirmesin.
    await this.setLocal(syncData);
    logger.log(
      `SyncToLocalMigration: ${keys.length} keys copied to local storage.`,
    );
    // Sync alanını tamamen temizle — boş sync, 100KB kota asla dolamaz.
    await this.clearSync();
  }

  private getSyncAll(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve((result as Record<string, unknown>) || {});
      });
    });
  }

  private setLocal(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => resolve());
    });
  }

  private clearSync(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
  }
}
