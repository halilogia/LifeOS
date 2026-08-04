/**
 * WikiTitleHeader.tsx
 * Ders notu başlığı ve İçindekiler ikonu.
 * 
 * Özellikler:
 * - İkon başlığın hemen SOLUNDA aynı hizada yer alır.
 * - İkona tıklandığında önüne floating Popup paneli açılır (sabitlenme yok, sadece popup).
 * - Popup içinde "X" kapatma ikonu bulunur.
 */

import { useState } from "preact/hooks";
import type { HeadingItem } from "@/services/kpss/kpssWikiService.js";
import { IconList } from "../kpssIcons.js";

interface WikiTitleHeaderProps {
  displayTitle: string;
  /** İçindekiler listesi */
  tableOfContents?: HeadingItem[];
  /** Bir başlığa tıklanınca çağrılır */
  onNavigate?: (index: number) => void;
}

export function WikiTitleHeader({
  displayTitle,
  tableOfContents = [],
  onNavigate,
}: WikiTitleHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hasToc = tableOfContents.length > 0;

  return (
    <div
      style={{
        borderBottom: "1px solid var(--card-border)",
        paddingBottom: "14px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* İçindekiler İkonu — Başlığın HEMEN SOLUNDA */}
        {hasToc && (
          <button
            type="button"
            onClick={() => {
              setDropdownOpen((prev) => !prev);
            }}
            title="İçindekiler"
            aria-label="İçindekiler"
            style={{
              background:
                dropdownOpen
                  ? "rgba(139, 92, 246, 0.25)"
                  : "rgba(255, 255, 255, 0.05)",
              border:
                dropdownOpen
                  ? "1px solid rgba(139, 92, 246, 0.5)"
                  : "1px solid var(--card-border)",
              color: dropdownOpen ? "#c084fc" : "var(--text-secondary)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              minWidth: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              marginTop: "4px",
            }}
          >
            <IconList size={18} strokeWidth={2.2} />
          </button>
        )}

        {/* Ana Başlık */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.25,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "-0.015em",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "normal",
            flex: 1,
            minWidth: 0,
          }}
        >
          {displayTitle}
        </h1>
      </div>

      {/* Açılır Popover İçindekiler (Sadece Popup) */}
      {dropdownOpen && hasToc && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            background: "rgba(18, 18, 26, 0.98)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            padding: "12px 14px",
            maxWidth: "220px",
            width: "55%",
            maxHeight: "340px",
            overflowY: "auto",
            zIndex: 100,
            backdropFilter: "blur(16px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#c084fc",
              borderBottom: "1px solid var(--card-border)",
              paddingBottom: "8px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>İçindekiler</span>
            {/* Kapatma X İkonu */}
            <button
              type="button"
              onClick={() => setDropdownOpen(false)}
              title="Kapat"
              aria-label="Kapat"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
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
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      onNavigate?.(idx);
                    }}
                    style={{
                      color: isSub ? "var(--text-secondary)" : "#e2e8f0",
                      fontSize: isSub ? "0.78rem" : "0.84rem",
                      fontWeight: isSub ? 400 : 600,
                      textDecoration: "none",
                      paddingLeft: isSub ? `${depth * 12}px` : "0px",
                      paddingTop: "4px",
                      paddingBottom: "4px",
                      borderRadius: "6px",
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
