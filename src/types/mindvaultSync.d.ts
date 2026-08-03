/**
 * mindvaultSync.d.ts
 * Electron preload tarafından enjekte edilen senkronizasyon API'si tip bildirimi.
 * Chrome eklentisi ortamında window.mindvaultSync tanımsızdır (optional).
 */

interface MindvaultSyncResult {
  ok: boolean;
  canceled?: boolean;
  filePath?: string;
  data?: string;
}

declare global {
  interface Window {
    mindvaultSync?: {
      exportToFile: (notesJson: string) => Promise<MindvaultSyncResult>;
      importFromFile: () => Promise<MindvaultSyncResult>;
      exportToClipboard: (notesJson: string) => Promise<{ ok: boolean }>;
      importFromClipboard: () => Promise<{ ok: boolean; data?: string }>;
    };
  }
}

export {};
