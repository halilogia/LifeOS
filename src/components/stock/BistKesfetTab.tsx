/**
 * BistKesfetTab.tsx
 * Midas Tarzı BIST Keşfet ve Hisse Arama Ekranı.
 * Kategori filtreli popüler BIST hisseleri listesi ve canlı fiyat kartları.
 */

import { useState } from "preact/hooks";
import { POPULAR_BIST_TICKERS, StockQuote } from "@/services/bistService.js";
import { BistSearchBar } from "@/components/stock/BistSearchBar.js";

interface BistKesfetTabProps {
  searchQuery: string;
  quoteMap: Map<string, StockQuote>;
  onSearchQueryChange: (q: string) => void;
  onQuickAddStock: (symbol: string) => void;
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

function IconBullTrend() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4ade80"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function BistKesfetTab({
  searchQuery,
  quoteMap,
  onSearchQueryChange,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: BistKesfetTabProps) {
  const filteredTickers = POPULAR_BIST_TICKERS.filter((sym) => {
    const cleanSym = sym.replace(".IS", "").toLowerCase();
    const queryLower = searchQuery.toLowerCase().trim();
    return !queryLower || cleanSym.includes(queryLower);
  });

  // Dynamically calculate top featured stocks: prioritize positive momentum gainers & high TL Volume
  const featuredStocks = POPULAR_BIST_TICKERS.map((fullSym) => {
    const cleanSym = fullSym.replace(".IS", "");
    const q = quoteMap.get(cleanSym) || quoteMap.get(fullSym);
    const price = q ? q.price : 0;
    const volume = q ? q.volume : 0;
    const tlVolume = price * volume; // Real Lira Transaction Volume (TL Hacim)
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
    // Sort positive momentum gainers first, then by TL Lira Volume
    .sort((a, b) => {
      if (a.isUp !== b.isUp) return a.isUp ? -1 : 1;
      return b.tlVolume - a.tlVolume || b.changePercent - a.changePercent;
    })
    .slice(0, 3);

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

            // Accurate dynamic tag matching based on REAL data
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
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.72rem",
                    color: "#818cf8",
                    background: "rgba(99, 102, 241, 0.1)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  <IconBullTrend />
                  <span>AI Skoru: {scoreLabel}</span>
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
                    onClick={() => onOpenChart(item.sym)}
                    title="Grafik"
                  >
                    <IconChart />
                  </button>
                  <button
                    className="stock-btn stock-btn-secondary"
                    style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                    onClick={() => onQuickAddStock(item.sym)}
                    title="Portföye Ekle"
                  >
                    <IconPlus />
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
        {filteredTickers.map((fullSym) => {
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
                  onClick={() => onQuickAddStock(symClean)}
                  style={{
                    flex: 1,
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    borderRadius: "6px",
                    color: "#818cf8",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "5px 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
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
                    padding: "5px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Grafik"
                >
                  <IconChart />
                  <span>Grafik</span>
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
                    padding: "5px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="AI Analiz"
                >
                  <IconSparkles />
                  <span>AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
