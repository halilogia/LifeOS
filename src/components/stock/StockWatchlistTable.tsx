/**
 * StockWatchlistTable.tsx
 * Kullanıcının özel Takip Listeleri (Favoriler, Temettü, Halka Arz vb.) canlı izleme tablosu.
 */

import type { StockQuote } from "@/types/bist.js";
import { formatPrice } from "@/services/bistService.js";
import type { StockWatchlist } from "@/types/stock.js";
import { WatchlistSelectorBar } from "./WatchlistSelectorBar.js";

interface StockWatchlistTableProps {
  watchlists: StockWatchlist[];
  activeWatchlistId: string;
  quotes: StockQuote[];
  onSelectWatchlist: (id: string) => void;
  onCreateWatchlist: (name: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onAddRuleClick: (symbol: string) => void;
  onAiAnalyzeClick: (targetSymbols: string) => void;
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

function IconEye() {
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function StockWatchlistTable({
  watchlists,
  activeWatchlistId,
  quotes,
  onSelectWatchlist,
  onCreateWatchlist,
  onDeleteWatchlist,
  onAddRuleClick,
  onAiAnalyzeClick,
  onOpenChart,
}: StockWatchlistTableProps) {
  const quoteMap = new Map<string, StockQuote>();
  for (const q of quotes) {
    quoteMap.set(q.symbol.replace(/\.IS$/, "").toUpperCase(), q);
  }

  // Active Watchlist
  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  // Active symbols
  const activeSymbols = activeWatchlist ? activeWatchlist.symbols : [];

  const activeListTitle = activeWatchlist ? activeWatchlist.name : "Takip Listem";
  const activeSymbolsToAnalyze = activeSymbols.join(",");

  return (
    <div className="stock-table-container">
      {/* Watchlist Selector Pills */}
      <WatchlistSelectorBar
        watchlists={watchlists}
        activeWatchlistId={activeWatchlist ? activeWatchlist.id : "favorites"}
        totalPortfolioCount={activeSymbols.length}
        onSelectWatchlist={onSelectWatchlist}
        onCreateWatchlist={onCreateWatchlist}
        onDeleteWatchlist={onDeleteWatchlist}
      />

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
          <IconEye />
          <span>BİST {activeListTitle} Takip Listesi ({activeSymbols.length})</span>
        </div>
        {activeSymbols.length > 0 && (
          <button
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
            onClick={() => onAiAnalyzeClick(activeSymbolsToAnalyze || "ALL_PORTFOLIO")}
          >
            <IconSparkles />
            <span>✦ Seans Açılış Öncesi Strateji & Açılış Tahmini Al</span>
          </button>
        )}
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Hisse</th>
            <th style={{ textAlign: "right" }}>Son Fiyat</th>
            <th style={{ textAlign: "center" }}>Günlük %</th>
            <th style={{ textAlign: "right" }}>Gün İçi En Yüksek</th>
            <th style={{ textAlign: "right" }}>Gün İçi En Düşük</th>
            <th style={{ textAlign: "right" }}>Hacim (TL)</th>
            <th style={{ textAlign: "right" }}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {activeSymbols.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  padding: "36px 20px",
                  color: "#94a3b8",
                }}
              >
                Bu takip listesinde henüz hisse bulunmuyor.
                Aşağıdaki "Keşfet & Hisse Ara" sekmesinden ilgilendiğiniz hisseleri ekleyebilirsiniz.
              </td>
            </tr>
          ) : (
            activeSymbols.map((symRaw) => {
              const sym = symRaw.replace(/\.IS$/, "").toUpperCase();
              const quote = quoteMap.get(sym);
              const hasLivePrice = Boolean(quote && quote.price > 0);
              const currentPrice = hasLivePrice ? quote!.price : 0;
              const changePct = hasLivePrice ? quote!.changePercent : 0;
              const isTavan = changePct >= 9.5;
              const isPositive = changePct >= 0;

              return (
                <tr key={sym}>
                  <td
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() => onOpenChart(sym)}
                    title="Grafik Görüntüle"
                  >
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                      {sym}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {quote?.shortName || sym}
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
                  <td style={{ textAlign: "right", color: "#94a3b8", fontSize: "0.85rem" }}>
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
