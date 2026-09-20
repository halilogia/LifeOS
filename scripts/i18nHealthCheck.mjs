/**
 * i18nHealthCheck.mjs
 *
 * Bu hata sınıfı bu projede tekrar tekrar ortaya çıktı: kod `t.bir_anahtar`
 * çağırıyor ama anahtar tr/en dosyalarında hiç tanımlı olmuyor.
 *
 * Neden sessiz kalıyor:
 *   - SettingsDrawer gibi yerlerde `translations[lang]` doğrudan kullanılınca
 *     eksik anahtar `undefined` döner → etiket TAMAMEN BOŞ görünür.
 *   - `getTranslation()` Proxy kullanılan yerlerde anahtar adı döner →
 *     ekranda "detox_you_could_achieve" gibi teknik metin görünür.
 *   - `t.x || "fallback"` deseni de kurtarmaz: Proxy truthy string döndürdüğü
 *     için fallback HİÇ çalışmaz.
 *
 * Bu script, `t.<key>` çağrılarını toplayıp tanımlı anahtar kümesiyle
 * karşılaştırır. `t` değişkeni başka amaçla kullanılan dosyaları (döngü
 * değişkeni `t: Todo`) atlamak için bir deny-list uygular.
 *
 * Kullanım:
 *   node scripts/i18nHealthCheck.mjs
 *   node scripts/i18nHealthCheck.mjs --all   (deny-list'i yok say)
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const INCLUDE_ALL = process.argv.includes("--all");

/**
 * `t` burada bir çeviri nesnesi DEĞİL; bu dosyalarda `t` bir domain nesnesini
 * (Todo, hisse işlemi, konu) temsil eden döngü değişkenidir. Bunları atlıyoruz.
 */
const FALSE_POSITIVE_FILES = [
  "components/eisenhower/EisenhowerQuadrantCard.tsx",
  "components/eisenhower/EisenhowerUnclassifiedSidePanel.tsx",
  "components/stock/portfolio/StockTradeHistoryModal.tsx",
  "components/kpss/planner/KpssAutoPlannerCard.tsx",
  "components/CalendarView.tsx",
  "presentation/hooks/useCalendar.ts",
  "presentation/hooks/useEisenhower.ts",
  "presentation/hooks/useCityPulse.ts",
  "application/use-cases/sync/SyncGoogleTasksUseCase.ts",
  "application/use-cases/sync/RestoreFromDriveUseCase.ts",
  "background/handlers/alarmNotificationHandler.ts",
  "domain/services/KpssCalculatorService.ts",
  "domain/services/routineStreakCalculator.ts",
  "infrastructure/persistence/repositories/ChromeStorageTodoRepository.ts",
  "services/cityPulseService.ts",
  "services/kpss/kpssService.ts",
  "services/kpss/kpssQuizFlowService.ts",
  "services/stock/stockAiService.ts",
  "services/stock/stockPrompts.ts",
  "presentation/store/kpssQuizStore.ts",
  "utils/kpssChartCalculations.ts",
  "components/kpss/quiz/KpssQuizResultStep.tsx",
  "components/notes/ZettelkastenGraphModal.tsx",
];

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

// ── 1) Tanımlı anahtarları topla ────────────────────────────────────────
const keys = new Set();
for (const langDir of ["tr", "en"]) {
  const dir = path.join(SRC, "utils/translations", langDir);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".ts") || f === "index.ts") continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/^\s{2}([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm)) {
      keys.add(m[1]);
    }
  }
}

// ── 2) t.<key> kullanımlarını tara ──────────────────────────────────────
const codeFiles = walk(SRC, [".ts", ".tsx"]).filter(
  (f) => !f.includes("translations"),
);
const missing = new Map();

for (const abs of codeFiles) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const relToSrc = rel.replace(/^src\//, "");
  if (!INCLUDE_ALL && FALSE_POSITIVE_FILES.includes(relToSrc)) continue;

  const src = fs.readFileSync(abs, "utf8");
  // Yerel bir `t` çeviri nesnesi mi? (const t = ... veya props'tan t)
  const usesTranslationT =
    /\bconst t = (getTranslation|translations)/.test(src) ||
    /^\s*t[,:]/m.test(src) ||
    /\bt:\s*Record<string,\s*string>/.test(src) ||
    /\{ t[,}]/.test(src) ||
    /\bt\.\w+/.test(src);
  if (!usesTranslationT) continue;

  for (const m of src.matchAll(/\bt\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g)) {
    const k = m[1];
    // DOM/standart nesne yanlış pozitiflerini ele
    if (/^(length|name|id|value|text|type|map|filter|push|slice|includes|indexOf|toString|toLowerCase|charAt|trim|split|join|replace|find|some|every|reduce|forEach|sort|concat|createElement|getElementById|querySelector|appendChild|remove|addEventListener|style|body|head|tagName|className|children|parentNode|dataset|dispatchEvent|attachShadow|shadowRoot|textContent|innerHTML|setAttribute|getAttribute|key|id_|status|title|description|category|completed|due|notes|urgent|important|count|dueDate|symbol|buyPrice|sellPrice|soldAt|lotCount|realizedProfit|realizedProfitPercent|focus|short|long|refresh|willpower_days)$/.test(
      k,
    )
    ) {
      continue;
    }
    if (!keys.has(k)) {
      if (!missing.has(k)) missing.set(k, new Set());
      missing.get(k).add(relToSrc);
    }
  }
}

// ── 3) Rapor ────────────────────────────────────────────────────────────
console.log("=== i18n SAĞLIK KONTROLÜ ===");
console.log(`Tanımlı anahtar: ${keys.size}`);
console.log(`Taranan dosya : ${codeFiles.length}`);
console.log("");

if (missing.size === 0) {
  console.log("✅ Eksik anahtar bulunamadı.");
  process.exit(0);
}

console.log(`❌ ${missing.size} adet eksik anahtar:\n`);
for (const [k, files] of [...missing.entries()].sort()) {
  console.log(`  t.${k}`);
  for (const f of files) console.log(`      ${f}`);
}
console.log("");
console.log(
  "Not: Eksik anahtar Proxy üzerinden geçiyorsa ekranda anahtar adı görünür;",
);
console.log(
  "doğrudan `translations[lang]` üzerinden geçiyorsa etiket tamamen boş kalır.",
);
process.exit(1);
