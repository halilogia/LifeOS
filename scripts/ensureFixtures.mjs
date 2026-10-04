/**
 * ensureFixtures.mjs
 * Generates minimal valid JSON fixture stubs for CI and clean clones.
 * Protects public repository safety while allowing compilation and bundling
 * when copyrighted exam question datasets are gitignored.
 */

import fs from "fs";
import path from "path";

const KPSS_DATA_DIR = path.resolve(process.cwd(), "src/services/kpss/data");

if (!fs.existsSync(KPSS_DATA_DIR)) {
  fs.mkdirSync(KPSS_DATA_DIR, { recursive: true });
}

const YEARS = [
  "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013",
  "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021",
  "2022", "2023", "2024", "2025"
];

for (const year of YEARS) {
  const file = path.join(KPSS_DATA_DIR, `exam${year}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({
      turkce: [],
      matematik: [],
      tarih: [],
      cografya: [],
      vatandaslik: []
    }, null, 2), "utf-8");
    console.log(`[ensureFixtures] Created CI fixture stub: exam${year}.json`);
  }
}

const HISTORY_FILES = ["osymHistoryQuestions.json", "osymHistoryQuestions54.json"];
for (const hFile of HISTORY_FILES) {
  const file = path.join(KPSS_DATA_DIR, hFile);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ history: [] }, null, 2), "utf-8");
    console.log(`[ensureFixtures] Created CI fixture stub: ${hFile}`);
  }
}
