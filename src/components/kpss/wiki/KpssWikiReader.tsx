/**
 * KpssWikiReader.tsx
 * Wikipedia tarzı makale okuma ve içindekiler menüsü.
 * 
 * Tema Standardı:
 * - Mor/Violet Accent renk tonları
 * - Sıfır emoji (❌, 📌 kaldırılmıştır)
 * - Sol kenar çubuğunda açılan/gizlenen Wikipedia tarzı İçindekiler menüsü
 */

import { useState, useMemo } from "preact/hooks";
import { Language } from "@/types/types.js";
import type { KpssWikiNote, HeadingItem } from "@/services/kpss/kpssWikiService.js";
import { extractHeadings } from "@/services/kpss/kpssWikiService.js";
import { WikiInfobox } from "./WikiInfobox.js";
import { WikiArticleBody } from "./WikiArticleBody.js";
import { WikiTitleHeader } from "./WikiTitleHeader.js";

interface KpssWikiReaderProps {
  lang: Language;
  t: Record<string, string>;
  note: KpssWikiNote | null;
  allNotes: KpssWikiNote[];
  tableOfContents?: HeadingItem[];
  onWikilinkClick: (e: MouseEvent) => void;
}

export function KpssWikiReader({
  lang: _lang,
  t: _t,
  note,
  allNotes,
  tableOfContents: externalToc,
  onWikilinkClick,
}: KpssWikiReaderProps) {
  // Sol kenar çubuğunda İçindekiler sabitlenmiş mi?
  const [tocPinned, setTocPinned] = useState(false);

  if (!note) {
    return (
      <div
        className="kpss-auto-planner-card"
        style={{
          width: "100%",
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
        }}
      >
        Lütfen incelemek istediğiniz bir ders notu seçiniz.
      </div>
    );
  }

  // Not içeriğinden başlıkları ayrıştır veya prop'tan al
  const tableOfContents = useMemo(
    () => externalToc || extractHeadings(note.content || ""),
    [externalToc, note.content],
  );

  const displayTitle = note.title || "Ders Notu";

  const handleTocNavigate = (index: number) => {
    const item = tableOfContents[index];
    if (!item) return;

    const headings = Array.from(document.querySelectorAll("h2, h3, h4"));
    const target = headings.find(
      (h) => h.textContent && h.textContent.includes(item.text),
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pinnedToc = tableOfContents.length > 0 && tocPinned;

  // Infobox için metin metrikleri
  const contentText = note.content || "";
  const wordCount = useMemo(
    () => contentText.trim().split(/\s+/).filter(Boolean).length,
    [contentText],
  );
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Geri bağlantılar (backlinks)
  const backlinks = useMemo(() => {
    return allNotes.filter(
      (other) =>
        other.id !== note.id &&
        other.content?.toLowerCase().includes(`[[${note.title.toLowerCase()}]]`),
    );
  }, [allNotes, note]);

  const rawNote = note as unknown as Record<string, unknown>;
  const imageUrl = (rawNote.imageUrl as string) || null;
  const outboundWikilinks = (rawNote.wikilinks as string[]) || [];

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
      {/* Article Title Header — Sol tarafta Wikipedia tarzı İçindekiler ikonu/butonu */}
      <WikiTitleHeader
        displayTitle={displayTitle}
        tableOfContents={tableOfContents}
        onNavigate={handleTocNavigate}
        onToggleSidebar={() => setTocPinned((p) => !p)}
        isSidebarPinned={pinnedToc}
      />

      {/* Wikipedia Reader Grid (Sol İçindekiler Kenar Çubuğu + İçerik + Sağ Infobox) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: pinnedToc ? "220px 1fr 240px" : "1fr 240px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Sol Kenar Çubuğu: Wikipedia Tarzı İçindekiler Paneli */}
        {pinnedToc && (
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "rgba(18, 18, 26, 0.75)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              padding: "12px 14px",
              maxHeight: "calc(100vh - 160px)",
              overflowY: "auto",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 700,
                fontSize: "0.82rem",
                color: "#c084fc",
                borderBottom: "1px solid var(--card-border)",
                paddingBottom: "8px",
                marginBottom: "10px",
              }}
            >
              <span>İçindekiler</span>
              <button
                type="button"
                onClick={() => setTocPinned(false)}
                title="Gizle"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "4px",
                  color: "var(--text-secondary)",
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                gizle
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {tableOfContents.map((item, idx) => {
                const depth = item.level - 1;
                const isSub = depth > 0;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      position: "relative",
                    }}
                  >
                    {isSub && (
                      <div
                        style={{
                          width: 10,
                          position: "relative",
                          flex: "0 0 auto",
                          borderLeft: "1.5px solid rgba(139, 92, 246, 0.35)",
                          marginLeft: (depth - 1) * 8,
                        }}
                      />
                    )}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTocNavigate(idx);
                      }}
                      style={{
                        color: isSub ? "var(--text-secondary)" : "#e2e8f0",
                        fontSize: isSub ? "0.76rem" : "0.8rem",
                        fontWeight: isSub ? 400 : 600,
                        textDecoration: "none",
                        paddingLeft: isSub ? "4px" : "0px",
                        paddingTop: "3px",
                        paddingBottom: "3px",
                        borderRadius: "4px",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        minWidth: 0,
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "#c084fc")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = isSub
                          ? "var(--text-secondary)"
                          : "#e2e8f0")
                      }
                    >
                      <span
                        style={{
                          color: "#64748b",
                          marginRight: "6px",
                          fontSize: "0.7rem",
                        }}
                      >
                        {idx + 1}.
                      </span>
                      {item.text}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ana Makale İçeriği */}
        <WikiArticleBody
          note={note}
          allNotes={allNotes}
          onWikilinkClick={onWikilinkClick}
        />

        {/* Sağ Bilgi Kutusu (Infobox) */}
        <WikiInfobox
          note={note}
          displayTitle={displayTitle}
          subject={note.subject || "Tarih"}
          imageUrl={imageUrl}
          readingTimeMinutes={readingTimeMinutes}
          wordCount={wordCount}
          updatedAt={note.updatedAt || Date.now()}
          outboundWikilinks={outboundWikilinks}
          backlinks={backlinks}
          onWikilinkClick={onWikilinkClick}
        />
      </div>
    </div>
  );
}
