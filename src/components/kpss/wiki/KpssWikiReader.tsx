/**
 * KpssWikiReader.tsx
 * Makale okuma alanı.
 * 
 * Özellikler:
 * - Başlığın altında Wikipedia tarzı bilgi satırı (konu, okuma süresi, kelime, tarih).
 * - Tek sütunlu makale içeriği + sağ infobox.
 */

import { useMemo } from "preact/hooks";
import { Language } from "@/types/types.js";
import type { KpssWikiNote } from "@/services/kpss/kpssWikiService.js";
import { WikiInfobox } from "./WikiInfobox.js";
import { WikiArticleBody } from "./WikiArticleBody.js";
import { WikiTitleHeader } from "./WikiTitleHeader.js";

interface KpssWikiReaderProps {
  lang: Language;
  t: Record<string, string>;
  note: KpssWikiNote | null;
  allNotes: KpssWikiNote[];
  onWikilinkClick: (e: MouseEvent) => void;
  onSelectNote: (note: KpssWikiNote) => void;
}

export function KpssWikiReader({
  lang: _lang,
  t: _t,
  note,
  allNotes,
  onWikilinkClick,
  onSelectNote,
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

  const displayTitle = note.title || "Ders Notu";

  // Metin metrikleri
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
  const subjectLabel = note.subject || "Tarih";

  // Alt notlar (child notes)
  const childNotes = useMemo(
    () => allNotes.filter((n) => n.parentId === note.id),
    [allNotes, note.id],
  );

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
      {/* Başlık */}
      <WikiTitleHeader displayTitle={displayTitle} />

      {/* Makale Okuma Ekranı — Tek sütunlu düzende metin */}
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
          childNotes={childNotes}
          onWikilinkClick={onWikilinkClick}
          onSelectNote={(childNote) => onSelectNote(childNote)}
        />
      </div>
    </div>
  );
}
