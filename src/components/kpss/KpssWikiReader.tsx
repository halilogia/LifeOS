/**
 * KpssWikiReader.tsx
 * Presentational Article Reader Component.
 * Displays Title, Table of Contents, Wikilink-interactive body, and Infobox card.
 */

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
  const displayTitle =
    note.title.trim() || extractTitleFromContent(note.content) || (lang === "tr" ? "Başlıksız Ders Notu" : "Untitled Note");
  const wordCount = note.content ? note.content.split(/\s+/).length : 0;
  const readTimeMin = Math.ceil(wordCount / 150);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1, overflowY: "auto", paddingRight: "6px" }}>
      {/* Article Title & Subtitle Header */}
      <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", paddingBottom: "10px" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#ffffff", margin: 0, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>
          {displayTitle}
        </h1>
        <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic", marginTop: "4px" }}>
          Kişisel KPSS Ders Notu & Konu Özeti
        </div>
      </div>

      {/* Reader Grid Layout (Left TOC + Center Content + Right Infobox) */}
      <div style={{ display: "grid", gridTemplateColumns: tableOfContents.length > 0 ? "200px 1fr 220px" : "1fr 220px", gap: "22px" }}>
        {/* Left Panel: İçindekiler (Table of Contents) */}
        {tableOfContents.length > 0 && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "12px 14px",
              height: "fit-content",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "0.78rem", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px", marginBottom: "10px" }}>
              İçindekiler
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
                    paddingLeft: `${(item.level - 1) * 8}px`,
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

        {/* Center Column: Article Body with Interactive Wikilinks */}
        <div
          style={{
            color: "#f1f5f9",
            fontSize: "0.96rem",
            lineHeight: 1.8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
          onClick={onWikilinkClick}
          dangerouslySetInnerHTML={{ __html: renderCustomArticleMarkdown(note.content, allNotes) }}
        />

        {/* Right Column: Bilgi Kutusu (Infobox) */}
        <div
          style={{
            background: "rgba(30, 41, 59, 0.55)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            borderRadius: "12px",
            padding: "14px",
            height: "fit-content",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.82rem",
              textAlign: "center",
              padding: "7px 10px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
          >
            {getSubjectLabel(note.subject)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.76rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Kategori:</span>
              <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{note.subject.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
              <span>Son Güncelleme:</span>
              <span style={{ color: "#f1f5f9" }}>{new Date(note.updatedAt || note.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
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
