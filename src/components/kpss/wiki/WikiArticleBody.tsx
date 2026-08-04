import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { renderCustomArticleMarkdown } from "@/services/kpss/kpssWikiService.js";
import { SchemaBuilder } from "@/components/kpss/map/SchemaBuilder.js";

interface WikiArticleBodyProps {
  note: KpssWikiNote;
  allNotes: KpssWikiNote[];
  onWikilinkClick: (e: MouseEvent) => void;
}

export function WikiArticleBody({
  note,
  allNotes,
  onWikilinkClick,
}: WikiArticleBodyProps) {
  // "```sema ... ```" bloklarını ayır; şema blokları SchemaBuilder ile görsel çizilir
  const content = note.content || "";
  const parts = content.split(/```sema\s*\n([\s\S]*?)```/g);

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
      {parts.map((part, idx) => {
        // split sonucu: [text, sema1, text, sema2, ...] — tek indeksler sema bloğu
        if (idx % 2 === 1) {
          const outline = part.trim();
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
        if (!part.trim()) {
          return null;
        }
        return (
          <div
            key={idx}
            dangerouslySetInnerHTML={{
              __html: renderCustomArticleMarkdown(part, allNotes),
            }}
          />
        );
      })}
    </div>
  );
}
