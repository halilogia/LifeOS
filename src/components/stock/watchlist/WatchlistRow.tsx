import type { StockQuote } from "@/types/bist.js";
import { formatPrice } from "@/services/bistService.js";
import {
  IconChart,
  IconPlus,
  IconSparkles,
} from "@/components/stock/portfolio/portfolioIcons.js";

interface WatchlistRowProps {
  symbol: string;
  quote: StockQuote | undefined;
  onOpenChart: (symbol: string) => void;
  onAddRuleClick: (symbol: string) => void;
  onAiAnalyzeClick: (symbol: string) => void;
}

export function WatchlistRow({
  symbol,
  quote,
  onOpenChart,
  onAddRuleClick,
  onAiAnalyzeClick,
}: WatchlistRowProps) {
  const hasLivePrice = Boolean(quote && quote.price > 0);
  const currentPrice = hasLivePrice ? quote!.price : 0;
  const changePct = hasLivePrice ? quote!.changePercent : 0;
  const isTavan = changePct >= 9.5;
  const isPositive = changePct >= 0;

  return (
    <tr key={symbol}>
      <td
        style={{ textAlign: "left", cursor: "pointer" }}
        onClick={() => onOpenChart(symbol)}
        title="Grafik Görüntüle"
      >
        <div style={{ fontWeight: 700, color: "#f8fafc" }}>{symbol}</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          {quote?.shortName || symbol}
        </div>
      </td>
      <td style={{ textAlign: "right", fontWeight: 600 }}>
        {hasLivePrice ? formatPrice(currentPrice) : "—"}
      </td>
      <td style={{ textAlign: "center" }}>
        <span
          className={`stock-card-badge ${
            !hasLivePrice
              ? "stock-badge-neutral"
              : isTavan
                ? "stock-badge-tavan"
                : isPositive
                  ? "stock-badge-positive"
                  : "stock-badge-negative"
          }`}
        >
          {!hasLivePrice
            ? "0.00% (Açılış Bekleniyor)"
            : `${isTavan ? "Tavan " : ""}${isPositive ? "+" : ""}${changePct.toFixed(2)}%`}
        </span>
      </td>
      <td style={{ textAlign: "right", color: "#cbd5e1" }}>
        {quote?.dayHigh && quote.dayHigh > 0 ? formatPrice(quote.dayHigh) : "—"}
      </td>
      <td style={{ textAlign: "right", color: "#cbd5e1" }}>
        {quote?.dayLow && quote.dayLow > 0 ? formatPrice(quote.dayLow) : "—"}
      </td>
      <td
        style={{
          textAlign: "right",
          color: "#94a3b8",
          fontSize: "0.85rem",
        }}
      >
        {quote?.volume && quote.volume > 0
          ? `${(quote.volume / 1_000_000).toFixed(1)} M ₺`
          : "—"}
      </td>
      <td style={{ textAlign: "right" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "6px",
          }}
        >
          <button
            className="stock-btn stock-btn-secondary"
            onClick={() => onOpenChart(symbol)}
            title="Canlı Grafik Görüntüle"
            style={{ padding: "6px 10px" }}
          >
            <IconChart />
            <span style={{ fontSize: "0.75rem" }}>Grafik</span>
          </button>
          <button
            className="stock-btn stock-btn-secondary"
            onClick={() => onAddRuleClick(symbol)}
            title="Fiyat Alarmı Ekle"
            style={{ padding: "6px 10px" }}
          >
            <IconPlus />
            <span style={{ fontSize: "0.75rem" }}>Alarm</span>
          </button>
          <button
            className="stock-btn stock-btn-ai"
            onClick={() => onAiAnalyzeClick(symbol)}
            title="AI Analiz & Danışman"
            style={{ padding: "6px 10px" }}
          >
            <IconSparkles />
            <span style={{ fontSize: "0.75rem" }}>AI</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
