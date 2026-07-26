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

export function StockCard({ quote, t, onClick }: StockCardProps) {
  const meta = POPULAR_BIST_STOCKS.find((s) => s.symbol === quote.symbol);
  const sector = meta?.sector ?? "";

  const direction = quote.error
    ? "neutral"
    : quote.change > 0
      ? "positive"
      : quote.change < 0
        ? "negative"
        : "neutral";

  const changeSign = quote.change > 0 ? "+" : "";

  return (
    <div
      class={`stock-card ${direction} ${quote.error ? "error-card" : ""}`}
      onClick={onClick}
    >
      {/* Header */}
      <div class="stock-card-header">
        <div class="stock-symbol-group">
          <span class="stock-symbol">{quote.symbol.replace(".IS", "")}</span>
          <span class="stock-company-name">{quote.shortName}</span>
        </div>
        {sector && <span class="stock-sector-tag">{sector}</span>}
      </div>

      {/* Price */}
      <div class="stock-price-block">
        {quote.error ? (
          <span class="stock-price error-price">—</span>
        ) : (
          <span class="stock-price">
            {formatPrice(quote.price, quote.currency)}
          </span>
        )}
        {!quote.error && (
          <div class="stock-change-row">
            <span
              class={`stock-change-value ${direction === "positive" ? "stock-arrow-up" : direction === "negative" ? "stock-arrow-down" : ""}`}
            >
              {changeSign}
              {formatPrice(quote.change, quote.currency)}
            </span>
            <span class="stock-change-pct">
              {changeSign}
              {quote.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      {!quote.error && (
        <div class="stock-meta">
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_high}</span>
            <span class="stock-meta-value">
              {formatPrice(quote.dayHigh, quote.currency)}
            </span>
          </div>
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_low}</span>
            <span class="stock-meta-value">
              {formatPrice(quote.dayLow, quote.currency)}
            </span>
          </div>
          <div class="stock-meta-row">
            <span class="stock-meta-label">{t.stock_volume}</span>
            <span class="stock-meta-value">{formatVolume(quote.volume)}</span>
          </div>
          {quote.marketCap && (
            <div class="stock-meta-row">
              <span class="stock-meta-label">{t.stock_market_cap}</span>
              <span class="stock-meta-value">
                {formatMarketCap(quote.marketCap)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
