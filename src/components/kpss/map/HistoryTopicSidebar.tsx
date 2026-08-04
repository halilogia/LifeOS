/**
 * HistoryTopicSidebar.tsx
 * Ünite seçici sidebar — coğrafya MapTopicSidebar stili.
 */
import type { HistoryUnit } from "@/domain/constants/TurkeyHistoryData.js";

interface HistoryTopicSidebarProps {
  units: HistoryUnit[];
  selectedUnitId: string;
  onSelect: (id: string) => void;
}

export function HistoryTopicSidebar({
  units,
  selectedUnitId,
  onSelect,
}: HistoryTopicSidebarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 170,
        maxWidth: 200,
        background: "rgba(15, 23, 42, 0.55)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 14,
        padding: 10,
        alignSelf: "flex-start",
      }}
    >
      {units.map((u) => {
        const active = u.id === selectedUnitId;
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onSelect(u.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: active ? "rgba(255,255,255,0.1)" : "transparent",
              border: active ? `1px solid ${u.color}` : "1px solid transparent",
              borderRadius: 9,
              padding: "8px 10px",
              color: active ? "#ffffff" : "#94a3b8",
              fontSize: "0.78rem",
              fontWeight: active ? 800 : 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: u.color,
                flex: "0 0 auto",
              }}
            />
            {u.navLabel}
          </button>
        );
      })}
    </div>
  );
}
