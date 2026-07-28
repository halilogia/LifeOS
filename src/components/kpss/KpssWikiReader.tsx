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
} from "@/services/kpssWikiService.js";

interface KpssWikiReaderProps {
  lang: Language;
  note: KpssWikiNote;
  allNotes: KpssWikiNote[];
  tableOfContents: HeadingItem[];
  onWikilinkClick: (e: MouseEvent) => void;
}

export function KpssWikiReader({
  lang,
  note,
  allNotes,
  tableOfContents,
  onWikilinkClick,
}: KpssWikiReaderProps) {
  const [showToc, setShowToc] = useState(true);

  const displayTitle =
    note.title.trim() || extractTitleFromContent(note.content) || (lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note");

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

          {/* Clean Wikipedia Key-Value Data Rows */}
          <div style={{ display: "flex", flexDirection: "column", padding: "8px 10px", gap: "6px", fontSize: "0.76rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Ders Alanı</span>
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{note.subject.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Son Güncelleme</span>
              <span style={{ color: "#e2e8f0" }}>{new Date(note.updatedAt || note.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>

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
