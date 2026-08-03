import type { StockQuote } from "@/types/bist.js";
import { formatPrice } from "@/services/bistService.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";
import { IconChart, IconPlus, IconSparkles, IconSell } from "./portfolioIcons.js";

interface PortfolioRowProps {
  item: StockPortfolioItem;
  quoteMap: Map<string, StockQuote>;
  rules: StockRule[];
  onAddRuleClick: (symbol: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onDeleteItem: (id: string) => void;
  onSellItem: (
    id: string,
    symbol: string,
    currentLot: number,
    currentPrice: number,
  ) => void;
  onAiAnalyzeClick: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export function PortfolioRow({
  item,
  quoteMap,
  rules,
  onAddRuleClick,
  onDeleteRule,
  onDeleteItem,
  onSellItem,
  onAiAnalyzeClick,
  onOpenChart,
}: PortfolioRowProps) {
  const sym = item.symbol.replace(/\.IS$/, "").toUpperCase();
  const quote = quoteMap.get(sym);
  const hasLivePrice = Boolean(quote && quote.price > 0);
  const currentPrice = hasLivePrice ? quote!.price : item.buyPrice;
  const changePct = hasLivePrice ? quote!.changePercent : 0;
  const isTavan = changePct >= 9.5;
  const isPositive = changePct >= 0;
  const totalVal = currentPrice * item.lotCount;
  const costVal = item.buyPrice * item.lotCount;
  const profit = hasLivePrice ? totalVal - costVal : 0;
  const profitPct = hasLivePrice && costVal > 0 ? (profit / costVal) * 100 : 0;
  const symbolRules = rules.filter(
    (r) =>
      r.symbol.replace(/\.IS$/, "").toUpperCase() === sym && r.isActive,
  );

  return (
    <tr key={item.id}>
      <td
        style={{ textAlign: "left", cursor: "pointer" }}
        onClick={() => onOpenChart(sym)}
        title="Grafik Görüntüle"
      >
        <div style={{ fontWeight: 700, color: "#f8fafc" }}>{sym}</div>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          {item.displayName}
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
      <td style={{ textAlign: "right" }}>
        {item.buyPrice > 0 ? formatPrice(item.buyPrice) : "—"}
      </td>
      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        <span
          style={{
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.06)",
            color: "#e2e8f0",
            fontSize: "0.85rem",
          }}
        >
          {item.lotCount.toLocaleString("tr-TR")} Lot
        </span>
      </td>
      <td style={{ textAlign: "right", fontWeight: 600 }}>
        {formatPrice(totalVal)}
      </td>
      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        <span
          className={
            !hasLivePrice
              ? "stock-badge-neutral"
              : profit >= 0
                ? "stock-badge-positive"
                : "stock-badge-negative"
          }
        >
          {!hasLivePrice
            ? "0,00 ₺ (0.00%)"
            : `${profit >= 0 ? "+" : ""}${formatPrice(profit)} (${profitPct.toFixed(1)}%)`}
        </span>
      </td>
      <td>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {symbolRules.length > 0 ? (
            symbolRules.map((r) => (
              <span
                key={r.id}
                style={{
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#818cf8",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>
                  {r.ruleType === "PRICE_ABOVE"
                    ? `Fiyat > ₺${r.targetValue}`
                    : r.ruleType === "PRICE_BELOW"
                      ? `Fiyat < ₺${r.targetValue}`
                      : r.ruleType === "RED_CANDLE"
                        ? "Kırmızı Mum"
                        : r.ruleType === "TAVAN_BREAK"
                          ? "Tavan Bozdu"
                          : r.ruleType === "STOP_LOSS"
                            ? `Stop %${r.targetValue}`
                            : r.ruleType === "TAKE_PROFIT"
                              ? `KarAl %${r.targetValue}`
                              : `İzleyenStop %${r.targetValue}`}
                </span>
                {onDeleteRule && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRule(r.id);
                    }}
                    title="Alarmı / Kuralı Kaldır"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      padding: "0 2px",
                      lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                )}
              </span>
            ))
          ) : (
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Alarm Yok
            </span>
          )}
        </div>
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
            onClick={() => onOpenChart(sym)}
            title="Canlı Grafik Görüntüle"
            style={{ padding: "6px 10px" }}
          >
            <IconChart />
            <span style={{ fontSize: "0.75rem" }}>Grafik</span>
          </button>
          <button
            className="stock-btn stock-btn-secondary"
            onClick={() => onAddRuleClick(sym)}
            title="Fiyat Alarmı Ekle"
            style={{ padding: "6px 10px" }}
          >
            <IconPlus />
            <span style={{ fontSize: "0.75rem" }}>Alarm</span>
          </button>
          <button
            className="stock-btn stock-btn-ai"
            onClick={() => onAiAnalyzeClick(sym)}
            title="AI Analiz & Danışman"
            style={{ padding: "6px 10px" }}
          >
            <IconSparkles />
            <span style={{ fontSize: "0.75rem" }}>AI</span>
          </button>
          <button
            className="stock-btn stock-btn-danger"
            onClick={() => onSellItem(item.id, sym, item.lotCount, currentPrice)}
            title="Satış Yap"
            style={{ padding: "6px 10px" }}
          >
            <IconSell />
            <span style={{ fontSize: "0.75rem" }}>Sat</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
