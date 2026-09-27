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

const port: IErrorReportPort = new ChromeErrorReportAdapter();

/** Storage'daki tüm log kayıtlarını okur (en eskiden yeniye). */
export async function getLogEntries(): Promise<LogEntry[]> {
  return port.getLogEntries();
}

/** Tüm log kayıtlarını temizler. */
export async function clearLogs(): Promise<void> {
  return port.clearLogs();
}

/** Logları life-os-logs-YYYY-MM-DD.md olarak indirir. */
export async function downloadLogsMd(): Promise<void> {
  return port.downloadLogsMd();
}
