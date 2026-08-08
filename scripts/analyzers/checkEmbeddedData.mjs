import fs from "fs";
import { getFiles, getRelativePath, SRC_DIR } from "./utils.mjs";

export const name = "Gömülü Statik Veri Taraması (Large inline arrays in logic files)";

export function run() {
  const issues = [];
  const files = getFiles(SRC_DIR);

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    const isConstOrData =
      relPath.includes("constants/") ||
      relPath.includes("data/") ||
      relPath.includes("translations/");
    if (isConstOrData) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const hasLargeDataArray = /const\s+DEFAULT_\w+\s*:[^=]+=\s*\[\s*\{/g.test(content);
    if (hasLargeDataArray) {
      issues.push({
        file: `src/${relPath}`,
        message: "🟡 Dosya içinde gömülü büyük statik/fallback veri dizisi var (domain/constants/'e ayrılmalı).",
      });
    }
  }

  return issues;
}
