import type { HeadingItem } from "@/services/kpss/kpssWikiService.js";

interface WikiTocColumnProps {
  tableOfContents: HeadingItem[];
  onHide: () => void;
}

export function WikiTocColumn({
  tableOfContents,
  onHide,
}: WikiTocColumnProps) {
  return (
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
          onClick={onHide}
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
      <div
        style={{ display: "flex", flexDirection: "column", gap: "6px" }}
      >
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
  );
}
