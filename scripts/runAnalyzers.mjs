/**
 * runAnalyzers.mjs
 * Main Operator Runner Script for scanning multi-responsibility and architecture rules in src/.
 * Executes all modular analyzers from scripts/analyzers/ and aggregates findings.
 */

import * as checkLayerViolations from "./analyzers/checkLayerViolations.mjs";
import * as checkEmbeddedData from "./analyzers/checkEmbeddedData.mjs";
import * as checkEmbeddedPrompts from "./analyzers/checkEmbeddedPrompts.mjs";
import * as checkViewModalCoupling from "./analyzers/checkViewModalCoupling.mjs";
import * as checkUtilityOverload from "./analyzers/checkUtilityOverload.mjs";

const analyzers = [
  checkLayerViolations,
  checkEmbeddedData,
  checkEmbeddedPrompts,
  checkViewModalCoupling,
  checkUtilityOverload,
];

function run() {
  console.log("\n=======================================================");
  console.log(" 🚀 MODÜLER MİMARİ VE ÇOKLU SORUMLULUK OPERATÖRÜ");
  console.log("=======================================================\n");

  let totalIssues = 0;
  const aggregated = new Map();

  for (const analyzer of analyzers) {
    console.log(`🔍 Modül Çalıştırılıyor: [${analyzer.name}]`);
    const issues = analyzer.run();

    for (const issue of issues) {
      if (!aggregated.has(issue.file)) {
        aggregated.set(issue.file, []);
      }
      aggregated.get(issue.file).push(issue.message);
      totalIssues++;
    }
  }

  console.log("\n=======================================================");
  console.log(" 📊 DENETİM SONUÇLARI RAPORU");
  console.log("=======================================================\n");

  if (totalIssues === 0) {
    console.log("✨ MÜKEMMEL! Tüm modüler analizörlerden 0 ihlal ile geçildi.\n");
  } else {
    for (const [file, messages] of aggregated.entries()) {
      console.log(`📌 ${file}`);
      for (const msg of messages) {
        console.log(`   └─ ${msg}`);
      }
      console.log("");
    }
    console.log(`Toplam ${totalIssues} mimari öneri/ihlal tespit edildi.\n`);
  }
}

run();
