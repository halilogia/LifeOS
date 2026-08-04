/**
 * KpssWikiReader.tsx
 * Makale okuma alanı.
 * 
 * Özellikler:
 * - İkon başlığın hemen SOLUNDA aynı hizada yer alır.
 * - İkona tıklandığında z-index'li floating Popup olarak açılır (sabitlenme yok, sadece popup).
 */

import { useMemo } from "preact/hooks";
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
  onNavigateToc?: (index: number) => void;
}

export function KpssWikiReader({
  lang: _lang,
  t: _t,
  note,
  allNotes,
  tableOfContents: externalToc,
  onWikilinkClick,
  onNavigateToc,
}: KpssWikiReaderProps) {
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
    if (onNavigateToc) {
      onNavigateToc(index);
      return;
    }
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
      {/* Başlık Satırı — Sol tarafında yazısız İçindekiler ikonu */}
      <WikiTitleHeader
        displayTitle={displayTitle}
        tableOfContents={tableOfContents}
        onNavigate={handleTocNavigate}
      />

      {/* Makale Okuma Ekranı — İçi daraltılmayan temiz 2 sütunlu düzen (Metin + Infobox) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px",
          gap: "24px",
          alignItems: "start",
        }}
      >
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
