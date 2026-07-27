/**
 * BistKesfetTab.tsx
 * Midas Tarzı BIST Keşfet ve Hisse Arama Ekranı.
 * Kategori filtreli popüler BIST hisseleri listesi ve canlı fiyat kartları.
 */

import { useState } from "preact/hooks";
import { POPULAR_BIST_STOCKS, StockQuote } from "@/services/bistService.js";
import { BistSearchBar } from "@/components/stock/BistSearchBar.js";

interface BistKesfetTabProps {
  searchQuery: string;
  quoteMap: Map<string, StockQuote>;
  onSearchQueryChange: (q: string) => void;
  onQuickAddStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
  onOpenAiModal: (symbol: string) => void;
}

const CATEGORIES = [
  "Tümü",
  "Havacılık",
  "Bankacılık",
  "Enerji",
  "Teknoloji",
  "Metal",
  "Perakende",
  "Holding",
  "Savunma",
];

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

export function BistKesfetTab({
  searchQuery,
  quoteMap,
  onSearchQueryChange,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: BistKesfetTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  const filteredStocks = POPULAR_BIST_STOCKS.filter((item) => {
    const cleanSym = item.symbol.replace(".IS", "").toLowerCase();
    const cleanName = item.displayName.toLowerCase();
    const queryLower = searchQuery.toLowerCase().trim();

    const matchesQuery =
      !queryLower ||
      cleanSym.includes(queryLower) ||
      cleanName.includes(queryLower);

    const matchesCat =
      selectedCategory === "Tümü" || item.sector === selectedCategory;

    return matchesQuery && matchesCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 🔍 Arama Çubuğu */}
      <BistSearchBar
        searchQuery={searchQuery}
        quoteMap={quoteMap}
        onSearchQueryChange={onSearchQueryChange}
        onQuickAddStock={onQuickAddStock}
        onOpenChart={onOpenChart}
        onOpenAiModal={onOpenAiModal}
      />

      {/* Sektör / Kategori Filtre Hapları */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              border:
                selectedCategory === cat
                  ? "1px solid var(--accent-color)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
              background:
                selectedCategory === cat
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(255, 255, 255, 0.03)",
              color: selectedCategory === cat ? "#c084fc" : "#94a3b8",
              transition: "all 0.2s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popüler Hisseler Izgara Görünümü */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {filteredStocks.map((stock) => {
          const symClean = stock.symbol.replace(".IS", "");
          const quote = quoteMap.get(stock.symbol.toUpperCase());

          const price = quote ? quote.price : null;
          const changePercent = quote ? quote.changePercent : 0;
          const isUp = changePercent >= 0;

          return (
            <div
              key={stock.symbol}
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
                      {stock.sector}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {stock.displayName}
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
