/**
 * BistSearchBar.tsx
 * Midas tarzı canlı BIST hisse arama çubuğu ve arama sonuç kartları.
 * Tuval: debounce arama + sonuç paneli kompozisyonu.
 */
import { useState, useEffect } from "preact/hooks";
import { searchBistStocks } from "@/services/bistService.js";
import type { BISTSearchResult, StockQuote } from "@/types/bist.js";
import { IconSearch } from "./searchIcons.js";
import { SearchResultCard } from "./SearchResultCard.js";
import { NoResultCard } from "./NoResultCard.js";

interface BistSearchBarProps {
  searchQuery: string;
  quoteMap: Map<string, StockQuote>;
  onSearchQueryChange: (query: string) => void;
  onQuickAddStock: (symbolClean: string) => void;
  onOpenChart: (symbolClean: string) => void;
  onOpenAiModal: (symbolClean: string) => void;
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
            CANLI BIST ARAMA SONUÇLARI ({liveResults.length})
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
            <NoResultCard
              searchQuery={searchQuery}
              onQuickAddStock={onQuickAddStock}
              onOpenChart={onOpenChart}
              onOpenAiModal={onOpenAiModal}
            />
          ) : (
            liveResults.map((item) => (
              <SearchResultCard
                key={item.symbol}
                item={item}
                quoteMap={quoteMap}
                onQuickAddStock={onQuickAddStock}
                onOpenChart={onOpenChart}
                onOpenAiModal={onOpenAiModal}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
