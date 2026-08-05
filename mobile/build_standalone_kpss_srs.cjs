/**
 * build_standalone_kpss_srs.cjs
 * Builds a single-file, dependency-free HTML app: KPSS Tarih SRS flashcards.
 * Runs on phone in any browser. No build step, no network, no chrome APIs.
 *
 * Data:    src/services/kpss/data/osymHistoryQuestions.json (history array)
 * Logic:   scripts/kpss-srs-standalone-src/app.js (port of SrsService.ts + card UI)
 * Styling: scripts/kpss-srs-standalone-src/style.css
 * Output:  scripts/kpss-srs-standalone/index.html  (cards embedded inline)
 * Persistence: localStorage (standalone replacement for chrome.storage.sync).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_JSON = path.join(
  ROOT,
  "src",
  "services",
  "kpss",
  "data",
  "osymHistoryQuestions.json"
);
const SRC_APP = path.join(__dirname, "kpss-srs-standalone-src", "app.js");
const SRC_CSS = path.join(__dirname, "kpss-srs-standalone-src", "style.css");
const OUT = path.join(__dirname, "kpss-srs-standalone", "index.html");

// ---- 1. Load raw questions & build flashcards (ports kpssOsymHistoryFlashcards.ts) ----
const raw = JSON.parse(fs.readFileSync(SRC_JSON, "utf8"));
const source = (raw.history || []).map((q) => {
  const rawAns = (q.answer || "").trim();
  const cleanAnsLetter = rawAns.charAt(0).toUpperCase();
  const optionText = q.options?.[cleanAnsLetter] || q.options?.[rawAns] || "";
  const answerDisplay = optionText
    ? `${cleanAnsLetter}) ${optionText}`
    : rawAns
      ? `Cevap: ${rawAns}`
      : "Açıklamaya bakınız";
  const hintText = [q.header || "", q.explanation || ""]
    .filter(Boolean)
    .join(" — ");
  return {
    id: `osym_hist_${q.id}`,
    question: q.question,
    answer: answerDisplay,
    hint: hintText,
    category: q.chapter || "Tarih",
  };
});

// ---- 2. Read app js + css ----
const APP_JS = fs.readFileSync(SRC_APP, "utf8");
const CSS = fs.readFileSync(SRC_CSS, "utf8");

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0b1220">
<title>KPSS Tarih SRS</title>
<style>
${CSS}
</style>
</head>
<body>
<div id="root"></div>
<script>
const FLASHCARDS = ${JSON.stringify(source)};
${APP_JS}
</script>
</body>
</html>
`;

// ---- 3. Validate JS compiles before writing ----
try {
  new Function(`const FLASHCARDS = ${JSON.stringify(source)};\n${APP_JS}`);
} catch (err) {
  console.error("BUILD FAILED (JS validation):", err.message);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, "utf8");
console.log("Wrote " + OUT);
console.log(
  "Cards:",
  source.length,
  "| Chapters:",
  new Set(source.map((c) => c.category)).size
);
console.log("Size:", (fs.statSync(OUT).size / 1024).toFixed(1) + " KB");
