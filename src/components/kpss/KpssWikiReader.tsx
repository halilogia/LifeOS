/**
 * KpssWikiReader.tsx
 * Wikipedia-style Article Reader Component.
 * Displays Article Title, Subtitle, Table of Contents, Wikilink body, and Wikipedia-style Infobox.
 */

import { useState, useMemo } from "preact/hooks";
import { Language } from "@/types/types.js";
import {
  KpssWikiNote,
  HeadingItem,
  getSubjectLabel,
  renderCustomArticleMarkdown,
  extractTitleFromContent,
  extractFirstImageUrl,
} from "@/services/kpssWikiService.js";

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
    note.title.trim() || extractTitleFromContent(note.content) || t.kpss_wiki_untitled;

  // Extract first image URL for Infobox Featured Media
  const imageUrl = useMemo(() => {
    return extractFirstImageUrl(note.content);
  }, [note.content]);

  // Extract key-value summary pairs from content lines containing ":" (only concise metadata, not prose)
  const keySummaryRows = useMemo(() => {
    if (!note || !note.content) return [];
    const lines = note.content.split("\n");
    const rows: { key: string; val: string }[] = [];

    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("http") || trimmed.startsWith("![")) continue;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0 && colonIdx < 30) {
        const key = trimmed.slice(0, colonIdx).replace(/^[\-\*\_\`\s]+/, "").trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        // Strict filter: value must be a concise fact (<= 40 chars) and not a full sentence
        if (key && val && key.length < 25 && val.length <= 40 && !val.includes(". ")) {
          rows.push({ key, val });
          if (rows.length >= 5) break;
        }
      }
    }
    return rows;
  }, [note.content]);

  // Extract outbound wikilinks from article content [[Target Title]]
  const outboundWikilinks = useMemo(() => {
    if (!note || !note.content) return [];
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
    if (!note || !note.content) return 0;
    return note.content.trim().split(/\s+/).filter(Boolean).length;
  }, [note.content]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [wordCount]);

  // Calculate Backlinks: find other notes that reference this note's title
  const backlinks = useMemo(() => {
    if (!note || !note.title || note.title.trim().length < 3) return [];
    const cleanTitle = note.title.trim().toLowerCase();
    return allNotes.filter((n) => {
      if (n.id === note.id) return false;
      return n.content.toLowerCase().includes(cleanTitle);
    });
  }, [note, allNotes]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1, overflowY: "auto", paddingRight: "6px" }}>
      {/* Article Title Header */}
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.15)", paddingBottom: "10px" }}>
        <h1
          style={{
            fontSize: "2.1rem",
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "-0.015em",
          }}
        >
          {displayTitle}
        </h1>
      </div>

      {/* Wikipedia Reader Grid (Left TOC + Center Content + Right Infobox) */}
      <div style={{ display: "grid", gridTemplateColumns: tableOfContents.length > 0 && showToc ? "210px 1fr 220px" : "1fr 220px", gap: "24px" }}>
        {/* Left Column: İçindekiler (Wikipedia Table of Contents) */}
        {tableOfContents.length > 0 && showToc && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "12px 14px",
              height: "fit-content",
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
                paddingBottom: "6px",
                marginBottom: "10px",
              }}
            >
              <span>İçindekiler</span>
              <button
                type="button"
                onClick={() => setShowToc(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#60a5fa",
                  fontSize: "0.68rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                gizle
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {tableOfContents.map((item, idx) => (
                <a
                  key={idx}
                  href={`#head-${idx}`}
                  style={{
                    color: "#60a5fa",
                    fontSize: "0.76rem",
                    textDecoration: "none",
                    paddingLeft: `${(item.level - 1) * 10}px`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {idx + 1}. {item.text}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Center Column: Wikipedia Article Body with Interactive Blue Wikilinks */}
        <div
          style={{
            color: "#f1f5f9",
            fontSize: "0.98rem",
            lineHeight: 1.85,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
          onClick={onWikilinkClick}
          dangerouslySetInnerHTML={{ __html: renderCustomArticleMarkdown(note.content, allNotes) }}
        />

        {/* Right Column: Bilgi Kutusu (Authentic Wikipedia Infobox Card) */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "6px",
            overflow: "hidden",
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Authentic Wikipedia Infobox Header */}
          <div
            style={{
              background: "rgba(30, 41, 59, 0.9)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.88rem",
              textAlign: "center",
              padding: "10px 12px 4px 12px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              background: "rgba(30, 41, 59, 0.9)",
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "0.72rem",
              textAlign: "center",
              paddingBottom: "8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {getSubjectLabel(note.subject)}
          </div>

          {/* Infobox Featured Image (Wikipedia Map / Photo) */}
          {imageUrl && (
            <div
              style={{
                padding: "8px",
                background: "rgba(0, 0, 0, 0.4)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                textAlign: "center",
              }}
            >
              <img
                src={imageUrl}
                alt={displayTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "180px",
                  borderRadius: "4px",
                  objectFit: "cover",
                  display: "block",
                  margin: "0 auto",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Clean Wikipedia Key-Value & Article Stats */}
          <div style={{ display: "flex", flexDirection: "column", padding: "10px", gap: "6px", fontSize: "0.74rem" }}>
            {/* Dynamic key-value summary rows extracted from note text (strictly short metadata) */}
            {keySummaryRows.map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  paddingBottom: "4px",
                }}
              >
                <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.7rem" }}>{row.key}</span>
                <span style={{ color: "#e2e8f0", fontSize: "0.72rem", fontWeight: 500 }}>{row.val}</span>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Okuma Süresi</span>
              <span style={{ color: "#60a5fa", fontWeight: 600 }}>~{readingTimeMinutes} dk</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Metin Boyutu</span>
              <span style={{ color: "#e2e8f0" }}>{wordCount} kelime</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Son Güncelleme</span>
              <span style={{ color: "#e2e8f0" }}>{new Date(note.updatedAt || note.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>

          {/* Outbound Wikilinks / İç Bağlantılar Section */}
          {outboundWikilinks.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "0.74rem",
                background: "rgba(15, 23, 42, 0.4)",
              }}
              onClick={onWikilinkClick}
            >
              <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>📌 İç Bağlantılar</span>
                <span style={{ background: "rgba(59, 130, 246, 0.25)", color: "#60a5fa", padding: "1px 5px", borderRadius: "10px", fontSize: "0.65rem" }}>
                  {outboundWikilinks.length}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {outboundWikilinks.map((title, idx) => (
                  <span
                    key={idx}
                    data-wiki-link={title}
                    style={{
                      color: "#60a5fa",
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Backlinks / Gelen Bağlantılar Section */}
          {backlinks.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "8px 10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "0.74rem",
                background: "rgba(30, 41, 59, 0.4)",
              }}
              onClick={onWikilinkClick}
            >
              <div style={{ color: "#94a3b8", fontWeight: 700, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>🔗 Gelen Bağlantılar</span>
                <span style={{ background: "rgba(59, 130, 246, 0.25)", color: "#60a5fa", padding: "1px 5px", borderRadius: "10px", fontSize: "0.65rem" }}>
                  {backlinks.length}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {backlinks.map((bl) => (
                  <span
                    key={bl.id}
                    data-wiki-link={bl.title}
                    style={{
                      color: "#60a5fa",
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {bl.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
