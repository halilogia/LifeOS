/**
 * scripts/splitTranslations.mjs
 * Splits tr.ts / en.ts into per-module translation files.
 * Runs BEFORE or AFTER: key parsing is greedy regex per-entry.
 * Run: node scripts/splitTranslations.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src/utils/translations");

// Key prefix -> module name (first match wins, checked in order)
const MODULES = [
  ["kpss", "kpss"],
  ["stock", "stock"],
  ["arcade", "arcade"],
  ["settings", "settings"],
  ["notes", "notes"],
  ["detox", "detox"],
  ["ipo", "ipo"],
  ["willpower", "willpower"],
  ["aichat", "aichat"],
  ["hifiz", "hifiz"],
  ["zen", "zen"],
  ["agent", "agent"],
  ["google", "google"],
  ["srs", "srs"],
  ["pomo", "pomo"],
  ["pomodoro", "pomo"],
  ["free", "free"],
  ["fg", "free"],
  ["uib", "uib"],
  ["sidebar", "core"],
  ["eisenhower", "core"],
  ["kanban", "core"],
  ["popup", "core"],
  ["calendar", "core"],
  ["chart", "core"],
  ["alarm", "core"],
  ["notif", "core"],
  ["prompt", "agent"],
  ["chip", "agent"],
  ["copy", "agent"],
  ["starter", "agent"],
  ["listening", "agent"],
  ["answer", "agent"],
  ["autofill", "agent"],
  ["executing", "agent"],
  ["failed", "agent"],
  ["input", "agent"],
  ["memory", "agent"],
  ["question", "agent"],
  ["rescan", "agent"],
  ["speech", "agent"],
  ["summarize", "agent"],
  ["video", "agent"],
  ["voice", "agent"],
  ["month", "core"],
  ["day", "core"],
  ["view", "core"],
  ["theme", "core"],
  ["about", "core"],
  ["datepicker", "core"],
  ["confirm", "core"],
  ["repeat", "core"],
  ["section", "core"],
  ["empty", "core"],
  ["quote", "core"],
  ["loading", "core"],
  ["search", "core"],
  ["alert", "core"],
  ["filter", "core"],
  ["type", "core"],
  ["platform", "core"],
  ["list", "core"],
  ["note", "notes"],
  ["was", "free"],
  ["metacritic", "free"],
  ["steamdb", "free"],
  ["worth", "free"],
  ["get", "free"],
  ["ends", "free"],
  ["halka", "stock"],
  ["bist", "stock"],
  ["prayer", "core"],
  ["greeting", "core"],
  ["todo", "core"],
  ["backup", "core"],
  ["restore", "core"],
  ["change", "core"],
  ["clear", "core"],
  ["cat", "core"],
  ["retry", "core"],
  ["time", "core"],
  ["enabled", "core"],
  ["disabled", "core"],
  ["minutes", "core"],
  ["sync", "core"],
  ["save", "core"],
  ["cancel", "core"],
  ["edit", "core"],
  ["close", "core"],
  ["yes", "core"],
  ["no", "core"],
  ["delete", "core"],
  ["error", "core"],
  ["new", "core"],
  ["page", "core"],
  ["ai", "aichat"],
];

function splitLanguage(langFile) {
  const content = fs.readFileSync(path.join(SRC, langFile), "utf8");
  // Split on top-level object by scanning key: lines; closing "};" ends object.
  const objContent = content.slice(content.indexOf("{") + 1, content.lastIndexOf("}"));
  const lines = objContent.split("\n");
  const entries = [];
  let currentKey = null;
  let currentLines = [];
  let inComment = false;

  const flush = () => {
    if (currentKey) {
      entries.push({ key: currentKey, lines: currentLines });
    }
    currentKey = null;
    currentLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (inComment) {
      if (trimmed.includes("*/")) inComment = false;
      continue;
    }
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inComment = true;
      continue;
    }
    if (trimmed.startsWith("//")) continue;
    const m = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
    if (m) {
      flush();
      currentKey = m[1];
      currentLines = [line];
    } else if (currentKey) {
      currentLines.push(line);
    }
  }
  flush();

  const moduleMap = new Map();
  const unassigned = [];
  for (const e of entries) {
    let assigned = false;
    for (const [prefix, mod] of MODULES) {
      if (e.key.startsWith(prefix)) {
        if (!moduleMap.has(mod)) moduleMap.set(mod, []);
        moduleMap.get(mod).push(e);
        assigned = true;
        break;
      }
    }
    if (!assigned) unassigned.push(e.key);
  }
  return { moduleMap, unassigned };
}

function writeModuleFiles(lang, moduleMap) {
  const langDir = path.join(SRC, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
  for (const [mod, entries] of moduleMap) {
    const filePath = path.join(langDir, `${mod}.ts`);
    const body = entries.map((e) => e.lines.join("\n")).join("\n");
    const out = `export const ${mod} = {\n${body}\n};\n`;
    fs.writeFileSync(filePath, out, "utf8");
  }
}

function writeIndex(lang, moduleMap) {
  const langDir = path.join(SRC, lang);
  const mods = [...moduleMap.keys()].sort();
  const imports = mods.map((m) => `import { ${m} } from "./${m}.js";`).join("\n");
  const spread = mods.map((m) => `  ...${m},`).join("\n");
  const out = `/**\n * ${lang} translations — aggregated from per-module files.\n */\n${imports}\n\nexport const ${lang} = {\n${spread}\n};\n`;
  fs.writeFileSync(path.join(langDir, "index.ts"), out, "utf8");
}

for (const lang of ["tr", "en"]) {
  const { moduleMap, unassigned } = splitLanguage(`${lang}.ts`);
  console.log(`[${lang}] modules: ${[...moduleMap.keys()].sort().join(", ")}`);
  if (unassigned.length > 0) {
    console.log(`[${lang}] UNASSIGNED keys (${unassigned.length}): ${unassigned.join(", ")}`);
    process.exit(1);
  }
  writeModuleFiles(lang, moduleMap);
  writeIndex(lang, moduleMap);
}

for (const f of ["tr.ts", "en.ts"]) {
  const p = path.join(SRC, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log("Done. Split tr/en into modules.");
