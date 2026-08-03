import type { StockQuote } from "@/types/bist.js";
import { IconBookmark, IconPlus, IconChart, IconSparkles } from "./kesfetIcons.js";

interface KesfetTickerCardProps {
  t: Record<string, string>;
  fullSym: string;
  quoteMap: Map<string, StockQuote>;
  onWatchlistModal: (symbol: string) => void;
  onQuickAddStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
  onOpenAiModal: (symbol: string) => void;
}

export function KesfetTickerCard({
  t,
  fullSym,
  quoteMap,
  onWatchlistModal,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: KesfetTickerCardProps) {
  const symClean = fullSym.replace(".IS", "");
  const quote = quoteMap.get(symClean) || quoteMap.get(fullSym);

  const price = quote ? quote.price : null;
  const changePercent = quote ? quote.changePercent : 0;
  const isUp = changePercent >= 0;
  const companyName =
    quote?.shortName ||
    t.stock_company_name_fallback.replace("{symbol}", symClean);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header: Ticker & Price */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "white" }}>
              {symClean}
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                color: "#94a3b8",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              BIST
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
            {companyName}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "white" }}>
            {price !== null ? `₺${price.toFixed(2)}` : "—"}
          </div>
          {quote && (
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: isUp ? "#10b981" : "#ef4444",
              }}
            >
              {isUp ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          paddingTop: "8px",
        }}
      >
        <button
          onClick={() => onWatchlistModal(symClean)}
          style={{
            background: "rgba(139, 92, 246, 0.15)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "6px",
            color: "#c084fc",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "5px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title={t.stock_add_watchlist}
        >
          <IconBookmark />
        </button>

        <button
          onClick={() => onQuickAddStock(symClean)}
          style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "6px",
            color: "#818cf8",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "5px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title={t.stock_add_portfolio}
        >
          <IconPlus />
          <span>{t.stock_add_portfolio}</span>
        </button>

        <button
          onClick={() => onOpenChart(symClean)}
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            color: "#e2e8f0",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "5px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title={t.stock_chart}
        >
          <IconChart />
        </button>

        <button
          onClick={() => onOpenAiModal(symClean)}
          style={{
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "6px",
            color: "#c084fc",
            fontSize: "0.72rem",
            fontWeight: 600,
            padding: "5px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title={t.stock_ai_analysis}
        >
          <IconSparkles />
        </button>
      </div>
    </div>
  );
}
