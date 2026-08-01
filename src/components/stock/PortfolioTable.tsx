/**
 * PortfolioTable.tsx
 * Kullanıcının sahip olduğu BIST hisselerinin canlı portföy tablosu parçası.
 */

import type { StockQuote } from "@/types/bist.js";
import { formatPrice } from "@/services/bistService.js";
import type { StockPortfolioItem, StockRule } from "@/types/stock.js";

interface PortfolioTableProps {
  portfolio: StockPortfolioItem[];
  quotes: StockQuote[];
  rules: StockRule[];
  onOpenAddModal: () => void;
  onAddRuleClick: (symbol: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onDeleteItem: (id: string) => void;
  onSellItem: (id: string, symbol: string, currentLot: number, currentPrice: number) => void;
  onAiAnalyzeClick: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

function IconPlus() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconSell() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="7 7 7 3 3 3" />
      <polyline points="17 17 17 21 21 21" />
      <polyline points="2 12 3 12 3 12" />
      <polyline points="22 12 21 12 21 12" />
      <path d="M12 4v.5" />
      <path d="M12 12v.5" />
      <path d="M12 19v.5" />
      <path d="M12 4.5A8.5 8.5 0 0 0 3.5 13h17A8.5 8.5 0 0 0 12 4.5Z" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function PortfolioTable({
  portfolio,
  quotes,
  rules,
  onAddRuleClick,
  onDeleteRule,
  onDeleteItem,
  onSellItem,
  onAiAnalyzeClick,
  onOpenChart,
}: Omit<PortfolioTableProps, "onOpenAddModal">) {
  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    quoteMap.set(q.symbol.replace(/\.IS$/, "").toUpperCase(), q);
  }

  return (
    <div className="stock-table-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconBriefcase />
          <span>BİST Portföy Varlıklarım ({portfolio.length})</span>
        </div>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Hisse</th>
            <th style={{ textAlign: "right" }}>Son Fiyat</th>
            <th style={{ textAlign: "center" }}>Günlük %</th>
            <th style={{ textAlign: "right" }}>Alış Fiyatı</th>
            <th style={{ textAlign: "center" }}>Adet (Lot)</th>
            <th style={{ textAlign: "right" }}>Toplam Değer</th>
            <th style={{ textAlign: "right" }}>Kar / Zarar</th>
            <th style={{ textAlign: "left" }}>Aktif Alarmlar</th>
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
                  padding: "36px 20px",
                  color: "#94a3b8",
                }}
              >
                Henüz portföyünüze bir hisse eklemediniz.
                Yukarıdaki "+ Hisse / Varlık Ekle" butonuna basarak ilk alışınızı kaydedebilirsiniz.
              </td>
            </tr>
          ) : (
            portfolio.map((item) => {
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
              const profitPct =
                hasLivePrice && costVal > 0 ? (profit / costVal) * 100 : 0;
              const symbolRules = rules.filter(
                (r) =>
                  r.symbol.replace(/\.IS$/, "").toUpperCase() === sym &&
                  r.isActive,
              );

              return (
                <tr key={item.id}>
                  <td
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() => onOpenChart(sym)}
                    title="Grafik Görüntüle"
                  >
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                      {sym}
                    </div>
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
