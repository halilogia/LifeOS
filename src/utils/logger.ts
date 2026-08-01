/**
 * logger.ts
 * Centralized Logger interface for the application.
 * Default implementation delegates to console.* (preserves current behavior).
 * All repositories/services/hooks/components MUST use this interface instead of
 * directly calling console.* — keeps logging behavior controllable, testable,
 * and ready for replacement (e.g., Sentry, file logger) without touching every call site.
 */

export type LogLevel = "log" | "warn" | "error" | "debug" | "info";

export interface LogEntry {
  ts: string;
  level: LogLevel;
  source: string;
  message: string;
}

export interface ILogger {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

/** Ring buffer boyutu — storage.local taşmasın diye sınırlı tutulur. */
const MAX_ENTRIES = 500;
const STORAGE_KEY = "logger_entries";

/**
 * Args dizisini serializable string'e çevirir.
 * Error nesneleri → { name, message, stack } dönüşümü yapılır (JSON.stringify
 * Error'ı boş nesneye çevirir, o yüzden elle açılır).
 */
function serializeArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return JSON.stringify({
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        });
      }
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
}

/** current execution context adını tahmin et (call stack'ten). */
function detectSource(): string {
  try {
    const stack = new Error().stack || "";
    const lines = stack.split("\n");
    // 0: Error, 1: detectSource, 2: logToFile, 3: gerçek çağıran
    const caller = lines[3] || "";
    const match = caller.match(/at\s+(.+?)\s+\(/);
    if (match) {
      return match[1].split(".").pop() || "unknown";
    }
    const match2 = caller.match(/at\s+([^\s(]+)/);
    if (match2) {
      return match2[1].split(".").pop() || "unknown";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Log kaydını chrome.storage.local'a biriktirir (ring buffer).
 * chrome.runtime yoksa (test ortamı) sessizce atlanır.
 */
function persistToStorage(entry: LogEntry): void {
  try {
    if (typeof chrome === "undefined" || !chrome.runtime?.id) {
      return;
    }
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      const existing: LogEntry[] = Array.isArray(res?.[STORAGE_KEY])
        ? (res[STORAGE_KEY] as LogEntry[])
        : [];
      const next = [...existing, entry];
      // Ring buffer: en eskileri at
      if (next.length > MAX_ENTRIES) {
        next.splice(0, next.length - MAX_ENTRIES);
      }
      chrome.storage.local.set({ [STORAGE_KEY]: next }).catch?.(() => {});
    });
  } catch {
    // Storage hataları loglamayı asla kırmasın
  }
}

/**
 * Console-backed implementation with file logging.
 * Tüm loglar console'a yazılır (mevcut davranış korunur) VE
 * chrome.storage.local'a biriktirilir (Hata Raporlama > Logları İndir).
 */
export class ConsoleLogger implements ILogger {
  private write(level: LogLevel, args: unknown[]): void {
    // Console her zaman
    switch (level) {
      case "log":
        console.log(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.info(...args);
        break;
    }

    // Storage'a biriktir
    const source = detectSource();
    persistToStorage({
      ts: new Date().toISOString(),
      level,
      source,
      message: serializeArgs(args),
    });
  }

  log(...args: unknown[]): void {
    this.write("log", args);
  }
  warn(...args: unknown[]): void {
    this.write("warn", args);
  }
  error(...args: unknown[]): void {
    this.write("error", args);
  }
  debug(...args: unknown[]): void {
    this.write("debug", args);
  }
  info(...args: unknown[]): void {
    this.write("info", args);
  }
}

/** Default singleton instance — use directly throughout the app. */
export const logger: ILogger = new ConsoleLogger();
