#!/usr/bin/env node
/**
 * findUselessIndex.mjs
 * Gereksiz/Yararsız barrel index.ts dosyalarını tespit eder.
 *
 * Bir index.ts şu durumlarda GEREKSİZ:
 *  1. Yalnızca re-export içeriyor (gerçek kod yok) VE 0 veya 1 import eden var
 *  2. Hiç kimse import etmiyor (ölü barrel)
 *
 * Kullanım: node scripts/findUselessIndex.mjs [src]
 * Çıktı: ÖLÜ, TEK-İMPORT, ve OK index'ler. Çıkış kodu 0 = temiz, 1 = sorunlu.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_DIR = path.resolve(ROOT, process.argv[2] || "src");

// Saf barrel = sadece export satırları + import satırları + boşluk + yorum
function isPureBarrel(content) {
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, "") // block yorumlar sil
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith("//") && // line yorum sil
        !l.startsWith("export *"),
    );

  for (const line of stripped) {
    // re-export satırları geçer:
    if (
      /^export\s+(type\s+)?\{/.test(line) &&
      /from\s+["']/.test(line)
    ) {
      continue;
    }
    // import ile başlayan geçer (sadece type re-export yardımcıları)
    if (/^import\s/.test(line) && /from\s+["']/.test(line)) {
      continue;
    }
    // export type X from...
    if (/^export\s+type\s+[A-Za-z]/.test(line) && /from\s+["']/.test(line)) {
      continue;
    }
    // hiçbiri değilse -> barrel değil
    return false;
  }
  return true;
}

function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...walkFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// Tüm import'ları tarar: klasör path'iyle (uzantısız) import edilen
// ancak index.ts bulunmayan klasörleri tespit eder (EXPO: "@/services/foo").
function findMissingIndexes() {
  const missing = [];
  const files = walkFiles(SEARCH_DIR);
  const dirIndexSet = new Set(
    findIndexFiles(SEARCH_DIR).map((f) => path.dirname(f)),
  );
  for (const file of files) {
    const buf = fs.readFileSync(file, "utf8");
    const importRe = /(?:from\s+|import\s*\(?)\s*["'](@\/[^"']+)["']/g;
    let m;
    while ((m = importRe.exec(buf))) {
      const spec = m[1];
      // uzantılı veya index.js ile biten -> klasör değil
      if (/\.(js|ts|tsx|css|json|mjs|png|svg)$/.test(spec)) continue;
      // @/ alias'i src/ demek
      const abs = path.resolve(
        SEARCH_DIR,
        spec.replace(/^@\//, "") + ".ts",
      );
      // kaynak dosya mı yoksa klasör mü?
      if (fs.existsSync(abs)) continue; // dosya var -> OK
      const dirAbs = path.resolve(SEARCH_DIR, spec.replace(/^@\//, ""));
      if (fs.existsSync(dirAbs) && fs.statSync(dirAbs).isDirectory()) {
        if (!dirIndexSet.has(dirAbs)) {
          missing.push({
            importer: path.relative(ROOT, file).replace(/\\/g, "/"),
            spec,
          });
        }
      }
    }
  }
  return missing;
}

// index.ts'i import eden dosya sayısı (klasör path'i veya index.js ile)
function countImporters(absIndexPath) {
  const rel = path
    .relative(ROOT, absIndexPath)
    .replace(/\\/g, "/")
    .replace(/\.tsx?$/, "");
  // @/ alias = src/ — rel'den src/ prefix'ini kaldır
  const aliasRel = rel.replace(/^src\//, "");
  const folderRel = path.dirname(aliasRel).replace(/\\/g, "/");
  const folderRelNoDot = folderRel === "." ? "" : folderRel;
  // index kullanımı: "@/services/x" veya "@/services/x/index.js"
  const candidates = [
    folderRelNoDot ? `@/${folderRelNoDot}` : "@/",
    folderRelNoDot ? `@/${folderRelNoDot}/index.js` : "@/index.js",
    aliasRel ? `@/${aliasRel}` : "@",
  ].filter(Boolean);
  let count = 0;
  const importers = [];
  const files = walkFiles(SEARCH_DIR);
  for (const file of files) {
    if (file === absIndexPath) continue;
    const buf = fs.readFileSync(file, "utf8");
    if (candidates.some((c) => buf.includes(c))) {
      count++;
      importers.push(path.relative(ROOT, file).replace(/\\/g, "/"));
    }
  }
  return { count, importers };
}

function findIndexFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      out.push(...findIndexFiles(full));
    } else if (entry.name === "index.ts" || entry.name === "index.tsx") {
      out.push(full);
    }
  }
  return out;
}

const indexFiles = findIndexFiles(SEARCH_DIR);
const ENTRY_POINTS = new Set(["src/index.tsx", "src/sidepanel/index.tsx"]);
let deadCount = 0;
let singleCount = 0;
let okCount = 0;

console.log("\n=== INDEX.TS ANALİZİ (gereksiz barrel tespiti) ===\n");
for (const idx of indexFiles) {
  const rel = path.relative(ROOT, idx).replace(/\\/g, "/");
  if (ENTRY_POINTS.has(rel)) {
    console.log(`[ENTRY] ${rel} (vite/modül giriş noktası — silinemez)`);
    okCount++;
    continue;
  }
  const content = fs.readFileSync(idx, "utf8");
  const isBarrel = isPureBarrel(content);
  const { count, importers } = countImporters(idx);

  if (!isBarrel) {
    // İçinde gerçek kod var -> gerekli
    console.log(`[OK]   ${rel} (${count} import, gerçek kod içerir)`);
    okCount++;
  } else if (count === 0) {
    console.log(`[ÖLÜ]  ${rel} (0 import — TAMAMEN silinebilir)`);
    deadCount++;
  } else if (count === 1) {
    console.log(`[TEK]  ${rel} (1 import — doğrudan import edilebilir)`);
    console.log(`       → kullanan: ${importers[0] || "?"}`);
    singleCount++;
  } else {
    console.log(`[OK]   ${rel} (${count} import eden — faydalı barrel)`);
    okCount++;
  }
}

console.log(`\nSonuç: ${okCount} OK, ${singleCount} tek-import, ${deadCount} ölü`);

// --- Ters yön: klasör import'u var ama index.ts YOK ---
const missing = findMissingIndexes();
if (missing.length > 0) {
  console.log(
    `\n=== EKSİK INDEX (klasör import ediliyor ama index.ts yok) ===\n`,
  );
  for (const item of missing) {
    console.log(`[UYARI] ${item.importer}`);
    console.log(`        import ediyor: ${item.spec} → index.ts GEREKLİ`);
  }
}

if (deadCount > 0 || singleCount > 0 || missing.length > 0) {
  console.log(
    "\nÖneri: ÖLÜ index'ler SİLİNMELİ (§6.4 dead file kuralı). TEK-import olanlar doğrudan import'a çevrilmeli. EKSİK index'ler oluşturulmalı.",
  );
}
process.exit(deadCount > 0 || missing.length > 0 ? 1 : 0);
