#!/usr/bin/env node
/**
 * detect_i18n_issues.cjs
 * 
 * Projedeki i18n'e taşınması gereken Türkçe metinleri tespit eder.
 * 
 * Kullanım: node scripts/detect_i18n_issues.cjs
 * 
 * Yaptıkları:
 * 1. `lang === "tr" ? "..." : "..."` ternary'lerini bulur
 * 2. Türkçe karakter (ğüşıöç) içeren hardcoded string'leri bulur
 * 3. tr.ts'de olup en.ts'de olmayan anahtarları tespit eder
 * 4. Raporu i18n_report.md olarak kaydeder
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const REPORT = path.join(ROOT, "i18n_report.md");

// ============================================================
// 1. Tarama: Ternary kalıpları
// ============================================================
function findTernaryPatterns() {
    const results = [];
    const walkSync = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".")) continue;
            if (entry.name === "node_modules") continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkSync(fullPath);
            } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
                const content = fs.readFileSync(fullPath, "utf-8");
                const lines = content.split("\n");
                const relPath = path.relative(ROOT, fullPath);

                // Skip translation files
                if (relPath.includes("translations")) continue;

                lines.forEach((line, idx) => {
                    // Match: lang === "tr" ? "..." : "..."
                    const ternaryMatch = line.match(/lang\s*===\s*["']tr["']\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"/);
                    if (ternaryMatch) {
                        results.push({
                            type: "ternary",
                            file: relPath,
                            line: idx + 1,
                            tr: ternaryMatch[1],
                            en: ternaryMatch[2],
                            code: line.trim(),
                        });
                    }

                    // Match: isTr ? "..." : "..."
                    const isTrMatch = line.match(/isTr\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"/);
                    if (isTrMatch) {
                        results.push({
                            type: "isTr_ternary",
                            file: relPath,
                            line: idx + 1,
                            tr: isTrMatch[1],
                            en: isTrMatch[2],
                            code: line.trim(),
                        });
                    }
                });
            }
        }
    };
    walkSync(SRC);
    return results;
}

// ============================================================
// 2. Tarama: Hardcoded Türkçe string'ler
// ============================================================
function findHardcodedTurkish() {
    const results = [];
    const turkishChars = /[ğüşıöçĞÜŞİÖÇ]/;
    const walkSync = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith(".")) continue;
            if (entry.name === "node_modules") continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkSync(fullPath);
            } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
                const content = fs.readFileSync(fullPath, "utf-8");
                const lines = content.split("\n");
                const relPath = path.relative(ROOT, fullPath);

                // Skip translation files
                if (relPath.includes("translations")) continue;

                lines.forEach((line, idx) => {
                    if (turkishChars.test(line)) {
                        // Skip comments and JSDoc
                        const trimmed = line.trim();
                        if (trimmed.startsWith("*") || trimmed.startsWith("//")) return;
                        if (trimmed.startsWith("@")) return;

                        // Extract the Turkish string part
                        const stringMatch = trimmed.match(/"([^"]*[ğüşıöçĞÜŞİÖÇ][^"]*)"/);
                        if (stringMatch) {
                            results.push({
                                type: "hardcoded",
                                file: relPath,
                                line: idx + 1,
                                text: stringMatch[1],
                                code: trimmed.substring(0, 120),
                            });
                        }
                    }
                });
            }
        }
    };
    walkSync(SRC);
    return results;
}

// ============================================================
// 3. tr.ts vs en.ts anahtar karşılaştırması
// ============================================================
function compareTranslationFiles() {
    const trPath = path.join(SRC, "utils/translations/tr.ts");
    const enPath = path.join(SRC, "utils/translations/en.ts");

    const extractKeys = (filePath) => {
        const content = fs.readFileSync(filePath, "utf-8");
        const keys = [];
        const lines = content.split("\n");
        lines.forEach((line) => {
            const match = line.match(/^\s+(\w+):/);
            if (match) keys.push(match[1]);
        });
        return keys;
    };

    const trKeys = extractKeys(trPath);
    const enKeys = extractKeys(enPath);

    const inTrNotEn = trKeys.filter((k) => !enKeys.includes(k));
    const inEnNotTr = enKeys.filter((k) => !trKeys.includes(k));

    return { trKeys, enKeys, inTrNotEn, inEnNotTr };
}

// ============================================================
// 4. Rapor oluştur
// ============================================================
function generateReport(ternaries, hardcoded, comparison) {
    const lines = [];
    lines.push("# i18n Dönüşüm Raporu");
    lines.push("");
    lines.push(`> Oluşturulma: ${new Date().toLocaleString("tr-TR")}`);
    lines.push(`> Komut: \`node scripts/detect_i18n_issues.cjs\``);
    lines.push("");
    lines.push("---");
    lines.push("");

    // === ÖZET ===
    lines.push("## 📊 Özet");
    lines.push("");
    lines.push(`| Kategori | Adet |`);
    lines.push(`|----------|------|`);
    lines.push(`| Ternary kalıpları (\`lang === "tr" ?\`) | ${ternaries.length} |`);
    lines.push(`| Hardcoded Türkçe string'ler | ${hardcoded.length} |`);
    lines.push(`| tr.ts'de olup en.ts'de OLMAYAN anahtarlar | ${comparison.inTrNotEn.length} |`);
    lines.push(`| en.ts'de olup tr.ts'de OLMAYAN anahtarlar | ${comparison.inEnNotTr.length} |`);
    lines.push(`| Toplam tr.ts anahtar sayısı | ${comparison.trKeys.length} |`);
    lines.push(`| Toplam en.ts anahtar sayısı | ${comparison.enKeys.length} |`);
    lines.push("");

    // === TERNARY'LER ===
    lines.push("---");
    lines.push("");
    lines.push("## 🔄 Ternary Kalıpları (i18n'e taşınması gerekenler)");
    lines.push("");
    lines.push("Bu kalıplar `t.anahtar_adi` şeklinde değiştirilmeli.");
    lines.push("");

    if (ternaries.length === 0) {
        lines.push("✅ Tüm ternary'ler dönüştürülmüş!");
    } else {
        // Group by file
        const byFile = {};
        ternaries.forEach((t) => {
            if (!byFile[t.file]) byFile[t.file] = [];
            byFile[t.file].push(t);
        });

        for (const [file, items] of Object.entries(byFile)) {
            lines.push(`### 📄 \`${file}\` (${items.length} adet)`);
            lines.push("");
            lines.push("| Satır | 🇹🇷 Türkçe | 🇬🇧 İngilizce |");
            lines.push("|-------|-----------|--------------|");
            items.forEach((item) => {
                lines.push(`| ${item.line} | \`${item.tr}\` | \`${item.en}\` |`);
            });
            lines.push("");
        }
    }

    // === HARDCODED ===
    lines.push("---");
    lines.push("");
    lines.push("## 📝 Hardcoded Türkçe String'ler");
    lines.push("");
    lines.push("Bu string'ler ya ternary içinde değil ya da doğrudan yazılmış.");
    lines.push("");

    if (hardcoded.length === 0) {
        lines.push("✅ Hardcoded Türkçe string bulunamadı!");
    } else {
        const byFile = {};
        hardcoded.forEach((h) => {
            if (!byFile[h.file]) byFile[h.file] = [];
            byFile[h.file].push(h);
        });

        for (const [file, items] of Object.entries(byFile)) {
            lines.push(`### 📄 \`${file}\` (${items.length} adet)`);
            lines.push("");
            lines.push("| Satır | Metin | Kod |");
            lines.push("|-------|-------|-----|");
            items.forEach((item) => {
                lines.push(`| ${item.line} | \`${item.text}\` | \`${item.code}\` |`);
            });
            lines.push("");
        }
    }

    // === ANAHTAR KARŞILAŞTIRMA ===
    lines.push("---");
    lines.push("");
    lines.push("## 🔑 tr.ts vs en.ts Anahtar Karşılaştırması");
    lines.push("");

    if (comparison.inTrNotEn.length > 0) {
        lines.push("### ⚠️ tr.ts'de olup en.ts'de OLMAYAN anahtarlar");
        lines.push("");
        comparison.inTrNotEn.forEach((k) => lines.push(`- \`${k}\``));
        lines.push("");
    } else {
        lines.push("✅ tr.ts'deki tüm anahtarlar en.ts'de de mevcut.");
        lines.push("");
    }

    if (comparison.inEnNotTr.length > 0) {
        lines.push("### ⚠️ en.ts'de olup tr.ts'de OLMAYAN anahtarlar");
        lines.push("");
        comparison.inEnNotTr.forEach((k) => lines.push(`- \`${k}\``));
        lines.push("");
    } else {
        lines.push("✅ en.ts'deki tüm anahtarlar tr.ts'de de mevcut.");
        lines.push("");
    }

    // === DOSYA LİSTESİ ===
    lines.push("---");
    lines.push("");
    lines.push("## 📁 İşlem Gerektiren Dosyalar (alfabetik)");
    lines.push("");

    const allFiles = new Set();
    ternaries.forEach((t) => allFiles.add(t.file));
    hardcoded.forEach((h) => allFiles.add(h.file));

    if (allFiles.size === 0) {
        lines.push("✅ İşlem gerektiren dosya yok.");
    } else {
        [...allFiles].sort().forEach((f) => {
            const tCount = ternaries.filter((t) => t.file === f).length;
            const hCount = hardcoded.filter((h) => h.file === f).length;
            const parts = [];
            if (tCount > 0) parts.push(`${tCount} ternary`);
            if (hCount > 0) parts.push(`${hCount} hardcoded`);
            lines.push(`- \`${f}\` → ${parts.join(", ")}`);
        });
    }

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## ✅ Şu Ana Kadar Dönüştürülen Dosyalar");
    lines.push("");
    lines.push("- `src/utils/translations/tr.ts` → yeni anahtarlar eklendi");
    lines.push("- `src/utils/translations/en.ts` → yeni anahtarlar eklendi");
    lines.push("- `src/components/CalendarView.tsx` → ay adları ve no_events dönüştürüldü");
    lines.push("- `src/components/ConfirmModal.tsx` → Tamam/İptal dönüştürüldü");
    lines.push("- `src/components/DatePicker.tsx` → ay adları ve butonlar dönüştürüldü");
    lines.push("- `src/components/EisenhowerView.tsx` → headerTag'ler, kanban başlık, drag hint dönüştürüldü");
    lines.push("- `src/components/eisenhower/EisenhowerUnclassifiedSidePanel.tsx` → tüm metinler dönüştürüldü");
    lines.push("- `src/components/detox/DetoxMotivationCard.tsx` → başlık dönüştürüldü");
    lines.push("");

    return lines.join("\n");
}

// ============================================================
// MAIN
// ============================================================
try {
    console.log("🔍 Taranıyor: Ternary kalıpları...");
    const ternaries = findTernaryPatterns();
    console.log(`   → ${ternaries.length} adet ternary bulundu.`);

    console.log("🔍 Taranıyor: Hardcoded Türkçe string'ler...");
    const hardcoded = findHardcodedTurkish();
    console.log(`   → ${hardcoded.length} adet hardcoded string bulundu.`);

    console.log("🔍 Karşılaştırılıyor: tr.ts vs en.ts...");
    const comparison = compareTranslationFiles();
    console.log(`   → tr.ts: ${comparison.trKeys.length} anahtar`);
    console.log(`   → en.ts: ${comparison.enKeys.length} anahtar`);
    if (comparison.inTrNotEn.length > 0) {
        console.log(`   ⚠️  tr.ts'de olup en.ts'de olmayan: ${comparison.inTrNotEn.length} adet`);
    }
    if (comparison.inEnNotTr.length > 0) {
        console.log(`   ⚠️  en.ts'de olup tr.ts'de olmayan: ${comparison.inEnNotTr.length} adet`);
    }

    console.log("📝 Rapor oluşturuluyor...");
    const report = generateReport(ternaries, hardcoded, comparison);
    fs.writeFileSync(REPORT, report, "utf-8");

    console.log(`✅ Rapor kaydedildi: ${REPORT}`);
    console.log("");
    console.log("📊 ÖZET:");
    console.log(`   Ternary'ler: ${ternaries.length}`);
    console.log(`   Hardcoded: ${hardcoded.length}`);
    console.log(`   Eksik en.ts anahtarı: ${comparison.inTrNotEn.length}`);
    console.log(`   Eksik tr.ts anahtarı: ${comparison.inEnNotTr.length}`);
} catch (err) {
    console.error("❌ Hata:", err.message);
    process.exit(1);
}