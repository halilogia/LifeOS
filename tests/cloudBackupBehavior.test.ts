/**
 * cloudBackupBehavior.test.ts
 * runCloudBackup / scheduleCloudBackup davranış testleri.
 *
 * GoogleDriveApi'yi mock'lar (network yok). chrome.identity setup.ts'de sahte.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// GoogleDriveApi'yi import etmeden önce mock'la — network isteği olmasın.
// vi.hoisted: factory import'lardan ÖNCE çalışır, const'ları güvenli kılar.
const { backupToDrive } = vi.hoisted(() => ({
  backupToDrive: vi.fn(),
}));

vi.mock("@/infrastructure/api/GoogleDriveApi.js", () => ({
  GoogleDriveApi: class {
    backupToDrive = backupToDrive;
  },
}));

// cloudBackup modülü import sonrası mock edilmiş api'yi kullanır.
import {
  runCloudBackup,
  scheduleCloudBackup,
} from "@/utils/cloudBackup.js";

const get = (keys: string[]) =>
  new Promise<Record<string, unknown>>((resolve) =>
    chrome.storage.local.get(keys, resolve),
  );

async function setSyncEnabled(enabled: boolean) {
  await new Promise<void>((resolve) =>
    chrome.storage.local.set({ syncSettings: { enabled } }, resolve),
  );
}

describe("runCloudBackup", () => {
  beforeEach(async () => {
    backupToDrive.mockClear();
    await setSyncEnabled(true);
    await chrome.storage.local.set({ todos: [{ id: "1" }] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enabled=true → backup çalışır", async () => {
    await runCloudBackup();
    expect(backupToDrive).toHaveBeenCalledTimes(1);
  });

  it("enabled=false → backup çalışmaz (sessiz)", async () => {
    await setSyncEnabled(false);
    await runCloudBackup();
    expect(backupToDrive).not.toHaveBeenCalled();
  });

  it("enabled=false + force=true → backup çalışır (clearAll sonrası)", async () => {
    await setSyncEnabled(false);
    await runCloudBackup(true);
    expect(backupToDrive).toHaveBeenCalledTimes(1);
  });

  it("backup snapshot'ı transient key içermez", async () => {
    await chrome.storage.local.set({
      todos: [{ id: "1" }],
      logger_entries: ["log"],
      bistStockCache: { x: 1 },
    });
    await runCloudBackup();
    const [token, data] = backupToDrive.mock.calls[0];
    expect(token).toBe("fake-token");
    expect(data.todos).toBeDefined();
    expect(data.logger_entries).toBeUndefined();
    expect(data.bistStockCache).toBeUndefined();
  });

  it("eşzamanlı çağrılar tek backup'a birleşir (inFlight)", async () => {
    // İlk çağrıyı askıda bırak — ikinci çağrı aynı promise'i dönsün.
    let resolveFirst!: (v: unknown) => void;
    backupToDrive.mockImplementationOnce(
      () => new Promise((r) => (resolveFirst = r)),
    );
    const p1 = runCloudBackup();
    // backupToDrive henüz çağrılmadıysa inFlight dolu olana dek bekle
    await vi.waitFor(() => expect(backupToDrive).toHaveBeenCalledTimes(1));
    const p2 = runCloudBackup();
    // İkinci çağrı yeni backup başlatmamalı — inFlight'ı paylaşır.
    resolveFirst(undefined);
    await Promise.all([p1, p2]);
    expect(backupToDrive).toHaveBeenCalledTimes(1);
  });
});

describe("scheduleCloudBackup (debounce)", () => {
  beforeEach(async () => {
    backupToDrive.mockClear();
    await setSyncEnabled(true);
    // Fake timer'lar otomatik ilerlesin — async zincirler (getSyncSettings →
    // backup) gerçek microtask'lerle tamamlansın.
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("5sn içinde birden çok çağrı → tek backup", async () => {
    scheduleCloudBackup();
    scheduleCloudBackup();
    scheduleCloudBackup();
    vi.advanceTimersByTime(4_000);
    expect(backupToDrive).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1_100);
    await vi.waitFor(() => expect(backupToDrive).toHaveBeenCalledTimes(1));
  });

  it("ilk çağrıdan sonra yeni çağrı debounce'u uzatır", async () => {
    scheduleCloudBackup();
    vi.advanceTimersByTime(4_000);
    scheduleCloudBackup(); // 4sn'de geldi → timer reset
    vi.advanceTimersByTime(2_000);
    expect(backupToDrive).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3_100);
    await vi.waitFor(() => expect(backupToDrive).toHaveBeenCalledTimes(1));
  });
});
