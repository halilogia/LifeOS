/**
 * BistKesfetTab.tsx
 * Midas Tarzı BIST Keşfet ve Hisse Arama Ekranı.
 * Kategori filtreli BIST hisseleri listesi, canlı fiyat kartları, sonsuz yükleme ve takip listelerine hisse ekleme pencereleri.
 */

import { useState, useEffect } from "preact/hooks";
import { POPULAR_BIST_TICKERS, StockQuote } from "@/services/bistService.js";
import { BistSearchBar } from "@/components/stock/BistSearchBar.js";
import type { StockWatchlist } from "@/types/stock.js";

interface BistKesfetTabProps {
  searchQuery: string;
  quoteMap: Map<string, StockQuote>;
  watchlists: StockWatchlist[];
  onSearchQueryChange: (q: string) => void;
  onQuickAddStock: (symbol: string) => void;
  onToggleWatchlistSymbol: (watchlistId: string, symbol: string) => void;
  onCreateWatchlist: (name: string) => void;
  onOpenChart: (symbol: string) => void;
  onOpenAiModal: (symbol: string) => void;
}

function IconPlus() {
  return (
    <svg
      width="12"
      height="12"
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
      width="12"
      height="12"
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
      width="12"
      height="12"
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

function IconBookmark() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function BistKesfetTab({
  searchQuery,
  quoteMap,
  watchlists,
  onSearchQueryChange,
  onQuickAddStock,
  onToggleWatchlistSymbol,
  onCreateWatchlist,
  onOpenChart,
  onOpenAiModal,
}: BistKesfetTabProps) {
  // Modal for adding a stock to a watchlist
  const [watchlistModalSymbol, setWatchlistModalSymbol] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");

  // Infinite Scroll state: initial 24, increment by 24 on scroll
  const [visibleCount, setVisibleCount] = useState(24);

  const filteredTickers = POPULAR_BIST_TICKERS.filter((sym) => {
    const cleanSym = sym.replace(".IS", "").toLowerCase();
    const queryLower = searchQuery.toLowerCase().trim();
    return !queryLower || cleanSym.includes(queryLower);
  });

  const displayedTickers = filteredTickers.slice(0, visibleCount);

  // Auto load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        setVisibleCount((prev) => Math.min(prev + 18, filteredTickers.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredTickers.length]);

  // Dynamically calculate top featured stocks: prioritize positive momentum gainers & high TL Volume
  const featuredStocks = POPULAR_BIST_TICKERS.map((fullSym) => {
    const cleanSym = fullSym.replace(".IS", "");
    const q = quoteMap.get(cleanSym) || quoteMap.get(fullSym);
    const price = q ? q.price : 0;
    const volume = q ? q.volume : 0;
    const tlVolume = price * volume;
    return {
      sym: cleanSym,
      name: q?.shortName || cleanSym,
      price,
      changePercent: q ? q.changePercent : 0,
      volume,
      tlVolume,
      isUp: q ? q.changePercent >= 0 : false,
    };
  })
    .sort((a, b) => {
      if (a.isUp !== b.isUp) return a.isUp ? -1 : 1;
      return b.tlVolume - a.tlVolume || b.changePercent - a.changePercent;
    })
    .slice(0, 3);

  const handleCreateAndAdd = (e: Event) => {
    e.preventDefault();
    if (!newListName.trim() || !watchlistModalSymbol) return;
    onCreateWatchlist(newListName.trim());
    setNewListName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ✦ AI Haftalık Öne Çıkan Hisseler Köşesi */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: "16px",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
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
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "10px",
          }}
        >
          <IconSparkles />
          <span>✦ AI Haftalık Öne Çıkan BİST Hisseleri</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "10px",
          }}
        >
          {featuredStocks.map((item, idx) => {
            const scoreLabel = item.changePercent >= 5
              ? "90/100 🐂 Boğa"
              : item.changePercent > 0
                ? "75/100 🐂 Boğa"
                : item.changePercent === 0
                  ? "50/100 ⚖️ Nötr"
                  : "35/100 🐻 Ayı";

            let tagLabel = "⚡ BİST İşlem Akışı";
            let tagBg = "rgba(139, 92, 246, 0.15)";
            let tagColor = "#c084fc";

            if (idx === 0 && item.tlVolume > 0) {
              tagLabel = "💰 TL Hacim Lideri";
              tagBg = "rgba(59, 130, 246, 0.15)";
              tagColor = "#60a5fa";
            } else if (item.changePercent >= 3.0) {
              tagLabel = "🚀 Güçlü Yükseliş İvmesi";
              tagBg = "rgba(16, 185, 129, 0.15)";
              tagColor = "#34d399";
            } else if (item.changePercent > 0) {
              tagLabel = "📈 Pozitif Trend";
              tagBg = "rgba(16, 185, 129, 0.15)";
              tagColor = "#34d399";
            } else if (item.changePercent < 0) {
              tagLabel = "📉 Düzeltme & Volatilite";
              tagBg = "rgba(239, 68, 68, 0.15)";
              tagColor = "#f87171";
            }

            return (
              <div
                key={item.sym}
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
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
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                      {item.sym}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {item.name}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      background: tagBg,
                      color: tagColor,
                      fontWeight: 600,
                    }}
                  >
                    {tagLabel}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "2px",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#f1f5f9" }}>
                    {item.price > 0 ? `₺${item.price.toFixed(2)}` : "—"}
                  </div>
                  <span
                    className={`stock-card-badge ${
                      item.isUp ? "stock-badge-positive" : "stock-badge-negative"
                    }`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {item.isUp ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  <button
                    className="stock-btn stock-btn-ai"
                    style={{ flex: 1, padding: "4px 8px", fontSize: "0.72rem" }}
                    onClick={() => onOpenAiModal(item.sym)}
                  >
                    <IconSparkles />
                    <span>AI Analiz</span>
                  </button>
                  <button
                    className="stock-btn stock-btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                    onClick={() => setWatchlistModalSymbol(item.sym)}
                    title="Takip Listeme Ekle"
                  >
                    <IconBookmark />
                  </button>
                  <button
                    className="stock-btn stock-btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                    onClick={() => onOpenChart(item.sym)}
                    title="Grafik"
                  >
                    <IconChart />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔍 Arama Çubuğu */}
      <BistSearchBar
        searchQuery={searchQuery}
        quoteMap={quoteMap}
        onSearchQueryChange={onSearchQueryChange}
        onQuickAddStock={onQuickAddStock}
        onOpenChart={onOpenChart}
        onOpenAiModal={onOpenAiModal}
      />

      {/* Popüler Hisseler Izgara Görünümü */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {displayedTickers.map((fullSym) => {
          const symClean = fullSym.replace(".IS", "");
          const quote = quoteMap.get(symClean) || quoteMap.get(fullSym);

          const price = quote ? quote.price : null;
          const changePercent = quote ? quote.changePercent : 0;
          const isUp = changePercent >= 0;
          const companyName = quote?.shortName || `${symClean} Hissesi`;

          return (
            <div
              key={fullSym}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "white",
                      }}
                    >
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
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {companyName}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "white",
                    }}
                  >
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
                  onClick={() => setWatchlistModalSymbol(symClean)}
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
                  title="Takip Listesine Ekle"
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
                  title="Portföye Ekle"
                >
                  <IconPlus />
                  <span>Portföye Ekle</span>
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
                  title="Grafik"
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
                  title="AI Analiz"
                >
                  <IconSparkles />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll / Load More Indicator */}
      {visibleCount < filteredTickers.length && (
        <div style={{ textAlign: "center", marginTop: "10px", marginBottom: "20px" }}>
          <button
            className="stock-btn stock-btn-secondary"
            style={{ padding: "8px 24px", fontSize: "0.85rem" }}
            onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredTickers.length))}
          >
            Daha Fazla BİST Hissesi Yükle ({filteredTickers.length - visibleCount} kaldı)
          </button>
        </div>
      )}

      {/* Watchlist Selector Modal */}
      {watchlistModalSymbol && (
        <div
          className="stock-modal-overlay"
          onClick={() => setWatchlistModalSymbol(null)}
        >
          <div
            className="stock-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <div className="stock-modal-header">
              <div className="stock-modal-title">
                {watchlistModalSymbol.toUpperCase()} — Hangi Takip Listesine Eklensin?
              </div>
              <button
                type="button"
                onClick={() => setWatchlistModalSymbol(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
                title="Kapat"
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {watchlists.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  Henüz bir takip listeniz yok. "Takip Listelerim" sekmesinden yeni liste oluşturabilirsiniz.
                </div>
              ) : (
                watchlists.map((wl) => {
                  const isAdded = wl.symbols.some(
                    (s) => s.replace(".IS", "").toUpperCase() === watchlistModalSymbol.toUpperCase(),
                  );
                  return (
                    <button
                      key={wl.id}
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: isAdded ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.04)",
                        border: `1px solid ${isAdded ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                        color: isAdded ? "#e0e7ff" : "#f1f5f9",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        onToggleWatchlistSymbol(wl.id, watchlistModalSymbol);
                      }}
                    >
                      <span>{wl.name} ({wl.symbols.length} varlık)</span>
                      {isAdded && (
                        <span style={{ color: "#818cf8", display: "flex", alignItems: "center" }}>
                          <IconCheck />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
