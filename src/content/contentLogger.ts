/**
 * contentLogger.ts
 * Lightweight logger for content scripts. Writes to console AND persists a
 * ring buffer (500 entries) to chrome.storage.local under "content_logs".
 *
 * Unlike src/utils/logger.ts, this file is NOT imported by background/newtab,
 * so esbuild keeps it inside the content entry chunk — no IIFE name collision.
 */

const STORAGE_KEY = "content_logs";
const MAX_ENTRIES = 500;

function persist(level: string, args: unknown[]): void {
  try {
    const line = `${new Date().toISOString()} [${level}] ${args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ")}`;
    void chrome.storage.local.get(STORAGE_KEY).then((res) => {
      const entries = (res[STORAGE_KEY] as string[] | undefined) ?? [];
      entries.push(line);
      void chrome.storage.local.set({
        [STORAGE_KEY]: entries.slice(-MAX_ENTRIES),
      });
    });
  } catch {
    /* storage errors must never break logging */
  }
}

export function contentLog(...args: unknown[]): void {
  console.log(...args);
  persist("log", args);
}

export function contentWarn(...args: unknown[]): void {
  console.warn(...args);
  persist("warn", args);
}

export function contentError(...args: unknown[]): void {
  console.error(...args);
  persist("error", args);
}
