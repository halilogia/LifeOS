import type { JSX } from "preact";
import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { renderCustomArticleMarkdown } from "@/services/kpss/kpssWikiService.js";
import { SchemaBuilder } from "@/components/kpss/map/SchemaBuilder.js";
import { HaritaBlock } from "@/components/kpss/map/MapBuilder.js";

interface WikiArticleBodyProps {
  note: KpssWikiNote;
  allNotes: KpssWikiNote[];
  onWikilinkClick: (e: MouseEvent) => void;
}

interface SplitPart {
  type: "text" | "sema" | "harita";
  value: string;
  /** Blok içindeki ilk satır — şema/harita başlığı (opsiyonel) */
  title: string;
}

/** Markdown'ı "```sema" ve "```harita" bloklarına göre böler */
function splitBlocks(content: string): SplitPart[] {
  const parts: SplitPart[] = [];
  const re = /```(sema|harita)\s*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) {
      parts.push({
        type: "text",
        value: content.slice(last, m.index),
        title: "",
      });
    }
    const raw = m[2].trim();
    // Blok ilk satırı "# Başlık" şeklindeyse başlık sayılır (markdown işaretiyle)
    const lines = raw.split("\n");
    const first = lines[0].trim();
    let title = "";
    let body = raw;
    if (first.startsWith("#")) {
      title = first.replace(/^#+\s*/, "").trim();
      body = lines.slice(1).join("\n").trim();
    }
    parts.push({
      type: m[1] as "sema" | "harita",
      value: body,
      title,
    });
    last = m.index + m[0].length;
  }
  if (last < content.length) {
    // Kalan metin: "|flag|" içeren satırlar (blok işareti olmadan kaydedilmiş eski harita verisi)
    const rest = content.slice(last);
    if (/^\s*[^|\n]+\|[^|\n]*\|[^|\n]*\|[\d.]+\|[\d.]+\s*$/m.test(rest)) {
      parts.push({ type: "harita", value: rest.trim(), title: "" });
    } else {
      parts.push({ type: "text", value: rest, title: "" });
    }
  }
  return parts;
}

export function WikiArticleBody({
  note,
  allNotes,
  onWikilinkClick,
}: WikiArticleBodyProps) {
  const content = note.content || "";
  const parts = splitBlocks(content);

  const renderPart = (part: SplitPart, idx: number): JSX.Element | null => {
    if (part.type === "sema") {
      const outline = part.value;
      if (!outline) {
        return null;
      }
      return (
        <div
          key={idx}
          style={{
            margin: "16px 0",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <SchemaBuilder outline={outline} title={part.title} />
        </div>
      );
    }
    if (part.type === "harita") {
      const pinData = part.value;
      if (!pinData) {
        return null;
      }
      return (
        <div
          key={idx}
          style={{
            margin: "16px 0",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <HaritaBlock
            content={"```harita\n" + pinData + "\n```"}
            title={part.title}
          />
        </div>
      );
    }
    if (!part.value.trim()) {
      return null;
    }
    return (
      <div
        key={idx}
        dangerouslySetInnerHTML={{
          __html: renderCustomArticleMarkdown(part.value, allNotes, note.title),
        }}
      />
    );
  };

  return (
    <div
      style={{
        color: "#f1f5f9",
        fontSize: "0.98rem",
        lineHeight: 1.85,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
      onClick={onWikilinkClick}
    >
      {parts.map(renderPart)}
    </div>
  );
}
