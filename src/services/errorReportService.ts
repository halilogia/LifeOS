/**
 * errorReportService.ts
 * Hata raporlama servisi: port üzerinden logları okur, .md'ye çevirir, indirir, temizler.
 * Chrome API'leri infrastructure adapter'da gizli — servis sadece port kullanır.
 */

import { IErrorReportPort, LogEntry } from "@/application/ports/IErrorReportPort.js";

let port: IErrorReportPort | null = null;

function getPort(): IErrorReportPort {
  if (!port) {
    // Lazy init to avoid circular deps at module load time
    const { ChromeErrorReportAdapter } = require("@/infrastructure/adapters/ChromeErrorReportAdapter.js");
    port = new ChromeErrorReportAdapter();
  }
  return port!;
}

/** Storage'daki tüm log kayıtlarını okur (en eskiden yeniye). */
export async function getLogEntries(): Promise<LogEntry[]> {
  return getPort().getLogEntries();
}

/** Tüm log kayıtlarını temizler. */
export async function clearLogs(): Promise<void> {
  return getPort().clearLogs();
}

/** Log kayıtlarını .md formatına çevirir. */
export async function exportLogsAsMarkdown(): Promise<string> {
  return getPort().exportLogsAsMarkdown();
}

/** Logları life-os-logs-YYYY-MM-DD.md olarak indirir. */
export async function downloadLogsMd(): Promise<void> {
  return getPort().downloadLogsMd();
}

/** Test için port override (optional). */
export function __setErrorReportPort(p: IErrorReportPort): void {
  port = p;
}