import { IconPlus, IconSparkles } from "./searchIcons.js";

interface NoResultCardProps {
  searchQuery: string;
  onQuickAddStock: (symbolClean: string) => void;
  onOpenChart: (symbolClean: string) => void;
  onOpenAiModal: (symbolClean: string) => void;
}

export function NoResultCard({
  searchQuery,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: NoResultCardProps) {
  const customSym = searchQuery.trim().toUpperCase();
  const isValidTicker = /^[A-Z0-9]{3,7}$/.test(customSym);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.88rem" }}>
        "{searchQuery}" aramasıyla eşleşen canlı BİST hissesi bulunamadı.
      </div>
      {isValidTicker && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px dashed rgba(99, 102, 241, 0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: "6px",
                background: "rgba(99, 102, 241, 0.25)",
                color: "#c084fc",
              }}
            >
              {customSym}
            </span>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontWeight: 700,
                  color: "white",
                  fontSize: "0.9rem",
                }}
              >
                {customSym} BIST Hissesi
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Borsa İstanbul
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="stock-btn stock-btn-primary"
              style={{ padding: "6px 12px", fontSize: "0.78rem" }}
              onClick={() => onQuickAddStock(customSym)}
            >
              <IconPlus />
              <span>+ Portföye Ekle</span>
            </button>
            <button
              className="stock-btn stock-btn-secondary"
              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
              onClick={() => onOpenChart(customSym)}
            >
              Grafik
            </button>
            <button
              className="stock-btn stock-btn-ai"
              style={{ padding: "6px 10px", fontSize: "0.78rem" }}
              onClick={() => onOpenAiModal(customSym)}
            >
              <IconSparkles />
              <span>AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
