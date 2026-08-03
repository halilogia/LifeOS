import type { Note } from "@/types/types.js";

interface WikiAutocompleteProps {
  suggestions: Note[];
  onSelect: (title: string) => void;
}

export function WikiAutocomplete({
  suggestions,
  onSelect,
}: WikiAutocompleteProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "50px",
        left: "20px",
        width: "280px",
        maxHeight: "180px",
        overflowY: "auto",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid var(--accent-color, #a855f7)",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        zIndex: 100,
        padding: "6px",
      }}
    >
      <div
        style={{
          fontSize: "0.72rem",
          color: "#94a3b8",
          padding: "4px 8px",
          fontWeight: 600,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        İç Bağlantı Ekle ([[...]]):
      </div>
      {suggestions.map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => onSelect(n.title)}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "6px 10px",
            background: "transparent",
            border: "none",
            color: "#f8fafc",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.background = "rgba(168, 85, 247, 0.2)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.background = "transparent")
          }
        >
          [[{n.title}]]
        </button>
      ))}
    </div>
  );
}
