/**
 * HistorySidebar.tsx
 * KPSS Tarih — sol sidebar: brand, ünite seçici butonlar, lejant.
 * Tuval: HistoryMapView.tsx
 */
import type { HistoryUnit } from "@/domain/constants/TurkeyHistoryData.js";

interface HistorySidebarProps {
  units: HistoryUnit[];
  selectedUnitId: string;
  onUnitChange: (id: string) => void;
  unitColor: string;
  legend: { c: string; l: string }[] | null;
  maxHeight: string;
}

export function HistorySidebar({
  units,
  selectedUnitId,
  onUnitChange,
  legend,
  maxHeight,
}: HistorySidebarProps) {
  return (
    <div
      style={{
        width: 250,
        flex: "0 0 250px",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #241a1a, #33221f)",
        color: "#eee8d8",
        padding: "22px 18px",
        borderRadius: "14px",
        overflowY: "auto",
        gap: 16,
        maxHeight,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#c99a3c",
            opacity: 0.85,
          }}
        >
          KPSS · Tarih
        </span>
        <h1
          style={{
            fontFamily: "'Iowan Old Style','Palatino Linotype',Georgia,serif",
            fontSize: 19,
            margin: "2px 0 0",
            fontWeight: 600,
            lineHeight: 1.25,
            color: "#fbf3e2",
          }}
        >
          1. Ünite: Anadolu Selçuklu
        </h1>
      </div>

      {/* Ünite Butonları */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
        {units.map((u) => {
          const isActive = u.id === selectedUnitId;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onUnitChange(u.id)}
              style={{
                textAlign: "left",
                background: isActive
                  ? "rgba(181,67,47,0.2)"
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? "1px solid #b5432f"
                  : "1px solid rgba(255,255,255,0.08)",
                color: isActive ? "#ffe4da" : "#d9d2bf",
                padding: "11px 12px",
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontFamily: "'Segoe UI',sans-serif",
                transition: "background .15s, border-color .15s, transform .1s",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isActive ? "#b5432f" : "#6f665a",
                  flex: "0 0 auto",
                  boxShadow: isActive ? "0 0 0 3px rgba(181,67,47,0.2)" : "none",
                }}
              />
              {u.navLabel}
            </button>
          );
        })}
      </div>

      {/* Lejant */}
      {legend && legend.length > 0 && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 14,
            fontSize: 11.5,
            color: "#c8bda6",
          }}
        >
          <b style={{ display: "block", color: "#efe4cf", fontSize: 12, marginBottom: 8 }}>
            Renkler
          </b>
          {legend.map((row, idx) => (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: row.c,
                  border: "1px solid rgba(0,0,0,0.25)",
                  flex: "0 0 auto",
                }}
              />
              {row.l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
