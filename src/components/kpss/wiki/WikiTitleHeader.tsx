import { useState } from "preact/hooks";
import type { HeadingItem } from "@/services/kpss/kpssWikiService.js";
import { IconList } from "../kpssIcons.js";

interface WikiTitleHeaderProps {
  displayTitle: string;
  /** İçindekiler listesi (boşsa ikon gizlenir) */
  tableOfContents?: HeadingItem[];
  /** Bir başlığa tıklanınca çağrılır (index) */
  onNavigate?: (index: number) => void;
  /** İçindekileri sol kenar çubuğuna sabitlemek için çağrılır */
  onPin?: () => void;
}

export function WikiTitleHeader({
  displayTitle,
  tableOfContents = [],
  onNavigate,
  onPin,
}: WikiTitleHeaderProps) {
  const [tocOpen, setTocOpen] = useState(false);
  const hasToc = tableOfContents.length > 0;

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        paddingBottom: "10px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* İçindekiler (liste) ikonu — başlığın SOLUNDA, Wikipedia tarzı açılır panel */}
        {hasToc && (
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            title="İçindekiler"
            aria-label="İçindekiler"
            style={{
              background: tocOpen
                ? "rgba(96, 165, 250, 0.25)"
                : "rgba(255, 255, 255, 0.06)",
              border: tocOpen
                ? "1px solid rgba(96, 165, 250, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.12)",
              color: "#60a5fa",
              borderRadius: "8px",
              padding: "6px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              flex: "0 0 auto",
            }}
          >
            {/* Madde işaretli liste ikonu */}
            <IconList size={16} strokeWidth={2.2} />
          </button>
        )}

        <h1
          style={{
            fontSize: "2.1rem",
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "-0.015em",
          }}
        >
          {displayTitle}
        </h1>
      </div>

      {/* Açılır İçindekiler paneli */}
      {tocOpen && hasToc && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 6,
            background: "rgba(15, 23, 42, 0.97)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            padding: "10px 12px",
            maxWidth: 340,
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 50,
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: "0.78rem",
              color: "#cbd5e1",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: 6,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>İçindekiler</span>
            {onPin && (
              <button
                type="button"
                onClick={() => {
                  setTocOpen(false);
                  onPin();
                }}
                title="Kenar çubuğuna taşı"
                aria-label="Kenar çubuğuna taşı"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                📌
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                  {/* Ağaç dalı: alt başlıklar üst başlığa bağlı görünür */}
                  {isSub && (
                    <div
                      style={{
                        width: 12,
                        position: "relative",
                        flex: "0 0 auto",
                        borderLeft: "1.5px solid rgba(96, 165, 250, 0.35)",
                        marginLeft: (depth - 1) * 10,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          width: 10,
                          height: 1.5,
                          background: "rgba(96, 165, 250, 0.35)",
                        }}
                      />
                    </div>
                  )}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTocOpen(false);
                      onNavigate?.(idx);
                    }}
                    style={{
                      color: isSub ? "#7da7d9" : "#94a3b8",
                      fontSize: isSub ? "0.72rem" : "0.76rem",
                      fontWeight: isSub ? 500 : 600,
                      textDecoration: "none",
                      paddingLeft: isSub ? 6 : 0,
                      paddingRight: 4,
                      paddingTop: 2,
                      paddingBottom: 2,
                      borderRadius: 4,
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      minWidth: 0,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#60a5fa")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = isSub
                        ? "#7da7d9"
                        : "#94a3b8")
                    }
                  >
                    <span style={{ color: "#475569", marginRight: 6, fontSize: "0.68rem" }}>
                      {idx + 1}
                    </span>
                    {item.text}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
