/**
 * logger.ts
 * Centralized Logger interface for the application.
 * Default implementation delegates to console.* (preserves current behavior).
 * All repositories/services/hooks/components MUST use this interface instead of
 * directly calling console.* — keeps logging behavior controllable, testable,
 * and ready for replacement (e.g., Sentry, file logger) without touching every call site.
 */

export type LogLevel = "log" | "warn" | "error" | "debug" | "info";

export interface ILogger {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

/**
 * Default console-backed implementation.
 * Provides a single point of control for prefixing, silencing, or redirecting logs.
 */
export class ConsoleLogger implements ILogger {
  log(...args: unknown[]): void {
    console.log(...args);
  }
  warn(...args: unknown[]): void {
    console.warn(...args);
  }
  error(...args: unknown[]): void {
    console.error(...args);
  }
  debug(...args: unknown[]): void {
    console.debug(...args);
  }
  info(...args: unknown[]): void {
    console.info(...args);
  }
}

/** Default singleton instance — use directly throughout the app. */
export const logger: ILogger = new ConsoleLogger();
