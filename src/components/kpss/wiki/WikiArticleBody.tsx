import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { renderCustomArticleMarkdown } from "@/services/kpss/kpssWikiService.js";

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
  return (
    <div
      style={{
        color: "#f1f5f9",
        fontSize: "0.98rem",
        lineHeight: 1.85,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onClick={onWikilinkClick}
      dangerouslySetInnerHTML={{
        __html: renderCustomArticleMarkdown(note.content, allNotes),
      }}
    />
  );
}
