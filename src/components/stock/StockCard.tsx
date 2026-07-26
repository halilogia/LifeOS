import {
  StockQuote,
  POPULAR_BIST_STOCKS,
  formatPrice,
  formatVolume,
  formatMarketCap,
} from "@/services/bistService.js";

interface StockCardProps {
  quote: StockQuote;
  t: any;
  onClick: () => void;
}

export function StockCard({ quote, t: _t, onClick }: StockCardProps) {
  const meta = POPULAR_BIST_STOCKS.find((s) => s.symbol === quote.symbol);
  const sector = meta?.sector ?? "";

  const isPositive = quote.changePercent >= 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30, 41, 59, 0.65)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.2)",
              color: "#818cf8",
            }}
          >
            {quote.symbol.replace(".IS", "")}
          </span>
          <h4 style={{ margin: "6px 0 0", fontSize: "1rem", color: "#f8fafc" }}>
            {quote.shortName}
          </h4>
          {sector && (
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              {sector}
            </div>
          )}
        </div>
        <span
          className={`stock-card-badge ${isPositive ? "stock-badge-positive" : "stock-badge-negative"}`}
        >
          {isPositive ? "+" : ""}
          {quote.changePercent.toFixed(2)}%
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "4px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Son Fiyat</div>
          <div
            style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f8fafc" }}
          >
            {formatPrice(quote.price)}
          </div>
        </div>

        <div
          style={{ textAlign: "right", fontSize: "0.75rem", color: "#94a3b8" }}
        >
          <div>Hacim: {formatVolume(quote.volume)}</div>
          <div>P.Değeri: {formatMarketCap(quote.marketCap)}</div>
        </div>
      </div>
    </div>
  );
}
