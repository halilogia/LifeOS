/**
 * StockWatchlistTable.tsx
 * Takip edilen / alınan BIST hisselerinin canlı fiyat tablosu parçası.
 */

import type { StockQuote } from "@/services/bistService.js";
import { formatPrice } from "@/services/bistService.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";

interface StockWatchlistTableProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
  rules: StockRule[];
  onAddRuleClick: (symbol: string) => void;
  onDeleteItem: (id: string) => void;
  onAiAnalyzeClick: (symbol: string) => void;
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function StockWatchlistTable({
  portfolio,
  quotes,
  rules,
  onAddRuleClick,
  onDeleteItem,
  onAiAnalyzeClick,
}: StockWatchlistTableProps) {
  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    quoteMap.set(q.symbol.replace(/\.IS$/, "").toUpperCase(), q);
  }

  return (
    <div className="stock-table-container">
      <table className="stock-table">
        <thead>
          <tr>
            <th>Hisse</th>
            <th>Son Fiyat</th>
            <th>Günlük %</th>
            <th>Alış Fiyatı</th>
            <th>Adet (Lot)</th>
            <th>Toplam Değer</th>
            <th>Kar / Zarar</th>
            <th>Aktif Kurallar</th>
            <th style={{ textAlign: "right" }}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#94a3b8",
                }}
              >
                Henüz takip listenize veya portföyünüze hisse eklemediniz.
                Yukarıdaki "+ Hisse Ekle" butonuna basarak başlayabilirsiniz.
              </td>
            </tr>
          ) : (
            portfolio.map((item) => {
              const sym = item.symbol.replace(/\.IS$/, "").toUpperCase();
              const quote = quoteMap.get(sym);
              const currentPrice = quote ? quote.price : item.buyPrice;
              const changePct = quote ? quote.changePercent : 0;
              const isTavan = changePct >= 9.5;
              const isPositive = changePct >= 0;
              const totalVal = currentPrice * item.lotCount;
              const costVal = item.buyPrice * item.lotCount;
              const profit = totalVal - costVal;
              const profitPct = costVal > 0 ? (profit / costVal) * 100 : 0;
              const symbolRules = rules.filter(
                (r) =>
                  r.symbol.replace(/\.IS$/, "").toUpperCase() === sym &&
                  r.isActive,
              );

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                      {sym}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {item.displayName}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {formatPrice(currentPrice)}
                  </td>
                  <td>
                    <span
                      className={`stock-card-badge ${
                        isTavan
                          ? "stock-badge-tavan"
                          : isPositive
                            ? "stock-badge-positive"
                            : "stock-badge-negative"
                      }`}
                    >
                      {isTavan ? "Tavan " : ""}
                      {isPositive ? "+" : ""}
                      {changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    {item.buyPrice > 0 ? formatPrice(item.buyPrice) : "—"}
                  </td>
                  <td>
                    {item.lotCount > 0
                      ? item.lotCount.toLocaleString("tr-TR")
                      : "—"}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {item.lotCount > 0 ? formatPrice(totalVal) : "—"}
                  </td>
                  <td>
                    {item.lotCount > 0 ? (
                      <span
                        className={
                          profit >= 0
                            ? "stock-badge-positive"
                            : "stock-badge-negative"
                        }
                      >
                        {profit >= 0 ? "+" : ""}
                        {formatPrice(profit)} ({profitPct.toFixed(1)}%)
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                    >
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
                            }}
                          >
                            {r.ruleType === "RED_CANDLE"
                              ? "Kırmızı Mum"
                              : r.ruleType === "TAVAN_BREAK"
                                ? "Tavan Bozdu"
                                : r.ruleType === "STOP_LOSS"
                                  ? `Stop %${r.targetValue}`
                                  : r.ruleType === "TAKE_PROFIT"
                                    ? `KarAl %${r.targetValue}`
                                    : `İzleyenStop %${r.targetValue}`}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Kural Yok
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
                        onClick={() => onAddRuleClick(sym)}
                        title="Otomatik Kural Ekle"
                        style={{ padding: "6px 10px" }}
                      >
                        <IconPlus />
                        <span style={{ fontSize: "0.75rem" }}>Kural</span>
                      </button>
                      <button
                        className="stock-btn stock-btn-ai"
                        onClick={() => onAiAnalyzeClick(sym)}
                        title="AI Analiz"
                        style={{ padding: "6px 10px" }}
                      >
                        <IconSparkles />
                        <span style={{ fontSize: "0.75rem" }}>AI</span>
                      </button>
                      <button
                        className="stock-btn stock-btn-secondary"
                        onClick={() => onDeleteItem(item.id)}
                        title="Sil"
                        style={{ padding: "6px 8px", color: "#f87171" }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
