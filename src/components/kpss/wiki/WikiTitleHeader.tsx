/**
 * WikiTitleHeader.tsx
 * Ders notu başlığı ve İçindekiler tetikleyici paneli.
 * 
 * Düzeltmeler:
 * - Kelime kesintilerini önleme (word-break: break-word, sığmayan kelime alt satıra geçer)
 * - Buton ile başlık üst üste binmez (temiz dikey akış)
 * - 1. 2. madde numaraları kaldırılmıştır (sadece alt not ve başlık metinleri görünür)
 */

import { useState } from "preact/hooks";
import type { HeadingItem } from "@/services/kpss/kpssWikiService.js";
import { IconList } from "../kpssIcons.js";

interface WikiTitleHeaderProps {
  displayTitle: string;
  /** İçindekiler / Alt Notlar listesi */
  tableOfContents?: HeadingItem[];
  /** Bir başlığa tıklanınca çağrılır */
  onNavigate?: (index: number) => void;
  /** Kenar çubuğuna sabitleme / açma toggle */
  onToggleSidebar?: () => void;
  isSidebarPinned?: boolean;
}

export function WikiTitleHeader({
  displayTitle,
  tableOfContents = [],
  onNavigate,
  onToggleSidebar,
  isSidebarPinned = false,
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
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* İçindekiler Butonu */}
        {hasToc && (
          <button
            type="button"
            onClick={() => {
              if (onToggleSidebar) {
                onToggleSidebar();
              } else {
                setDropdownOpen((prev) => !prev);
              }
            }}
            title="İçindekiler / Alt Notlar"
            aria-label="İçindekiler"
            style={{
              background:
                isSidebarPinned || dropdownOpen
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(255, 255, 255, 0.04)",
              border:
                isSidebarPinned || dropdownOpen
                  ? "1px solid rgba(139, 92, 246, 0.45)"
                  : "1px solid var(--card-border)",
              color: isSidebarPinned || dropdownOpen ? "#c084fc" : "var(--text-secondary)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            <IconList size={16} strokeWidth={2.2} />
            <span>İçindekiler</span>
          </button>
        )}

        {/* Ana Başlık - Kelime Bölünmesini Önleme */}
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
            width: "100%",
          }}
        >
          {displayTitle}
        </h1>
      </div>

      {/* Açılır Popover İçindekiler / Alt Notlar */}
      {dropdownOpen && !isSidebarPinned && hasToc && (
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
            maxWidth: "340px",
            width: "90%",
            maxHeight: "360px",
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
            <span>İçindekiler / Alt Notlar</span>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onToggleSidebar?.();
              }}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--card-border)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                fontSize: "0.72rem",
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              Sol panele sabitle
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
