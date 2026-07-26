/**
 * NotesFilterBar.tsx
 * Not kategorilerine göre filtreleme çip butonları.
 */

export type NoteFilterType = "all" | "note" | "diary" | "cornell" | "quotes";

interface NotesFilterBarProps {
  filterType: NoteFilterType;
  lang: string;
  onFilterChange: (type: NoteFilterType) => void;
}

export function NotesFilterBar({
  filterType,
  lang,
  onFilterChange,
}: NotesFilterBarProps) {
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
          {lang === "tr" ? f.labelTr : f.labelEn}
        </button>
      ))}
    </div>
  );
}
