/**
 * analyzeResponsibility.mjs
 * Kod satır sayısına bakmaksızın mimari katman ihlali ve çoklu sorumluluk tespiti yapar.
 * 
 * Kriterler:
 * 1. Katman İhlali: components/ içinde direkt chrome.storage / fetch kullanımı.
 * 2. Statik Veri Şişkinliği: Servis/Hook dosyalarında gömülü büyük varsayılan veri dizileri (constants/data'ya ayrılmalı).
 * 3. Servis İçi Ham Prompt Şablonu: Özel prompt dosyası olmayıp servis içinde ham 400+ karakterlik LLM prompt metni tutulması.
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

  // Kriter 1: UI Katmanında Storage / Fetch İhlali (AGENTS.md 6.2)
  if (relPath.startsWith("components/")) {
    if (content.includes("chrome.storage.")) {
      issues.push("🔴 Katman İhlali: UI bileşeninde doğrudan `chrome.storage` çağrısı var (hook/service'e taşınmalı).");
    }
    if (/\bfetch\s*\(/.test(content)) {
      issues.push("🔴 Katman İhlali: UI bileşeninde doğrudan `fetch()` çağrısı var (service'e taşınmalı).");
    }
  }

  // Kriter 2: Servis veya Hook içinde Gömülü Büyük Statik Veri Dizisi
  const isConstOrData = relPath.includes("constants/") || relPath.includes("data/") || relPath.includes("translations/");
  if (!isConstOrData) {
    const hasLargeDataArray = /const\s+DEFAULT_\w+\s*:[^=]+=\s*\[\s*\{/g.test(content);
    if (hasLargeDataArray) {
      issues.push("🟡 Çoklu Sorumluluk: Dosya içinde gömülü büyük statik/fallback veri dizisi var (domain/constants/'e ayrılmalı).");
    }
  }

  // Kriter 3: Mantık Servisinde Ayrıştırılmamış Ham LLM Prompt Metni (Prompt dosyaları hariç)
  const isPromptModule = relPath.includes("Prompts.ts") || relPath.includes("systemPrompt.ts") || relPath.includes("prompts/");
  if (relPath.startsWith("services/") && !isPromptModule) {
    const hasInlinePrompt = /return\s+`Sen\s+KPSS/g.test(content) || /`Sen\s+uzman/g.test(content);
    if (hasInlinePrompt && relPath.endsWith(".ts")) {
      issues.push("🟡 Çoklu Sorumluluk: Servis dosyasında gömülü ham LLM prompt metni var (prompts/*.md veya *Prompts.ts dosyasına ayrılmalı).");
    }
  }

  return { relPath, issues };
}

function run() {
  console.log("\n=======================================================");
  console.log(" 🔍 MİMARİ VE ÇOKLU SORUMLULUK TARAMASI (SRP & SoC)");
  console.log("=======================================================\n");

  const files = getFiles(SRC_DIR);
  let totalIssues = 0;

  for (const f of files) {
    const { relPath, issues } = analyzeFile(f);
    if (issues.length > 0) {
      console.log(`📌 src/${relPath}`);
      for (const issue of issues) {
        console.log(`   └─ ${issue}`);
        totalIssues++;
      }
      console.log("");
    }
  }

  if (totalIssues === 0) {
    console.log("✨ MÜKEMMEL! Hiçbir katman ihlali veya sorumluluk karmaşası bulunamadı.\n");
  } else {
    console.log(`Toplam ${totalIssues} mimari öneri/ihlal tespit edildi.\n`);
  }
}

run();
