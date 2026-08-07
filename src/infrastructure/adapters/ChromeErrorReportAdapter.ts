/**
 * ChromeErrorReportAdapter.ts
 * Infrastructure adapter implementing IErrorReportPort using chrome.* APIs.
 */

import { IErrorReportPort, LogEntry } from "@/application/ports/IErrorReportPort.js";

const STORAGE_KEY = "logger_entries";

export class ChromeErrorReportAdapter implements IErrorReportPort {
  async getLogEntries(): Promise<LogEntry[]> {
    try {
      const res = await chrome.storage.local.get([STORAGE_KEY]);
      const entries = res?.[STORAGE_KEY];
      return Array.isArray(entries) ? (entries as LogEntry[]) : [];
    } catch {
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await chrome.storage.local.remove([STORAGE_KEY]);
    } catch {
      // silent — cleanup failure handled by caller
    }
  }

  async exportLogsAsMarkdown(): Promise<string> {
    const entries = await this.getLogEntries();
    const manifest = chrome.runtime.getManifest();
    const now = new Date();

    const lines: string[] = [];
    lines.push("# Life OS Hata Raporu");
    lines.push("");
    lines.push(`- **Üretim tarihi:** ${now.toISOString()}`);
    lines.push(`- **Extension:** ${manifest.name} v${manifest.version}`);
    lines.push(`- **Log kaydı sayısı:** ${entries.length}`);
    lines.push("");

    if (entries.length === 0) {
      lines.push(
        "> Log kaydı bulunamadı. Henüz hata oluşmamış veya loglar temizlenmiş.",
      );
      lines.push("");
      return lines.join("\n");
    }

    // Summary by level
    const counts: Record<string, number> = {};
    for (const e of entries) {
      counts[e.level] = (counts[e.level] || 0) + 1;
    }
    lines.push("## Özet");
    lines.push("");
    for (const [level, count] of Object.entries(counts)) {
      lines.push(`- **${level}:** ${count}`);
    }
    lines.push("");

    lines.push(`## Loglar (${entries.length})`);
    lines.push("");

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      lines.push(`### ${i + 1}. ${e.ts} [${e.level}] ${e.source}`);
      lines.push("");
      lines.push("```");
      lines.push(e.message);
      lines.push("```");
      lines.push("");
    }

    return lines.join("\n");
  }

  async downloadLogsMd(): Promise<void> {
    const md = await this.exportLogsAsMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `life-os-logs-${dateStr}.md`;

    try {
      await chrome.downloads.download({
        url,
        filename,
        saveAs: true,
      });
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  }
}