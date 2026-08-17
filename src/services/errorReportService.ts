/**
 * errorReportService.ts
 * Hata raporlama servisi: port üzerinden logları okur, .md'ye çevirir, indirir, temizler.
 * Chrome API'leri infrastructure adapter'da gizli — servis sadece port kullanır.
 */

import {
  IErrorReportPort,
  LogEntry,
} from "@/application/ports/IErrorReportPort.js";
import { ChromeErrorReportAdapter } from "@/infrastructure/adapters/ChromeErrorReportAdapter.js";

const defaultPort = new ChromeErrorReportAdapter();
let port: IErrorReportPort = defaultPort;

/** Storage'daki tüm log kayıtlarını okur (en eskiden yeniye). */
export async function getLogEntries(): Promise<LogEntry[]> {
  return port.getLogEntries();
}

/** Tüm log kayıtlarını temizler. */
export async function clearLogs(): Promise<void> {
  return port.clearLogs();
}

/** Log kayıtlarını .md formatına çevirir. */
export async function exportLogsAsMarkdown(): Promise<string> {
  return port.exportLogsAsMarkdown();
}

/** Logları life-os-logs-YYYY-MM-DD.md olarak indirir. */
export async function downloadLogsMd(): Promise<void> {
  return port.downloadLogsMd();
}

/** Test için port override (optional). */
export function __setErrorReportPort(p: IErrorReportPort): void {
  port = p;
}
