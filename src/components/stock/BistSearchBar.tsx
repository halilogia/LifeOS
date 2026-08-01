/**
 * BistSearchBar.tsx
 * Midas tarzı canlı BIST hisse arama çubuğu ve arama sonuç kartları.
 */

import { useState, useEffect } from "preact/hooks";
import { searchBistStocks, formatPrice } from "@/services/bistService.js";
import type { BISTSearchResult, StockQuote } from "@/types/bist.js";

interface BistSearchBarProps {
  searchQuery: string;
  quoteMap: Map<string, StockQuote>;
  onSearchQueryChange: (query: string) => void;
  onQuickAddStock: (symbolClean: string) => void;
  onOpenChart: (symbolClean: string) => void;
  onOpenAiModal: (symbolClean: string) => void;
}

function IconSearch() {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
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

export function BistSearchBar({
  searchQuery,
  quoteMap,
  onSearchQueryChange,
  onQuickAddStock,
  onOpenChart,
  onOpenAiModal,
}: BistSearchBarProps) {
  const [liveResults, setLiveResults] = useState<BISTSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchBistStocks(q);
      setLiveResults(res);
      setIsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.65)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--card-border, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            color: "var(--stock-accent, #818cf8)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconSearch />
        </div>
        <input
          type="text"
          className="stock-input"
          style={{
            flex: 1,
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--card-border, rgba(255, 255, 255, 0.1))",
            fontSize: "0.98rem",
            padding: "10px 14px",
          }}
          placeholder="Tüm BIST Hisselerini Ara..."
          value={searchQuery}
          onInput={(e) =>
            onSearchQueryChange((e.target as HTMLInputElement).value)
          }
        />
        {searchQuery && (
          <button
            className="stock-btn stock-btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={() => onSearchQueryChange("")}
          >
            Temizle
          </button>
        )}
      </div>

      {/* Midas Arama Sonuçları Paneli */}
      {searchQuery.trim().length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "320px",
            overflowY: "auto",
            background: "rgba(15, 23, 42, 0.95)",
            borderRadius: "12px",
            border: "1px solid var(--card-border, rgba(129, 140, 248, 0.3))",
            padding: "12px",
            marginTop: "4px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-secondary, #94a3b8)",
              marginBottom: "4px",
            }}
          >
            CANLI BİST ARAMA SONUÇLARI ({liveResults.length})
          </div>

          {isLoading ? (
            <div
              style={{
                color: "#818cf8",
                padding: "16px",
                textAlign: "center",
                fontSize: "0.88rem",
              }}
            >
              Borsa İstanbul canlı verileri aranıyor...
            </div>
          ) : liveResults.length === 0 ? (
            (() => {
              const customSym = searchQuery.trim().toUpperCase();
              const isValidTicker = /^[A-Z0-9]{3,7}$/.test(customSym);
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "var(--text-muted, #94a3b8)",
                      fontSize: "0.88rem",
                    }}
                  >
                    "{searchQuery}" aramasıyla eşleşen canlı BİST hissesi
                    bulunamadı.
                  </div>
                  {isValidTicker && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(99, 102, 241, 0.08)",
                        border: "1px dashed rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "rgba(99, 102, 241, 0.25)",
                            color: "#c084fc",
                          }}
                        >
                          {customSym}
                        </span>
                        <div style={{ textAlign: "left" }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "white",
                              fontSize: "0.9rem",
                            }}
                          >
                            {customSym} BIST Hissesi
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#94a3b8",
                            }}
                          >
                            Borsa İstanbul
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="stock-btn stock-btn-primary"
                          style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                          onClick={() => onQuickAddStock(customSym)}
                        >
                          <IconPlus />
                          <span>+ Portföye Ekle</span>
                        </button>
                        <button
                          className="stock-btn stock-btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                          onClick={() => onOpenChart(customSym)}
                        >
                          Grafik
                        </button>
                        <button
                          className="stock-btn stock-btn-ai"
                          style={{ padding: "6px 10px", fontSize: "0.78rem" }}
                          onClick={() => onOpenAiModal(customSym)}
                        >
                          <IconSparkles />
                          <span>AI</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            liveResults.map((item) => {
              const symClean = item.cleanSymbol;
              const liveQ = quoteMap.get(symClean);
              const isPos = liveQ ? liveQ.changePercent >= 0 : true;

              return (
                <div
                  key={item.symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "var(--card-bg, rgba(30, 41, 59, 0.6))",
                    border:
                      "1px solid var(--card-border, rgba(255, 255, 255, 0.05))",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background:
                          "var(--stock-badge-bg, rgba(99, 102, 241, 0.2))",
                        color: "var(--stock-accent, #818cf8)",
                      }}
                    >
                      {symClean}
                    </span>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary, #f8fafc)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {item.shortName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary, #94a3b8)",
                        }}
                      >
                        {item.sector || "BIST"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    {liveQ ? (
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text-primary, #f8fafc)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {formatPrice(liveQ.price)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: isPos
                              ? "var(--stock-up, #4ade80)"
                              : "var(--stock-down, #f87171)",
                          }}
                        >
                          {isPos ? "+" : ""}
                          {liveQ.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted, #64748b)",
                        }}
                      >
                        BIST 100
                      </span>
                    )}

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="stock-btn stock-btn-primary"
                        style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                        onClick={() => onQuickAddStock(symClean)}
                      >
                        <IconPlus />
                        <span>+ Portföye Ekle</span>
                      </button>
                      <button
                        className="stock-btn stock-btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                        onClick={() => onOpenChart(symClean)}
                      >
                        Grafik
                      </button>
                      <button
                        className="stock-btn stock-btn-ai"
                        style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                        onClick={() => onOpenAiModal(symClean)}
                      >
                        <IconSparkles />
                        <span>AI</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
