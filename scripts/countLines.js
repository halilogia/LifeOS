import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const allowedExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json"];
const ignoreDirs = ["node_modules", "dist", ".git", ".vscode", ".gemini", "brain", "scratch"];

let totalLines = 0;
let totalFiles = 0;
let totalCodeLines = 0; // import hariç gerçek kod

const fileStats = [];

// Bir dosyanın: toplam satır, kod satırı (import+yorum+boş hariç), import satır sayısı
function analyzeFile(content) {
  const lines = content.split("\n");
  const total = lines.length;
  let codeLines = 0;
  let importLines = 0;
  let importedRemaining = false; // çok satırlı import takibi
  let blockComment = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!blockComment) {
      const start = trimmed.indexOf("/*");
      if (start !== -1) {
        if (trimmed.indexOf("*/", start + 2) === -1) blockComment = true;
        continue;
      }
    } else {
      if (trimmed.includes("*/")) blockComment = false;
      continue;
    }

    if (trimmed.length === 0) continue; // boşluk
    if (trimmed.startsWith("//")) continue; // yorum

    if (importedRemaining) {
      // çok satırlı import devamı
      importLines++;
      if (/}\s*from\s+["']/.test(trimmed)) importedRemaining = false;
      continue;
    }

    // import bloğu başlangıcı
    if (/^import\s/.test(trimmed)) {
      importLines++;
      if (trimmed.includes("{") && !/}\s*from\s+["']/.test(trimmed)) {
        importedRemaining = true;
      }
      continue;
    }
    // "} from '@/...'" devam satırı — import bloğu
    if (/^\}.*from\s+["']/.test(trimmed)) {
      importLines++;
      continue;
    }

    codeLines++;
  }

  return { total, codeLines, importLines };
}

function scanDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(item)) {
        scanDirectory(fullPath);
      }
    } else {
      const ext = path.extname(item).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const { total, codeLines, importLines } = analyzeFile(content);
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

        fileStats.push({ path: relativePath, lines: total, codeLines, importLines, ext });
        totalLines += total;
        totalCodeLines += codeLines;
        totalFiles += 1;
      }
    }
  }
}

scanDirectory(path.join(rootDir, "src"));

// Kod satırına göre sırala (import hariç)
fileStats.sort((a, b) => b.codeLines - a.codeLines);

const codeFiles = fileStats.filter((f) => f.ext !== ".json");
const dataFiles = fileStats.filter((f) => f.ext === ".json");

// Eşikler: 250+ kod satırı veya 15+ import satırı dikkat çeker
const FAT_CODE = 250;
const FAT_IMPORT = 15;

console.log("====================================================");
console.log("           PROJECT LINE COUNT REPORT                ");
console.log("====================================================\n");

console.log("--- 🏆 En Uzun KOD Dosyaları (import hariç gerçek mantık) ---");
codeFiles.slice(0, 15).forEach((file, index) => {
  const num = (index + 1).toString().padStart(2, " ");
  const codeStr = file.codeLines.toString().padStart(5, " ");
  console.log(`${num}. ${codeStr} kod (toplam ${file.lines}) -> ${file.path}`);
});

console.log("\n--- 📦 En Uzun VERİ / JSON Dosyaları ---");
dataFiles.slice(0, 10).forEach((file, index) => {
  const num = (index + 1).toString().padStart(2, " ");
  const linesStr = file.lines.toString().padStart(6, " ");
  console.log(`${num}. ${linesStr} satır  ->  ${file.path}`);
});

// --- Şişkin dosyalar (kod satırı yüksek) ---
const fatByCode = codeFiles.filter((f) => f.codeLines >= FAT_CODE);
if (fatByCode.length > 0) {
  console.log(`\n--- ⚠️ YÜKSEK KOD YOĞUNLUĞU (${FAT_CODE}+ kod satırı, import hariç) ---`);
  fatByCode.forEach((file, index) => {
    const num = (index + 1).toString().padStart(2, " ");
    console.log(`${num}. ${file.codeLines} kod / ${file.lines} toplam -> ${file.path}`);
  });
}

// --- Import yoğunluğu ---
const fatImport = codeFiles.filter((f) => f.importLines >= FAT_IMPORT);
if (fatImport.length > 0) {
  console.log(`\n--- 🔀 YÜKSEK İMPORT YOĞUNLUĞU (${FAT_IMPORT}+ import) ---`);
  console.log("Çok sayıda modüle bağımlı — barrel index.ts veya alt klasör önerilir:");
  fatImport.forEach((file, index) => {
    const num = (index + 1).toString().padStart(2, " ");
    console.log(`${num}. ${file.importLines} import -> ${file.path}`);
  });
}

console.log("\n====================================================");
console.log(` TOPLAM TARANAN DOSYA : ${totalFiles}`);
console.log(` TOPLAM KOD SATIRI     : ${totalCodeLines} satır (import + yorum + boşluk hariç)`);
console.log(` TOPLAM VERİ SATIRI    : ${dataFiles.reduce((acc, f) => acc + f.lines, 0)} satır (Sözlük & KPSS Verileri)`);
console.log(` GENEL TOPLAM SATIR    : ${totalLines} satır`);
console.log("====================================================");
