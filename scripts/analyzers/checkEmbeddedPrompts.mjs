import fs from "fs";
import { getFiles, getRelativePath, SRC_DIR } from "./utils.mjs";

export const name = "Gömülü LLM Prompt Taraması (Raw LLM prompts in logic services)";

export function run() {
  const issues = [];
  const files = getFiles(SRC_DIR);

  for (const filePath of files) {
    const relPath = getRelativePath(filePath);
    if (!relPath.startsWith("services/")) continue;

    const isPromptModule =
      relPath.includes("Prompts.ts") ||
      relPath.includes("systemPrompt.ts") ||
      relPath.includes("prompts/");
    if (isPromptModule || !relPath.endsWith(".ts")) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const hasInlinePrompt =
      /return\s+`Sen\s+KPSS/g.test(content) || /`Sen\s+uzman/g.test(content);
    if (hasInlinePrompt) {
      issues.push({
        file: `src/${relPath}`,
        message: "🟡 Servis dosyasında gömülü ham LLM prompt metni var (prompts/*.md veya *Prompts.ts dosyasına ayrılmalı).",
      });
    }
  }

  return issues;
}
