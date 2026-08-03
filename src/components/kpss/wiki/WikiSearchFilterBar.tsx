export const SUBJECT_FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "tarih", label: "Tarih" },
  { id: "cografya", label: "Coğrafya" },
  { id: "vatandaslik", label: "Vatandaşlık" },
  { id: "turkce", label: "Türkçe" },
  { id: "matematik", label: "Matematik" },
];

interface WikiSearchFilterBarProps {
  t: Record<string, string>;
  searchQuery: string;
  selectedSubjectFilter: string;
  onSearchChange: (q: string) => void;
  onFilterChange: (subject: string) => void;
  onCreateNewNote: () => void;
}

export function WikiSearchFilterBar({
  t,
  searchQuery,
  selectedSubjectFilter,
  onSearchChange,
  onFilterChange,
  onCreateNewNote,
}: WikiSearchFilterBarProps) {
  return (
    <>
      {/* Create New Note Button */}
      <button
        type="button"
        onClick={onCreateNewNote}
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          padding: "9px 14px",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          transition: "all 0.2s ease",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>{t.kpss_wiki_new_note}</span>
      </button>

      {/* Search Box */}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={searchQuery}
          onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
          placeholder={t.kpss_wiki_search}
          style={{
            width: "100%",
            background: "rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            padding: "8px 10px 8px 30px",
            color: "#ffffff",
            fontSize: "0.78rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          style={{ position: "absolute", left: "10px", top: "10px" }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      {/* Subject Filter Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {SUBJECT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            style={{
              background:
                selectedSubjectFilter === f.id
                  ? "#2563eb"
                  : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${
                selectedSubjectFilter === f.id
                  ? "#3b82f6"
                  : "rgba(255, 255, 255, 0.06)"
              }`,
              color: selectedSubjectFilter === f.id ? "#ffffff" : "#94a3b8",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}
