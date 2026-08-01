/**
 * errorReportService.ts
 * Hata raporlama servisi: birikmiş logları okur, .md'ye çevirir,
 * chrome.downloads ile indirir, temizler.
 * Loglar yalnızca cihazda (chrome.storage.local) tutulur — dışarı gönderilmez.
 */
import type { LogEntry } from "@/utils/logger.js";

const STORAGE_KEY = "logger_entries";

/** Storage'daki tüm log kayıtlarını okur (en eskiden yeniye). */
export async function getLogEntries(): Promise<LogEntry[]> {
  try {
    const res = await chrome.storage.local.get([STORAGE_KEY]);
    const entries = res?.[STORAGE_KEY];
    return Array.isArray(entries) ? (entries as LogEntry[]) : [];
  } catch {
    return [];
  }
}

/** Tüm log kayıtlarını temizler. */
export async function clearLogs(): Promise<void> {
  try {
    await chrome.storage.local.remove([STORAGE_KEY]);
  } catch {
    // sessiz — temizlik başarısız olursa kullanıcıya alert gösterilir
  }
}

/** Log kayıtlarını .md formatına çevirir. */
export async function exportLogsAsMarkdown(): Promise<string> {
  const entries = await getLogEntries();
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

  // Seviyeye göre özet
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

/** Logları life-os-logs-YYYY-MM-DD.md olarak indirir. */
export async function downloadLogsMd(): Promise<void> {
  const md = await exportLogsAsMarkdown();
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
    // Kısa gecikme: indirme başladıktan sonra URL'i temizle
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
