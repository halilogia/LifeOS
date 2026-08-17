/**
 * cloudDataInspector.ts
 * Hem chrome.storage.sync hem Google Drive yedek durumunu gösterir.
 * Sync: küçük ayarlar (~100KB limit, otomatik)
 * Drive: tam veri snapshot (manuel backup/restore)
 */

import { logger } from "@/utils/logger.js";

export interface SyncKeySummary {
  key: string;
  type: "array" | "object" | "string" | "number" | "boolean" | "unknown";
  size: number;
  preview: string;
}

export interface DriveBackupInfo {
  fileName: string;
  size: number;
  modifiedTime: string;
}

function summarizeValue(value: unknown): {
  type: SyncKeySummary["type"];
  size: number;
  preview: string;
} {
  let type: SyncKeySummary["type"] = "unknown";
  let size = 0;
  let preview = "";

  try {
    const json = JSON.stringify(value);
    size = new Blob([json]).size;
    preview = json.slice(0, 120);

    if (Array.isArray(value)) {
      type = "array";
      preview = `[${value.length} item] ${preview}`;
    } else if (value !== null && typeof value === "object") {
      type = "object";
      const keys = Object.keys(value);
      preview = `{${keys.length} key} ${preview}`;
    } else if (typeof value === "string") {
      type = "string";
      preview = `"${value.slice(0, 80)}"`;
    } else if (typeof value === "number") {
      type = "number";
      preview = String(value);
    } else if (typeof value === "boolean") {
      type = "boolean";
      preview = value ? "true" : "false";
    }
  } catch {
    size = 0;
    preview = "[okunamadı]";
  }

  return { type, size, preview };
}

export async function getSyncDataSummary(): Promise<SyncKeySummary[]> {
  try {
    const items = await new Promise<Record<string, unknown>>((resolve) => {
      chrome.storage.sync.get(null, (res) =>
        resolve(res as Record<string, unknown>),
      );
    });

    const summaries: SyncKeySummary[] = [];
    for (const [key, value] of Object.entries(items)) {
      const { type, size, preview } = summarizeValue(value);
      summaries.push({ key, type, size, preview });
    }

    summaries.sort((a, b) => b.size - a.size);
    logger.info(`[CloudDataInspector] sync keys: ${summaries.length}`);
    return summaries;
  } catch (err) {
    logger.error("[CloudDataInspector] sync read failed:", err);
    return [];
  }
}

export async function getDriveBackupInfo(): Promise<DriveBackupInfo[]> {
  try {
    const token = await getDriveToken(false);
    return await queryDriveBackups(token);
  } catch (err) {
    const is403 = err instanceof Error && err.message.includes("Drive API 403");
    if (is403) {
      logger.warn(
        "[CloudDataInspector] Drive 403 — trying interactive token refresh",
      );
      try {
        const refreshed = await getDriveToken(true);
        return await queryDriveBackups(refreshed);
      } catch (retryErr) {
        logger.error("[CloudDataInspector] Drive retry failed:", retryErr);
        return [];
      }
    }
    logger.error("[CloudDataInspector] Drive read failed:", err);
    return [];
  }
}

async function getDriveToken(interactive: boolean): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (result) => {
      if (chrome.runtime.lastError || !result) {
        reject(new Error(chrome.runtime.lastError?.message || "No token"));
      } else {
        resolve(result as string);
      }
    });
  });
}

async function queryDriveBackups(token: string): Promise<DriveBackupInfo[]> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%20contains%20'lifeos_backup'%20and%20trashed%3Dfalse&fields=files(id%2Cname%2Csize%2CmodifiedTime)&orderBy=modifiedTime%20desc",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Drive API ${response.status}`);
  }

  const data = await response.json();
  const files = (data.files || []) as Array<{
    id: string;
    name: string;
    size: string;
    modifiedTime: string;
  }>;

  return files.map((f) => ({
    fileName: f.name,
    size: Number(f.size || 0),
    modifiedTime: f.modifiedTime,
  }));
}
