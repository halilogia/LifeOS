/**
 * build.js
 * MindVault Desktop build script:
 *   1. Kök dist/ (eklenti Vite build çıktısı) → desktop/web/ kopyalanır
 *   2. electron-builder ile portable exe üretilir
 * Kullanım: npm run desktop  (kök package.json'dan)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const EXT_DIST = path.join(ROOT, "dist");
const WEB_DIR = path.join(__dirname, "web");

// 1. dist/ → web/
if (fs.existsSync(WEB_DIR)) {
  fs.rmSync(WEB_DIR, { recursive: true, force: true });
}
fs.mkdirSync(WEB_DIR, { recursive: true });
fs.cpSync(EXT_DIST, WEB_DIR, { recursive: true });
console.log(`[build] dist/ kopyalandı → desktop/web/ (${fs.readdirSync(WEB_DIR).length} öğe)`);

// İkon kopyala (electron-builder windows ikonu)
const iconSrc = path.join(ROOT, "mindvault_app_icon.png");
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(__dirname, "icon.png"));
  console.log("[build] ikon kopyalandı");
}

// 2. electron-builder
console.log("[build] electron-builder başlatılıyor...");
try {
  execSync("npx electron-builder --win portable", {
    cwd: __dirname,
    stdio: "inherit",
  });
  console.log("[build] Tamamlandı → desktop/dist/MindVault.exe");
} catch (err) {
  console.error("[build] HATA:", err.message);
  process.exit(1);
}
