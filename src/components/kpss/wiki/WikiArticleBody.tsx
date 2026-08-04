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
}

/** Markdown'ı "```sema" ve "```harita" bloklarına göre böler */
function splitBlocks(content: string): SplitPart[] {
  const parts: SplitPart[] = [];
  const re = /```(sema|harita)\s*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: content.slice(last, m.index) });
    }
    parts.push({ type: m[1] as "sema" | "harita", value: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < content.length) {
    parts.push({ type: "text", value: content.slice(last) });
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
          <SchemaBuilder outline={outline} title={note.title} />
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
            title={note.title}
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
          __html: renderCustomArticleMarkdown(part.value, allNotes),
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
