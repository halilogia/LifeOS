// Dead file detector: finds .ts/.tsx files never imported anywhere.
// Usage: node scripts/findDeadFiles.mjs
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, relative, sep } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

// Collect all source files
function collectFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) collectFiles(full, acc);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) acc.push(full);
  }
  return acc;
}

const files = collectFiles(SRC);
const fileSet = new Set(files.map((f) => f.replace(/\\/g, "/")));

// Read all file contents once for import scanning
const contents = new Map();
for (const f of files) {
  contents.set(f.replace(/\\/g, "/"), readFileSync(f, "utf8"));
}

// Resolve an import specifier to an absolute file path
function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;
  let base;
  if (spec.startsWith("@/")) {
    base = join(SRC, spec.slice(2));
  } else {
    base = join(fromFile.replace(/\/[^/]+$/, ""), spec);
  }
  // strip .js extension (TS source uses .js imports)
  if (base.endsWith(".js")) base = base.slice(0, -3);
  const candidates = [
    base + ".ts",
    base + ".tsx",
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const c of candidates) {
    const norm = c.replace(/\\/g, "/");
    if (fileSet.has(norm)) return norm;
  }
  return null;
}

// Build import map: file -> set of imported files
const importMap = new Map();
for (const f of files) {
  const norm = f.replace(/\\/g, "/");
  const content = contents.get(norm) || "";
  const imports = new Set();
  const re = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const resolved = resolveImport(norm, m[1]);
    if (resolved) imports.add(resolved);
  }
  importMap.set(norm, imports);
}

// Entry points (from manifest / vite): never dead even if unimported
const entries = new Set([
  join(SRC, "index.tsx").replace(/\\/g, "/"),
  join(SRC, "popup.tsx").replace(/\\/g, "/"),
  join(SRC, "sidepanel/index.tsx").replace(/\\/g, "/"),
  join(SRC, "offscreen/offscreenAudio.ts").replace(/\\/g, "/"),
  join(SRC, "background/backgroundMain.ts").replace(/\\/g, "/"),
  join(SRC, "content/contentMain.ts").replace(/\\/g, "/"),
]);

// Files that are imported by someone
const imported = new Set();
for (const [, imps] of importMap) {
  for (const imp of imps) imported.add(imp);
}

// Dead = not an entry and not imported
const dead = files
  .map((f) => f.replace(/\\/g, "/"))
  .filter((f) => !entries.has(f) && !imported.has(f))
  .sort();

console.log("\n=== OLU DOSYALAR (hicbir yerden import edilmiyor) ===");
for (const f of dead) console.log("  " + relative(ROOT, f).replace(/\\/g, "/"));
console.log(`\nToplam: ${dead.length} dosya`);

// ============================================================
// BOŞ KLASÖR KONTROLÜ — içinde hiç .ts/.tsx/.css dosyası ve
// alt klasörü olmayan klasörler (ölü dosya silinince klasör kalabilir)
// ============================================================
function findEmptyDirs(dir, acc = []) {
  let hasFiles = false;
  let hasSubdirs = false;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      hasSubdirs = true;
      findEmptyDirs(join(dir, entry.name), acc);
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      hasFiles = true;
    }
  }
  // Sadece kaynak dosya türleri sayılır (örn. .gitkeep boş klasörü kurtarmaz)
  const realFiles = readdirSync(dir).filter((f) => /\.(ts|tsx|css)$/.test(f));
  if (realFiles.length === 0 && !hasSubdirs) {
    acc.push(dir);
  }
  return acc;
}

const emptyDirs = findEmptyDirs(SRC);
console.log("\n=== BOŞ KLASÖRLER (icerik yok) ===");
if (emptyDirs.length === 0) {
  console.log("  (yok)");
} else {
  for (const d of emptyDirs) console.log("  " + relative(ROOT, d).replace(/\\/g, "/"));
  console.log(`\nToplam: ${emptyDirs.length} klasör`);
}

// Also check public/ for unreferenced assets
if (existsSync(join(ROOT, "public"))) {
  const allContent = Array.from(contents.values()).join("\n") +
    (existsSync(join(ROOT, "public/manifest.json")) ? readFileSync(join(ROOT, "public/manifest.json"), "utf8") : "");
  const pubFiles = collectFiles(join(ROOT, "public")).filter((f) => !f.includes("manifest.json"));
  const deadPub = pubFiles.filter((f) => {
    const name = f.split(sep).pop();
    return !allContent.includes(name);
  });
  console.log("\n=== PUBLIC/ DOSYALAR (manifest'te referans yok) ===");
  for (const f of deadPub) console.log("  " + relative(ROOT, f).replace(/\\/g, "/"));
  if (deadPub.length === 0) console.log("  (yok)");
}
