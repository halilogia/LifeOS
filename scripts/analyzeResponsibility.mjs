/**
 * analyzeResponsibility.mjs
 * Static code analysis script to detect multi-responsibility code smells in src/.
 * Checks for:
 * 1. Embedded large static data + logic in same file.
 * 2. Embedded long prompt text strings (+300 chars) + logic.
 * 3. Layer mixing (e.g., UI component calling storage directly).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, "../src");

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(SRC_DIR, filePath).replace(/\\/g, "/");
  const issues = [];

  // Check 1: Direct chrome.storage call in presentation components
  if (relPath.startsWith("components/") && content.includes("chrome.storage.")) {
    issues.push("UI Bileşeni içinde doğrudan `chrome.storage` erişimi (Katman ihlali)");
  }

  // Check 2: Embedded long template prompt (+300 chars raw multiline string) in service/logic
  const hasLongTemplateString = /`[\s\S]{300,}`/g.test(content);
  if (hasLongTemplateString && !relPath.includes("prompts/")) {
    issues.push("Gömülü uzun prompt / metin şablonu (prompts/*.md'ye ayrılmalı)");
  }

  // Check 3: Large inline static array literals (+5 items array of objects) alongside export functions
  const hasLargeInlineArray = /const\s+\w+\s*:\s*[^=]+=\s*\[\s*\{[\s\S]{200,}\}\s*\]/g.test(content);
  if (hasLargeInlineArray && !relPath.includes("constants/") && !relPath.includes("data/")) {
    issues.push("Gömülü büyük statik veri dizisi (domain/constants veya domain/data'ya ayrılmalı)");
  }

  return { relPath, issues };
}

function run() {
  console.log("\n=== ÇOKLU SORUMLULUK VE KATMAN İHLALİ TARAMASI ===\n");
  const files = getFiles(SRC_DIR);
  let totalIssues = 0;

  for (const f of files) {
    const { relPath, issues } = analyzeFile(f);
    if (issues.length > 0) {
      console.log(`📌 src/${relPath}`);
      for (const issue of issues) {
        console.log(`   └─ ⚠️  ${issue}`);
        totalIssues++;
      }
      console.log("");
    }
  }

  if (totalIssues === 0) {
    console.log("✅ Harika! Hiçbir çoklu sorumluluk veya katman ihlali tespit edilmedi.\n");
  } else {
    console.log(`Toplam ${totalIssues} mimari öneri tespit edildi.\n`);
  }
}

run();
