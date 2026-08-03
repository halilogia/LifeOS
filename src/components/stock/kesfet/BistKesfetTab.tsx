/**
 * BistKesfetTab.tsx
 * Midas Tarzı BIST Keşfet ve Hisse Arama Ekranı (tuval).
 * Veri mantığı: ticker fetch, infinite scroll, featured hesaplama.
 * Parçalar: KesfetFeaturedCard, KesfetTickerCard, KesfetWatchlistModal.
 */

import { useState, useEffect } from "preact/hooks";
import { fetchDynamicBistTickers } from "@/services/bistService.js";
import type { StockQuote } from "@/types/bist.js";
import { BistSearchBar } from "@/components/stock/search/BistSearchBar.js";
import type { StockWatchlist } from "@/types/stock.js";
import { getTranslation } from "@/utils/i18n.js";
import type { Language } from "@/types/types.js";
import { KesfetFeaturedCard } from "@/components/stock/kesfet/KesfetFeaturedCard.js";
import { KesfetTickerCard } from "@/components/stock/kesfet/KesfetTickerCard.js";
import { KesfetWatchlistModal } from "@/components/stock/kesfet/KesfetWatchlistModal.js";

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
  lang: Language;
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
  lang,
}: BistKesfetTabProps) {
  const t = getTranslation(lang);
  // Modal for adding a stock to a watchlist
  const [watchlistModalSymbol, setWatchlistModalSymbol] = useState<
    string | null
  >(null);
  const [bistTickers, setBistTickers] = useState<string[]>([]);

  // Infinite Scroll state: initial 24, increment by 24 on scroll
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    fetchDynamicBistTickers().then((list) => {
      if (list && list.length > 0) {
        setBistTickers(list);
      }
    });
  }, []);

  const allTickers = Array.from(
    new Set([
      ...bistTickers,
      ...Array.from(quoteMap.keys()).map((k) =>
        k.endsWith(".IS") ? k : `${k}.IS`,
      ),
    ]),
  );

  const filteredTickers = allTickers.filter((sym) => {
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
  const featuredStocks = allTickers
    .map((fullSym) => {
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
      if (a.isUp !== b.isUp) {
        return a.isUp ? -1 : 1;
      }
      return b.tlVolume - a.tlVolume || b.changePercent - a.changePercent;
    })
    .slice(0, 3);

  const handleWatchlistModalOpen = (symbol: string) => {
    setWatchlistModalSymbol(symbol);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* AI Haftalık Öne Çıkan Hisseler Köşesi */}
      <KesfetFeaturedCard
        t={t}
        featuredStocks={featuredStocks}
        onOpenAiModal={onOpenAiModal}
        onOpenChart={onOpenChart}
        onOpenWatchlistModal={handleWatchlistModalOpen}
      />

      {/* Arama Çubuğu */}
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
        {displayedTickers.map((fullSym) => (
          <KesfetTickerCard
            key={fullSym}
            t={t}
            fullSym={fullSym}
            quoteMap={quoteMap}
            onWatchlistModal={handleWatchlistModalOpen}
            onQuickAddStock={onQuickAddStock}
            onOpenChart={onOpenChart}
            onOpenAiModal={onOpenAiModal}
          />
        ))}
      </div>

      {/* Infinite Scroll / Load More Indicator */}
      {visibleCount < filteredTickers.length && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          <button
            className="stock-btn stock-btn-secondary"
            style={{ padding: "8px 24px", fontSize: "0.85rem" }}
            onClick={() =>
              setVisibleCount((prev) =>
                Math.min(prev + 24, filteredTickers.length),
              )
            }
          >
            {t.stock_load_more}{" "}
            {t.stock_load_more_remaining.replace(
              "{count}",
              String(filteredTickers.length - visibleCount),
            )}
          </button>
        </div>
      )}

      {/* Watchlist Selector Modal */}
      {watchlistModalSymbol && (
        <KesfetWatchlistModal
          t={t}
          watchlists={watchlists}
          symbol={watchlistModalSymbol}
          onToggle={onToggleWatchlistSymbol}
          onClose={() => setWatchlistModalSymbol(null)}
        />
      )}
    </div>
  );
}
