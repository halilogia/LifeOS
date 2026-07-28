/**
 * KpssWikiReader.tsx
 * Wikipedia-style Article Reader Component.
 * Displays Article Title, Subtitle, Table of Contents, Wikilink body, and Wikipedia-style Infobox.
 */

import { useState } from "preact/hooks";
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
  const wordCount = note.content ? note.content.split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(wordCount / 150);

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
      <div style={{ display: "grid", gridTemplateColumns: tableOfContents.length > 0 && showToc ? "210px 1fr 230px" : "1fr 230px", gap: "24px" }}>
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

        {/* Right Column: Bilgi Kutusu (Wikipedia Infobox Card) */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            borderRadius: "8px",
            overflow: "hidden",
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Infobox Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.85rem",
              textAlign: "center",
              padding: "8px 12px",
              letterSpacing: "0.02em",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#93c5fd",
              fontWeight: 700,
              fontSize: "0.72rem",
              textAlign: "center",
              padding: "4px 8px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {getSubjectLabel(note.subject)}
          </div>

          {/* Infobox Data Rows */}
          <div style={{ display: "flex", flexDirection: "column", padding: "10px 12px", gap: "8px", fontSize: "0.76rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px" }}>
              <span>Ders Kategori:</span>
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{note.subject.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px" }}>
              <span>Son Güncelleme:</span>
              <span style={{ color: "#f1f5f9" }}>{new Date(note.updatedAt || note.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "4px" }}>
              <span>Kelime Sayısı:</span>
              <span style={{ color: "#f1f5f9" }}>{wordCount} kelime</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Okuma Süresi:</span>
              <span style={{ color: "#f1f5f9" }}>~{readTimeMin} dk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
