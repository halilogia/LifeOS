/**
 * GoogleDriveApi
 * Infrastructure implementation of Google Drive backup/restore operations.
 * Directly uses Google Drive API v3 with appDataFolder.
 * Implements the IDriveBackupPort interface.
 */

import type { IDriveBackupPort } from "@/application/ports/IDriveBackupPort.js";

export class GoogleDriveApi implements IDriveBackupPort {
  async backupToDrive(
    token: string,
    backupData: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const fileName = "zentodo_lifeos_backup.json";

      // 1. Search if backup file already exists
      const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}'&fields=files(id)`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!searchRes.ok) {
        throw new Error(`Backup search failed: ${searchRes.statusText}`);
      }
      const searchResult = await searchRes.json();
      const existingFile = searchResult.files?.[0];

      let fileId = existingFile?.id;

      if (!fileId) {
        // 2a. Create metadata-only file if it doesn't exist
        const createUrl = "https://www.googleapis.com/drive/v3/files";
        const createRes = await fetch(createUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
            parents: ["appDataFolder"],
          }),
        });
        if (!createRes.ok) {
          throw new Error(
            `Failed to initialize backup file on Drive: ${createRes.statusText}`,
          );
        }
        const createdFile = await createRes.json();
        fileId = createdFile.id;
      }

      // 3. Upload content using upload endpoint
      const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const uploadRes = await fetch(uploadUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      });

      if (!uploadRes.ok) {
        throw new Error(
          `Failed to upload backup contents: ${uploadRes.statusText}`,
        );
      }

      return true;
    } catch (error) {
      console.error("Backup to Google Drive failed:", error);
      throw error;
    }
  }

  async restoreFromDrive(
    token: string,
  ): Promise<Record<string, unknown> | null> {
    try {
      const fileName = "zentodo_lifeos_backup.json";

      // 1. Search for backup file
      const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}'&fields=files(id)`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!searchRes.ok) {
        throw new Error(`Backup search failed: ${searchRes.statusText}`);
      }
      const searchResult = await searchRes.json();
      const existingFile = searchResult.files?.[0];

      if (!existingFile) {
        return null;
      }

      // 2. Download content
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
      const downloadRes = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!downloadRes.ok) {
        throw new Error(`Failed to download backup: ${downloadRes.statusText}`);
      }

      const backupData = await downloadRes.json();
      return backupData;
    } catch (error) {
      console.error("Restore from Google Drive failed:", error);
      throw error;
    }
  }
}
