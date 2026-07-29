#!/usr/bin/env node
/**
 * automated_project_tree.js
 *
 * This script automatically generates project_tree.md from the src/ directory.
 * It scans all folders/files, reads JSDoc headers for descriptions,
 * and organizes everything by Clean Architecture layers.
 *
 * Usage: node scripts/automated_project_tree.js
 * Or:    npm run generate:tree
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUTPUT = path.join(ROOT, "project_tree.md");

// ============================================================
// 1. Clean Architecture layer mapping: folder → description
// ============================================================
const LAYER_ORDER = [
    { folder: "application", icon: "🧠", label: "application/ — Use Case'ler (Uygulama Senaryoları)" },
    { folder: "domain", icon: "🎯", label: "domain/ — İş Mantığı Çekirdeği (Hiç dış bağımlılığı yok!)" },
    { folder: "infrastructure", icon: "🔧", label: "infrastructure/ — Altyapı Katmanı (Storage, API)" },
    { folder: "presentation", icon: "🎨", label: "presentation/ — Sunum Katmanı (Hooks, ViewModels)" },
    { folder: "components", icon: "🖥️", label: "components/ — UI Bileşenleri (Preact)" },
    { folder: "services", icon: "⚙️", label: "services/ — Servis Katmanı" },
    { folder: "content", icon: "🕸️", label: "content/ — Content Scripts (Web sayfasına enjekte)" },
    { folder: "background", icon: "⚡", label: "background/ — Service Worker" },
    { folder: "css", icon: "🎨", label: "css/ — Stil Dosyaları" },
    { folder: "data", icon: "📊", label: "data/ — Statik Veri Dosyaları (JSON)" },
    { folder: "types", icon: "📐", label: "types/ — TypeScript Tip Tanımları" },
    { folder: "utils", icon: "🛠️", label: "utils/ — Yardımcı Fonksiyonlar" },
    { folder: "offscreen", icon: "🎵", label: "offscreen/ — Offscreen Document" },
    { folder: "sidepanel", icon: "📋", label: "sidepanel/ — Side Panel" },
];

// Files at the root of src/ that should be described
const ROOT_FILES = {
    "App.tsx": "Ana uygulama bileşeni. Sidebar, view'lar ve ayarlar drawer'ını koordine eder.",
    "index.tsx": "Uygulamanın Preact ile mount edildiği giriş noktası (newtab.html).",
    "popup.tsx": "Tarayıcı ikonuna tıklandığında açılan popup arayüzü.",
    "newtab.css": "Yeni sekme sayfasının global CSS tanımları.",
};

// Manual descriptions for folders/files that don't have JSDoc
const MANUAL_DESC = {
    "application/ports": "Soyut arayüzler (port'lar) — infrastructure'ın implemente etmesi gereken kontratlar.",
    "application/use-cases/todo": "Todo işlemleri için kullanım senaryoları.",
    "application/use-cases/pomodoro": "Pomodoro zamanlayıcı işlemleri.",
    "application/use-cases/settings": "Ayarlar ile ilgili kullanım senaryoları.",
    "application/use-cases/sync": "Bulut senkronizasyon işlemleri.",
    "domain/entities": "İş mantığının temel nesneleri (Entity).",
    "domain/value-objects": "Değer nesneleri (basit tiplerin tip güvenli hali).",
    "domain/repositories": "Repository arayüzleri (port'lar) — infrastructure'ın implementasyon kontratları.",
    "domain/services": "Domain'e ait saf iş mantığı servisleri.",
    "domain/constants": "Domain sabitleri (KPSS ders, müfredat, flashcard).",
    "domain/data": "Domain verileri (Hifiz sure/dua listesi).",
    "infrastructure/api": "Google API istemcileri (Auth, Tasks, Calendar, Drive).",
    "infrastructure/persistence": "Chrome Storage tabanlı veri deposu implementasyonları.",
    "infrastructure/persistence/migrations": "Storage migrasyonları (local → sync).",
    "infrastructure/services": "Infrastructure servisleri (PomodoroManager gibi).",
    "presentation/hooks": "React/Preact custom hook'lar (state yönetimi).",
    "presentation/view-models": "ViewModel'ler (filtreleme, sıralama mantığı).",
    "components/popup": "Popup ekranı sekmeleri (Detox, Pomo, Volume).",
    "components/pomodoro": "Pomodoro alt bileşenleri (Timer, Stopwatch, Alarm, Zen).",
    "components/notes": "Notlar alt bileşenleri.",
    "components/kpss": "KPSS alt bileşenleri (23 dosya — en büyük modül).",
    "components/settings": "Ayarlar sekmeleri (General, Detox, Sync, AI, KPSS).",
    "components/stock": "Borsa alt bileşenleri.",
    "components/detox": "Detox/odak alt bileşenleri.",
    "components/hifiz": "Hafızlık (Hifiz) alt bileşenleri.",
    "components/arcade": "Arcade oyunları alt bileşenleri.",
    "components/arcade/builtin": "Yerleşik oyunlar (Snake, SpaceShooter, KnightRunner).",
    "components/freegames": "Ücretsiz oyun alt bileşenleri.",
    "components/eisenhower": "Eisenhower Matrisi alt bileşenleri.",
    "components/aichat": "AI sohbet alt bileşenleri.",
    "components/sidebar": "Sidebar navigasyon bileşenleri.",
    "content/agent": "DOM ajan motoru (AI'nin DOM'u okuması).",
    "content/detox": "Zararlı/istenmeyen siteleri engelleme.",
    "content/infobox": "Sayfada bilgi kutusu gösterimi.",
    "content/volume": "Web sayfalarında ses yükseltici.",
    "content/whatsapp": "WhatsApp Web ile entegrasyon köprüsü.",
    "background/handlers": "Background handler'ları (alarm, context menu, runtime mesaj).",
    "css/newtab": "Yeni sekme sayfası CSS dosyaları.",
    "css/newtab/arcade": "Arcade CSS stilleri.",
    "data/kpss": "KPSS sınav arşivi JSON verileri (2006-2021).",
    "services/vocabulary": "Kelime/öğrenme kartı servis alt modülü.",
    "utils/translations": "Çeviri anahtarları (Türkçe/İngilizce).",
    "types": "Tüm projede kullanılan ortak tip/interface tanımlamaları.",
};

// ============================================================
// 2. Helper: Read JSDoc from first lines of a .ts/.tsx file
// ============================================================
function extractJSDoc(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(/\/\*\*[\s\S]*?\*\//);
        if (match) {
            // Extract the meaningful text (first line after the description)
            const lines = match[0]
                .split("\n")
                .map((l) => l.replace(/^\s*\*\/?\s?/, "").trim())
                .filter((l) => l && !l.startsWith("@") && !l.startsWith("/**") && !l.startsWith("*/"));
            return lines[0] || null;
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================================
// 3. Helper: Generate description from filename
// ============================================================
function describeFromFilename(filename, relPath) {
    // Check manual descriptions first
    if (MANUAL_DESC[relPath]) return MANUAL_DESC[relPath];

    // Remove extension
    const name = filename.replace(/\.[^.]+$/, "");

    // Remove common prefixes/suffixes
    let clean = name
        .replace(/^(use|init|ChromeStorage)/, "")
        .replace(/Service$/, "")
        .replace(/UseCase$/, "")
        .replace(/Handler$/, "")
        .replace(/Api$/, "")
        .replace(/Repository$/, "")
        .replace(/Card$/, "")
        .replace(/Modal$/, "")
        .replace(/View$/, "")
        .replace(/Tab$/, "")
        .replace(/Step$/, "")
        .replace(/Port$/, "");

    if (!clean) clean = name;
    if (clean.length > 30) clean = name;

    // CamelCase to Turkish-friendly description
    const words = clean
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .split(/[-_\s]+/)
        .filter(Boolean);

    const desc = words.join(" ");
    if (desc.toLowerCase().includes("todo")) return `Todo işlemleri: ${desc}`;
    if (desc.toLowerCase().includes("pomo") || desc.toLowerCase().includes("timer")) return `Pomodoro: ${desc}`;
    if (desc.toLowerCase().includes("kpss")) return `KPSS: ${desc}`;
    if (desc.toLowerCase().includes("stock") || desc.toLowerCase().includes("bist")) return `Borsa: ${desc}`;
    if (desc.toLowerCase().includes("settings") || desc.toLowerCase().includes("ayar")) return `Ayarlar: ${desc}`;
    if (desc.toLowerCase().includes("note")) return `Not: ${desc}`;

    return desc || `${filename} bileşeni`;
}

// ============================================================
// 4. Build the markdown tree
// ============================================================
function buildTree() {
    const walkSync = (dir, prefix = "") => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const result = [];

        for (const entry of entries) {
            if (entry.name.startsWith(".")) continue;
            if (entry.name === "node_modules") continue;
            if (entry.name === "exam_tarih_arsivi.json") continue;

            const fullPath = path.join(dir, entry.name);
            const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                const subFiles = fs.readdirSync(fullPath).filter((f) => !f.startsWith("."));
                // Only include directories that have files
                if (subFiles.length > 0) {
                    result.push({ name: entry.name, path: relPath, isDir: true, files: walkSync(fullPath, relPath) });
                }
            } else if (entry.isFile()) {
                const jsdoc = extractJSDoc(fullPath);
                const desc = jsdoc || describeFromFilename(entry.name, relPath);
                result.push({ name: entry.name, path: relPath, isDir: false, desc });
            }
        }
        return result;
    };

    return walkSync(SRC, "src");
}

// ============================================================
// 5. Render markdown
// ============================================================
function renderMarkdown(tree) {
    const lines = [];
    lines.push("# Project Directory Layout & File Map (Auto-generated)");
    lines.push("");
    lines.push("> ⚡ Bu dosya `npm run generate:tree` komutu ile otomatik oluşturulmuştur.");
    lines.push("> Yeni bir dosya/klasör eklendiğinde bu scripti tekrar çalıştırarak güncelleyebilirsin.");
    lines.push("");
    lines.push("Proje **Clean Architecture** (Temiz Mimari) prensiplerine göre yapılandırılmıştır:");
    lines.push("");
    lines.push("- **domain/** → İş mantığının çekirdeği (hiçbir dış bağımlılığı yoktur)");
    lines.push("- **application/** → Uygulama senaryoları (use-case'ler)");
    lines.push("- **infrastructure/** → Dış dünya ile iletişim (API, Storage)");
    lines.push("- **presentation/** → Kullanıcı arayüzü durum yönetimi");
    lines.push("- **components/** → Görsel Preact/React bileşenleri");
    lines.push("- **services/** → Servis katmanı (üçüncü parti API, iş mantığı)");
    lines.push("- **content/** → Web sayfalarına enjekte edilen scriptler");
    lines.push("- **background/** → Servis worker'ı (extension arka plan işlemleri)");
    lines.push("");

    // --- Root files ---
    lines.push("---");
    lines.push("");
    lines.push("## 📁 `src/` — Ana Kaynak Kodu");
    lines.push("");
    for (const [file, desc] of Object.entries(ROOT_FILES)) {
        lines.push(`- **${file}** → ${desc}`);
    }
    lines.push("");

    // --- Layer folders ---
    for (const layer of LAYER_ORDER) {
        const folder = tree.find((t) => t.name === layer.folder);
        if (!folder) continue;

        lines.push("---");
        lines.push("");
        lines.push(`## ${layer.icon} \`src/${layer.label}\``);
        lines.push("");

        renderNode(folder, lines, 0);
        lines.push("");
    }

    // --- External dirs ---
    lines.push("---");
    lines.push("");
    lines.push("## 📁 `public/` — Statik Varlıklar");
    lines.push("");
    lines.push("- **manifest.json** → Chrome Extension manifest dosyası");
    lines.push("- **/data/** → Çalışma zamanında kullanılan veri dosyaları");
    lines.push("- **/icons/** → Extension ikonları (16px, 48px, 128px)");
    lines.push("- **/pdf/** → PDF dosyaları");
    lines.push("");
    lines.push("## 📁 `scripts/` — Geliştirme Araçları");
    lines.push("");
    lines.push("- **countLines.js** → Kod satır sayma");
    lines.push("- **extract_all_years.py** → KPSS sınav verilerini JSON'dan çıkarma");
    lines.push("- **automated_project_tree.js** → Bu dosyayı oluşturan otomasyon scripti");
    lines.push("");

    // --- Architecture diagram ---
    lines.push("---");
    lines.push("");
    lines.push("## Mimari Özet (Clean Architecture)");
    lines.push("");
    lines.push("```");
    lines.push("┌─────────────────────────────────────────────────────────────┐");
    lines.push("│                    components/ (UI)                         │");
    lines.push("│   Preact bileşenleri — kullanıcının gördüğü arayüz          │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│                    presentation/ (Hooks)                    │");
    lines.push("│   useState, useEffect mantığı — state yönetimi             │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│                    services/ (Servis Katmanı)               │");
    lines.push("│   API çağrıları, iş mantığı, üçüncü parti entegrasyon      │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│                    application/ (Use Cases)                 │");
    lines.push("│   Uygulama senaryoları — Port'lar (arayüzler)              │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│                    domain/ (Core)                           │");
    lines.push("│   Entity'ler, Value Object'ler, Repository arayüzleri       │");
    lines.push("│   ⚠️ Hiçbir dış bağımlılığı yok!                           │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│                    infrastructure/ (Altyapı)                │");
    lines.push("│   Chrome Storage, Google API, Repository implementasyonları│");
    lines.push("│   ⚠️ Domain'deki arayüzleri somutlaştırır                  │");
    lines.push("├─────────────────────────────────────────────────────────────┤");
    lines.push("│   content/  │  background/  │  offscreen/  │  sidepanel/   │");
    lines.push("│   (sayfa içi)│  (arka plan) │  (arka ses)  │  (yan panel)  │");
    lines.push("└─────────────────────────────────────────────────────────────┘");
    lines.push("```");
    lines.push("");

    return lines.join("\n");
}

function renderNode(node, lines, depth) {
    const indent = "  ".repeat(depth);

    if (node.isDir) {
        const dirLabel = MANUAL_DESC[`${node.path.replace(/^src\//, "")}`] || "";
        if (dirLabel) {
            lines.push(`${indent}**${node.name}/** → ${dirLabel}`);
        } else {
            lines.push(`${indent}**${node.name}/**`);
        }

        if (node.files) {
            for (const child of node.files) {
                renderNode(child, lines, depth + 1);
            }
        }
    } else {
        const desc = node.desc || "—";
        lines.push(`${indent}- **${node.name}** → ${desc}`);
    }
}

// ============================================================
// 6. Main
// ============================================================
try {
    console.log("🔍 Scanning src/ directory...");
    const tree = buildTree();
    console.log(`   Found files and folders.`);

    console.log("📝 Generating project_tree.md...");
    const md = renderMarkdown(tree);
    fs.writeFileSync(OUTPUT, md, "utf-8");

    console.log(`✅ project_tree.md created successfully!`);
    console.log(`   File: ${OUTPUT}`);
} catch (err) {
    console.error("❌ Error generating project tree:", err.message);
    process.exit(1);
}