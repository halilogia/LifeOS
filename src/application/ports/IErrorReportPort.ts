/**
 * IErrorReportPort.ts
 * Application port for error reporting — abstracts the download mechanism.
 */

export interface IErrorReportPort {
  /** Get all stored log entries. */
  getLogEntries(): Promise<LogEntry[]>;
  /** Clear all stored log entries. */
  clearLogs(): Promise<void>;
  /** Export logs as Markdown string. */
  exportLogsAsMarkdown(): Promise<string>;
  /** Trigger download of logs as .md file. */
  downloadLogsMd(): Promise<void>;
}

export interface LogEntry {
  ts: string;
  level: "log" | "warn" | "error" | "debug" | "info";
  source: string;
  message: string;
}
