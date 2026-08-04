/**
 * KpssWikiReader.tsx
 * Wikipedia-style Article Reader Component.
 * Tuval: state + memo'lar + 4 parçanın kompozisyonu (WikiTitleHeader, WikiArticleBody, WikiInfobox).
 */
import { useMemo, useState } from "preact/hooks";
import { Language } from "@/types/types.js";
import {
  KpssWikiNote,
  HeadingItem,
  extractTitleFromContent,
  extractFirstImageUrl,
} from "@/services/kpss/kpssWikiService.js";
import { WikiTitleHeader } from "./WikiTitleHeader.js";
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
  const [tocPinned, setTocPinned] = useState(false);
  const displayTitle =
    note.title.trim() || extractTitleFromContent(note.content) || "";

  // Extract first image URL for Infobox Featured Media
  const imageUrl = useMemo(() => {
    return extractFirstImageUrl(note.content);
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

  const handleTocNavigate = (idx: number) => {
    const item = tableOfContents[idx];
    if (!item) {
      return;
    }
    // İçerikte başlık metnini bul ve kaydır
    const headings = Array.from(document.querySelectorAll("h2, h3, h4"));
    const target = headings.find(
      (h) => h.textContent && h.textContent.includes(item.text),
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Kenar çubuğuna sabitlenmiş İçindekiler
  const pinnedToc = tableOfContents.length > 0 && tocPinned;

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
      {/* Article Title Header — sağda İçindekiler ikonu */}
      <WikiTitleHeader
        displayTitle={displayTitle}
        tableOfContents={tableOfContents}
        onNavigate={handleTocNavigate}
        onPin={() => setTocPinned(true)}
      />

      {/* Wikipedia Reader Grid (Left Pinned TOC + Content + Right Infobox) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: pinnedToc ? "200px 1fr 220px" : "1fr 220px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Sol Kenar Çubuğu: Sabitlenmiş İçindekiler */}
        {pinnedToc && (
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "rgba(15, 23, 42, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px 12px",
              maxHeight: "calc(100vh - 160px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 800,
                fontSize: "0.78rem",
                color: "#cbd5e1",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: 6,
                marginBottom: 8,
              }}
            >
              <span>İçindekiler</span>
              <button
                type="button"
                onClick={() => setTocPinned(false)}
                title="Kenar çubuğundan kaldır"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ❌
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tableOfContents.map((item, idx) => {
                const depth = item.level - 1;
                const isSub = depth > 0;
                return (
                  <div
                    key={idx}
                    style={{ display: "flex", alignItems: "stretch", position: "relative" }}
                  >
                    {isSub && (
                      <div
                        style={{
                          width: 12,
                          position: "relative",
                          flex: "0 0 auto",
                          borderLeft: "1.5px solid rgba(96, 165, 250, 0.35)",
                          marginLeft: (depth - 1) * 10,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            width: 10,
                            height: 1.5,
                            background: "rgba(96, 165, 250, 0.35)",
                          }}
                        />
                      </div>
                    )}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTocNavigate(idx);
                      }}
                      style={{
                        color: isSub ? "#7da7d9" : "#94a3b8",
                        fontSize: isSub ? "0.71rem" : "0.75rem",
                        fontWeight: isSub ? 500 : 600,
                        textDecoration: "none",
                        paddingLeft: isSub ? 6 : 0,
                        paddingRight: 4,
                        paddingTop: 2,
                        paddingBottom: 2,
                        borderRadius: 4,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        flex: 1,
                        minWidth: 0,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#60a5fa")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = isSub
                          ? "#7da7d9"
                          : "#94a3b8")
                      }
                    >
                      <span style={{ color: "#475569", marginRight: 5, fontSize: "0.66rem" }}>
                        {idx + 1}
                      </span>
                      {item.text}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
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
