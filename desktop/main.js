/**
 * main.js
 * MindVault Desktop — Electron ana süreci.
 * Eklentinin dist/ çıktısını newtab.html?view=kpss-notes olarak yükler.
 */

const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

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
      contextIsolation: true,
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
