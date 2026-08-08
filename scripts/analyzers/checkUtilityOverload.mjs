import fs from "fs";
import { getFiles, getRelativePath, SRC_DIR } from "./utils.mjs";

export const name = "İsviçre Çakısı Utils Taraması (Overloaded generic utility files)";

export function run() {
  const issues = [];
  const files = getFiles(SRC_DIR);

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    if (!relPath.startsWith("utils/") || relPath.includes("/")) continue; // target top-level utils

    const content = fs.readFileSync(filePath, "utf-8");
    const exportMatches = content.match(/export\s+(function|const|class)\s+\w+/g) || [];

    // If a generic utils file exports > 12 unrelated functions in single file
    if (exportMatches.length > 12 && relPath === "utils.ts") {
      issues.push({
        file: `src/${relPath}`,
        message: "🟣 İsviçre Çakısı Utils: Tek bir utility dosyasında çok fazla farklı alana ait fonksiyon birikmiş.",
      });
    }
  }

  return issues;
}
