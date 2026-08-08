import fs from "fs";
import { getFiles, getRelativePath, SRC_DIR } from "./utils.mjs";

export const name = "Tuval & Parça Ayrımı Taraması (Coupled modal dialogs in View containers)";

export function run() {
  const issues = [];
  const files = getFiles(SRC_DIR);

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    if (!relPath.endsWith("View.tsx")) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").length;
    const hasInlineModal = content.includes('<div className="modal"') || content.includes('<div className="modal-overlay"');

    if (hasInlineModal && lines > 300) {
      issues.push({
        file: `src/${relPath}`,
        message: "🔵 Tuval & Parça İhlali: View dosyası içinde dev gömülü modal var (modal parçası ayrı bileşene çıkarılmalı).",
      });
    }
  }

  return issues;
}
