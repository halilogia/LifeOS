/**
 * main.js
 * MindVault Desktop — Electron ana süreci.
 * Eklentinin dist/ çıktısını newtab.html?view=kpss-notes olarak yükler.
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

// ---------- Senkronizasyon: JSON yedek dosyası ile eklenti verisi taşıma ----------
// Renderer (preload) veriyi gönderir, ana süreç dosya seçici + okuma/yazma yapar.
// Eklenti tarafında: chrome.storage.sync "kpssWikiNotes" → JSON dosya (export)
// Bu exe tarafında: JSON dosya → localStorage (import)

function registerSyncIpc(getNotes, setNotes) {
  // Dışa aktar: renderer notları gönderir → kaydet-dialog → dosyaya yazar
  ipcMain.handle("mindvault:export", async (_evt, notesJson) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { ok: false, error: "no-window" };
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "MindVault Notlarını Dışa Aktar",
      defaultPath: path.join(app.getPath("documents"), "mindvault-notes-backup.json"),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };
    fs.writeFileSync(filePath, notesJson, "utf8");
    return { ok: true, filePath };
  });

  // İçe aktar: aç-dialog → dosyayı oku → JSON renderer'a döner
  ipcMain.handle("mindvault:import", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { ok: false, error: "no-window" };
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: "MindVault Notlarını İçe Aktar",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (canceled || filePaths.length === 0) return { ok: false, canceled: true };
    const content = fs.readFileSync(filePaths[0], "utf8");
    return { ok: true, data: content, filePath: filePaths[0] };
  });

  // Panoya dışa aktar (basit senkron: kopyala-yapıştır)
  ipcMain.handle("mindvault:export-clipboard", async (_evt, notesJson) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { ok: false };
    const { clipboard } = require("electron");
    clipboard.writeText(notesJson);
    return { ok: true };
  });

  // Panodan içe aktar
  ipcMain.handle("mindvault:import-clipboard", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return { ok: false };
    const { clipboard } = require("electron");
    return { ok: true, data: clipboard.readText() };
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 940,
    minHeight: 600,
    title: "MindVault — KPSS Not Stüdyosu",
    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Menü çubuğunu kaldır (temiz stüdyo görünümü) — geliştirmede F12 DevTools açık
  Menu.setApplicationMenu(null);

  // Eklenti dist/ klasörünü yükle — view=kpss-notes parametresi App.tsx'te tam ekran not stüdyosunu açar
  const webDir = path.join(__dirname, "web");
  win.loadFile(path.join(webDir, "newtab.html"), {
    query: { view: "kpss-notes" },
  });

  return win;
}

app.whenReady().then(() => {
  registerSyncIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
