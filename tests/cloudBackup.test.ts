/**
 * cloudBackup.test.ts
 * Kalıcı koruma: tüm kullanıcı verisi yazıcıları otomatik Drive backup tetiklemeli.
 *
 * Bu test sınıfı geçmişteki bug'ı (günlük notu → backup tetikleyicisi yok)
 * yakalardı. Her user-data mutation noktasında scheduleCloudBackup() var
 * mı diye statik kontrol yapar — chrome runtime gerektirmez.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..", "src");

/** Kullanıcı verisi yazan ve scheduleCloudBackup TETİKLEYEN dosyalar — her biri import etmeli. */
const USER_DATA_WRITERS: string[] = [
  // Stores (direct mutations)
  "presentation/store/settingsStore.ts",
  "presentation/store/aiUserMemoryStore.ts",
  "presentation/store/kpssChartMetricStore.ts",
  "presentation/store/kpssChartSettingsStore.ts",
  "presentation/store/kpssWikiSidebarStore.ts",
  // Services (now delegate to repositories)
  "services/kpss/kpssSrsService.ts",
  "services/kpss/kpssWikiService.ts",
  // Infrastructure (Repositories - these are the ones calling scheduleCloudBackup)
  "infrastructure/persistence/repositories/ChromeStorageStockRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageKpssRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageSrsProgressRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageMemoryRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageWikiNoteRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageNoteRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageTodoRepository.ts",
  "infrastructure/persistence/repositories/ChromeStorageQuestionBankRepository.ts",
  // Sidepanel
  "sidepanel/useSidePanelChat.ts",
  // Content
  "content/quiz/quizPanel.ts",
];

describe("cloud backup trigger coverage", () => {
  for (const rel of USER_DATA_WRITERS) {
    const full = path.join(SRC, rel);
    it(`scheduleCloudBackup tetikleyici: ${rel}`, () => {
      const content = fs.readFileSync(full, "utf-8");
      expect(
        content.includes("scheduleCloudBackup"),
        `${rel} — kullanıcı verisi yazıyor ama backup tetiklemiyor!`,
      ).toBe(true);
    });
  }
});

describe("stripTransientKeys", () => {
  it("cache key'leri backup'tan ayıklar", async () => {
    const mod = await import("@/utils/cloudBackup.js");
    const cleaned = mod.stripTransientKeys({
      todos: [{ id: "1" }],
      notes: ["note"],
      bistStockCache: { x: 1 },
      logger_entries: ["log"],
      kapNewsCache: {},
      free_games_cache: [],
      epic_history_cache: [],
      prayer_calendar_2026_01: [],
    });
    expect(cleaned.todos).toBeDefined();
    expect(cleaned.notes).toBeDefined();
    expect(cleaned.bistStockCache).toBeUndefined();
    expect(cleaned.logger_entries).toBeUndefined();
    expect(cleaned.kapNewsCache).toBeUndefined();
    expect(cleaned.free_games_cache).toBeUndefined();
    expect(cleaned.epic_history_cache).toBeUndefined();
    expect(cleaned.prayer_calendar_2026_01).toBeUndefined();
  });

  it("tüm key'ler transient ise boş obje döner", async () => {
    const mod = await import("@/utils/cloudBackup.js");
    const cleaned = mod.stripTransientKeys({
      logger_entries: ["a"],
      bistStockCache: {},
    });
    expect(Object.keys(cleaned)).toHaveLength(0);
  });
});
