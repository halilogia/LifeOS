import type { BISTSearchResult, StockQuote } from "@/types/bist.js";
import { formatPrice } from "@/services/bistService.js";
import { IconPlus, IconSparkles } from "./searchIcons.js";

interface SearchResultCardProps {
  item: BISTSearchResult;
  quoteMap: Map<string, StockQuote>;
  onQuickAddStock: (symbolClean: string) => void;
  onOpenChart: (symbolClean: string) => void;
  onOpenAiModal: (symbolClean: string) => void;
}

export function SearchResultCard({
  item,
  quoteMap,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: SearchResultCardProps) {
  const symClean = item.cleanSymbol;
  const liveQ = quoteMap.get(symClean);
  const isPos = liveQ ? liveQ.changePercent >= 0 : true;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "10px",
        background: "var(--card-bg, rgba(30, 41, 59, 0.6))",
        border: "1px solid var(--card-border, rgba(255, 255, 255, 0.05))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: "6px",
            background: "var(--stock-badge-bg, rgba(99, 102, 241, 0.2))",
            color: "var(--stock-accent, #818cf8)",
          }}
        >
          {symClean}
        </span>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontWeight: 600,
              color: "var(--text-primary, #f8fafc)",
              fontSize: "0.92rem",
            }}
          >
            {item.shortName}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary, #94a3b8)",
            }}
          >
            {item.sector || "BIST"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {liveQ ? (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 700,
                color: "var(--text-primary, #f8fafc)",
                fontSize: "0.95rem",
              }}
            >
              {formatPrice(liveQ.price)}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isPos
                  ? "var(--stock-up, #4ade80)"
                  : "var(--stock-down, #f87171)",
              }}
            >
              {isPos ? "+" : ""}
              {liveQ.changePercent.toFixed(2)}%
            </div>
          </div>
        ) : (
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted, #64748b)",
            }}
          >
            BIST 100
          </span>
        )}

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="stock-btn stock-btn-primary"
            style={{ padding: "5px 10px", fontSize: "0.78rem" }}
            onClick={() => onQuickAddStock(symClean)}
          >
            <IconPlus />
            <span>+ Portföye Ekle</span>
          </button>
          <button
            className="stock-btn stock-btn-secondary"
            style={{ padding: "5px 10px", fontSize: "0.78rem" }}
            onClick={() => onOpenChart(symClean)}
          >
            Grafik
          </button>
          <button
            className="stock-btn stock-btn-ai"
            style={{ padding: "5px 10px", fontSize: "0.78rem" }}
            onClick={() => onOpenAiModal(symClean)}
          >
            <IconSparkles />
            <span>AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
