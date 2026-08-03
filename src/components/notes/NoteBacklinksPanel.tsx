import type { Note } from "@/types/types.js";

interface NoteBacklinksPanelProps {
  backlinks: Note[];
}

export function NoteBacklinksPanel({ backlinks }: NoteBacklinksPanelProps) {
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "10px 14px",
        background: "rgba(15, 23, 42, 0.4)",
        borderRadius: "10px",
        border: "1px solid rgba(168, 85, 247, 0.2)",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#c084fc",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        Bağlantılı Notlar (Backlinks - {backlinks.length}):
      </div>
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginTop: "6px",
        }}
      >
        {backlinks.map((b) => (
          <span
            key={b.id}
            style={{
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(168, 85, 247, 0.15)",
              color: "#e0e7ff",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              fontWeight: 600,
            }}
          >
            [[{b.title}]]
          </span>
        ))}
      </div>
    </div>
  );
}
