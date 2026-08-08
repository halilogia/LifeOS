import fs from "fs";
import { getFiles, getRelativePath, SRC_DIR } from "./utils.mjs";

export const name = "UI Katmanı İhlal Taraması (direct chrome.storage / fetch in UI)";

export function run() {
  const issues = [];
  const files = getFiles(SRC_DIR);

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    if (!relPath.startsWith("components/")) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("chrome.storage.")) {
      issues.push({
        file: `src/${relPath}`,
        message: "🔴 UI bileşeninde doğrudan `chrome.storage` çağrısı var (hook/service'e taşınmalı).",
      });
    }
    if (/\bfetch\s*\(/.test(content)) {
      issues.push({
        file: `src/${relPath}`,
        message: "🔴 UI bileşeninde doğrudan `fetch()` çağrısı var (service'e taşınmalı).",
      });
    }
  }

  return issues;
}
