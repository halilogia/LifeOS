/**
 * contentLogger.ts
 * Lightweight logger for content scripts. Writes to console AND persists a
 * ring buffer (500 entries) to chrome.storage.local under "content_logs".
 *
 * Unlike src/utils/logger.ts, this file is NOT imported by background/newtab,
 * so esbuild keeps it inside the content entry chunk — no IIFE name collision.
 */

const STORAGE_KEY = "content_logs";
/**
 * 500 → 150: yalnızca warn/error saklandığı için küçük bir tampon yeterli.
 * (logger_entries tamponuyla birlikte storage.local'ı iki kez şişirmesin.)
 */
const MAX_ENTRIES = 150;

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

/**
 * Rutin bilgi mesajı — yalnızca console'a yazılır, kalıcı tampona kaydedilmez.
 * (Bu seviyedeki mesajlar hacimli ve teşhis değeri düşük.)
 */
export function contentLog(...args: unknown[]): void {
  console.log(...args);
}

export function contentWarn(...args: unknown[]): void {
  console.warn(...args);
  persist("warn", args);
}

export function contentError(...args: unknown[]): void {
  console.error(...args);
  persist("error", args);
}
