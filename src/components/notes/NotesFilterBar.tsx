/**
 * NotesFilterBar.tsx
 * Not kategorilerine göre filtreleme çip butonları.
 */

import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";

export type NoteFilterType = "all" | "note" | "diary" | "cornell" | "quotes";

interface NotesFilterBarProps {
  filterType: NoteFilterType;
  lang: Language;
  onFilterChange: (type: NoteFilterType) => void;
}

export function NotesFilterBar({
  filterType,
  lang,
  onFilterChange,
}: NotesFilterBarProps) {
  const t = getTranslation(lang);
  const filters: { id: NoteFilterType; labelTr: string; labelEn: string }[] = [
    { id: "all", labelTr: "Hepsi", labelEn: "All" },
    { id: "note", labelTr: "Notlar", labelEn: "Notes" },
    { id: "diary", labelTr: "Günlükler", labelEn: "Diary" },
    { id: "cornell", labelTr: "Cornell Notları", labelEn: "Cornell Notes" },
    { id: "quotes", labelTr: "Sözler", labelEn: "Quotes" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {filters.map((f) => (
        <button
          key={f.id}
          className={`add-note-action-btn ${
            filterType === f.id ? "primary" : "secondary"
          }`}
          style={{ padding: "6px 12px", fontSize: "0.82rem", height: "auto" }}
          onClick={() => onFilterChange(f.id)}
        >
          {f.id === "all" ? t.notes_filter_all : f.id === "note" ? t.notes_filter_notes : f.id === "diary" ? t.notes_filter_diary : f.id === "cornell" ? t.notes_filter_cornell : t.notes_filter_quotes}
        </button>
      ))}
    </div>
  );
}
