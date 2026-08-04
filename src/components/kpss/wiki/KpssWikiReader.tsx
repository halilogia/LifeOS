/**
 * KpssWikiReader.tsx
 * Wikipedia-style Article Reader Component.
 * Tuval: state + memo'lar + 4 parçanın kompozisyonu (WikiTitleHeader, WikiTocColumn, WikiArticleBody, WikiInfobox).
 */
import { useState, useMemo } from "preact/hooks";
import { Language } from "@/types/types.js";
import {
  KpssWikiNote,
  HeadingItem,
  extractTitleFromContent,
  extractFirstImageUrl,
} from "@/services/kpss/kpssWikiService.js";
import { WikiTitleHeader } from "./WikiTitleHeader.js";
import { WikiTocColumn } from "./WikiTocColumn.js";
import { WikiArticleBody } from "./WikiArticleBody.js";
import { WikiInfobox } from "./WikiInfobox.js";

interface KpssWikiReaderProps {
  lang: Language;
  t: Record<string, string>;
  note: KpssWikiNote;
  allNotes: KpssWikiNote[];
  tableOfContents: HeadingItem[];
  onWikilinkClick: (e: MouseEvent) => void;
}

export function KpssWikiReader({
  lang,
  t,
  note,
  allNotes,
  tableOfContents,
  onWikilinkClick,
}: KpssWikiReaderProps) {
  const [showToc, setShowToc] = useState(true);

  const displayTitle =
    note.title.trim() || extractTitleFromContent(note.content) || "";

  // Extract first image URL for Infobox Featured Media
  const imageUrl = useMemo(() => {
    return extractFirstImageUrl(note.content);
  }, [note.content]);

  // Extract key-value summary pairs from content lines containing ":" (only concise metadata, not prose)
  const keySummaryRows = useMemo(() => {
    if (!note || !note.content) {
      return [];
    }
    const lines = note.content.split("\n");
    const rows: { key: string; val: string }[] = [];

    for (const l of lines) {
      const trimmed = l.trim();
      if (
        !trimmed ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("http") ||
        trimmed.startsWith("![")
      ) {
        continue;
      }
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        const key = trimmed
          .slice(0, colonIdx)
          .replace(/^[-*_`\s]+/, "")
          .trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        // Strict filter: value must be a concise fact (<= 40 chars) and not a full sentence
        if (
          key &&
          val &&
          key.length < 25 &&
          val.length <= 40 &&
          !val.includes(". ")
        ) {
          rows.push({ key, val });
          if (rows.length >= 5) {
            break;
          }
        }
      }
    }
    return rows;
  }, [note.content]);

  // Extract outbound wikilinks from article content [[Target Title]]
  const outboundWikilinks = useMemo(() => {
    if (!note || !note.content) {
      return [];
    }
    const regex = /\[\[(.*?)\]\]/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(note.content)) !== null) {
      const title = match[1].trim();
      if (title && !matches.includes(title)) {
        matches.push(title);
      }
    }
    return matches;
  }, [note.content]);

  // Calculate word count & estimated reading time
  const wordCount = useMemo(() => {
    if (!note || !note.content) {
      return 0;
    }
    return note.content.trim().split(/\s+/).filter(Boolean).length;
  }, [note.content]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  // Calculate Backlinks: find other notes that reference this note's title
  const backlinks = useMemo(() => {
    if (!note || !note.title || note.title.trim().length < 3) {
      return [];
    }
    const cleanTitle = note.title.trim().toLowerCase();
    return allNotes.filter((n) => {
      if (n.id === note.id) {
        return false;
      }
      return n.content.toLowerCase().includes(cleanTitle);
    });
  }, [note, allNotes]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        flex: 1,
        overflowY: "auto",
        paddingRight: "6px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Article Title Header */}
      <WikiTitleHeader displayTitle={displayTitle} />

      {/* Wikipedia Reader Grid (Left TOC + Center Content + Right Infobox) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            tableOfContents.length > 0 && showToc
              ? "210px 1fr 220px"
              : "1fr 220px",
          gap: "24px",
        }}
      >
        {/* Left Column: İçindekiler */}
        {tableOfContents.length > 0 && showToc && (
          <WikiTocColumn
            tableOfContents={tableOfContents}
            onHide={() => setShowToc(false)}
          />
        )}

        {/* Center Column: Article Body */}
        <WikiArticleBody
          note={note}
          allNotes={allNotes}
          onWikilinkClick={onWikilinkClick}
        />

        {/* Right Column: Infobox Card */}
        <WikiInfobox
          note={note}
          displayTitle={displayTitle}
          subject={note.subject}
          imageUrl={imageUrl}
          keySummaryRows={keySummaryRows}
          readingTimeMinutes={readingTimeMinutes}
          wordCount={wordCount}
          updatedAt={note.updatedAt || note.createdAt}
          outboundWikilinks={outboundWikilinks}
          backlinks={backlinks}
          onWikilinkClick={onWikilinkClick}
        />
      </div>
    </div>
  );
}
