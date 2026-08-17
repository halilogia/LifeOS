/**
 * KpssQuestionStem.tsx
 * ÖSYM tarzı soru kökü gösterimi.
 * - "I.", "II.", "III." ile başlayan maddeler dikey olarak alt alta sıralanır.
 * - "değildir", "yapılamaz", "yanlış" gibi olumsuzluk ifadeleri altı çizili ve
 *   vurgulu (koyu) renkte gösterilir.
 * - Matematik ($...$) ifadeleri KaTeX ile render edilir (renderRichText ortak kullanılır).
 */

import { renderRichText } from "@/components/kpss/quiz/MathRenderer.js";
import type { VNode } from "preact";

interface KpssQuestionStemProps {
  text: string;
}

// ÖSYM olumsuzluk/çeldirici ipuçları — bunlar altı çizilir ve vurgulanır.
const NEGATION_CUES = [
  "değildir",
  "değildir?",
  "yapılamaz",
  "yapılmaz",
  "yanlıştır",
  "yanlış",
  "olamaz",
  "bulunmaz",
  "değildir:",
  "aşağıdakilerden hangisi değildir",
];

const ROMAN_RE =
  /^\s*(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))[.)]\s+/;

function splitRomanItems(body: string): string[] {
  // Madde başlarını (I., II., ...) yakala; metni parçalara böl.
  const lines = body.split(/\r?\n/);
  const items: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.trim().length > 0) {
      items.push(buffer.trim());
    }
    buffer = "";
  };

  for (const line of lines) {
    if (ROMAN_RE.test(line)) {
      flush();
      buffer = line.trim();
    } else if (buffer.length > 0) {
      buffer += "\n" + line;
    } else {
      buffer = line;
    }
  }
  flush();

  // Tek paragraf içinde "I. ... II. ..." yan yana ise ayıkla.
  if (items.length === 1 && ROMAN_RE.test(items[0])) {
    const matches = items[0].match(
      /(M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))[.)]\s+[^I]*?(?=(?:M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}))[.)]|$)/g,
    );
    if (matches && matches.length > 1) {
      return matches.map((m) => m.trim());
    }
  }

  return items;
}

function renderWithCues(segment: string, key: string): VNode | string {
  const lower = segment.toLowerCase();
  const matched = NEGATION_CUES.filter((cue) =>
    lower.includes(cue.toLowerCase()),
  ).sort((a, b) => b.length - a.length);

  if (matched.length === 0) {
    return <span key={key}>{segment}</span>;
  }

  // Longest cue ile parçala.
  const cue = matched[0];
  const cueIdx = lower.indexOf(cue.toLowerCase());
  const before = segment.slice(0, cueIdx);
  const cueText = segment.slice(cueIdx, cueIdx + cue.length);
  const after = segment.slice(cueIdx + cue.length);

  return (
    <span key={key}>
      {before}
      <span
        style={{
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          fontWeight: 800,
          color: "var(--text-primary)",
          borderBottom: "2px solid var(--accent-color)",
          paddingBottom: "1px",
        }}
      >
        {cueText}
      </span>
      {after}
    </span>
  );
}

export function KpssQuestionStem({ text }: KpssQuestionStemProps) {
  if (!text) {
    return null;
  }

  const items = splitRomanItems(text);

  // Roman maddesi yoksa düz zengin metin (negatif ipuçlarıyla).
  if (items.length <= 1) {
    return (
      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
        {renderRichText(text, renderWithCues)}
      </div>
    );
  }

  return (
    <div
      style={{
        fontWeight: 600,
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {items.map((item, idx) => (
        <div
          key={`item-${idx}`}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            lineHeight: 1.55,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              minWidth: "28px",
              fontWeight: 800,
              color: "var(--accent-color)",
            }}
          >
            {item.match(ROMAN_RE)?.[1] ?? `${idx + 1}.`}
          </span>
          <span style={{ flex: 1 }}>
            {renderRichText(item.replace(ROMAN_RE, ""), renderWithCues)}
          </span>
        </div>
      ))}
    </div>
  );
}
