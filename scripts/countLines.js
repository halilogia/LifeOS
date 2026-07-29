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

const fileStats = [];

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
        const lines = content.split("\n").length;
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

        fileStats.push({ path: relativePath, lines, ext });
        totalLines += lines;
        totalFiles += 1;
      }
    }
  }
}

scanDirectory(path.join(rootDir, "src"));

fileStats.sort((a, b) => b.lines - a.lines);

const codeFiles = fileStats.filter((f) => f.ext !== ".json");
const dataFiles = fileStats.filter((f) => f.ext === ".json");

console.log("====================================================");
console.log("           PROJECT LINE COUNT REPORT                ");
console.log("====================================================\n");

console.log("--- 🏆 En Uzun KOD Dosyaları (.ts, .tsx, .css) ---");
codeFiles.slice(0, 15).forEach((file, index) => {
  const num = (index + 1).toString().padStart(2, " ");
  const linesStr = file.lines.toString().padStart(5, " ");
  console.log(`${num}. ${linesStr} satır  ->  ${file.path}`);
});

console.log("\n--- 📦 En Uzun VERİ / JSON Dosyaları ---");
dataFiles.slice(0, 10).forEach((file, index) => {
  const num = (index + 1).toString().padStart(2, " ");
  const linesStr = file.lines.toString().padStart(6, " ");
  console.log(`${num}. ${linesStr} satır  ->  ${file.path}`);
});

console.log("\n====================================================");
console.log(` TOPLAM TARANAN DOSYA : ${totalFiles}`);
console.log(` TOPLAM KOD SATIRI     : ${codeFiles.reduce((acc, f) => acc + f.lines, 0)} satır (Mantık ve Tasarım)`);
console.log(` TOPLAM VERİ SATIRI    : ${dataFiles.reduce((acc, f) => acc + f.lines, 0)} satır (Sözlük & KPSS Verileri)`);
console.log(` GENEL TOPLAM SATIR    : ${totalLines} satır`);
console.log("====================================================");
