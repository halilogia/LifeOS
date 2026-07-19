/**
 * LocalToSyncMigration
 * Infrastructure implementation for migrating data from chrome.storage.local to chrome.storage.sync.
 * Wraps the existing storage.migrateLocalToSync function.
 */

import { storage } from "../../../core/storage.js";

export class LocalToSyncMigration {
    /**
     * Migrates data from local storage to sync storage.
     * Delegates to the existing storage.migrateLocalToSync implementation.
     */
    async migrate(): Promise<void> {
        return storage.migrateLocalToSync();
    }
}