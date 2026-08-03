/**
 * StockWatchlistTable.tsx
 * Kullanıcının özel Takip Listeleri (Favoriler, Temettü, Halka Arz vb.) canlı izleme tablosu.
 * Tuval: quoteMap + activeWatchlist + WatchlistSelectorBar/WatchlistHeader/WatchlistRow.
 */
import type { StockQuote } from "@/types/bist.js";
import type { StockWatchlist } from "@/types/stock.js";
import { WatchlistSelectorBar } from "./WatchlistSelectorBar.js";
import { WatchlistHeader } from "./WatchlistHeader.js";
import { WatchlistRow } from "./WatchlistRow.js";

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
  const activeWatchlist =
    watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  // Active symbols
  const activeSymbols = activeWatchlist ? activeWatchlist.symbols : [];

  const activeListTitle = activeWatchlist
    ? activeWatchlist.name
    : "Takip Listem";
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

      <WatchlistHeader
        listTitle={activeListTitle}
        symbolCount={activeSymbols.length}
        symbolsToAnalyze={activeSymbolsToAnalyze}
        onAiAnalyze={onAiAnalyzeClick}
      />

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
                Bu takip listesinde henüz hisse bulunmuyor. Aşağıdaki "Keşfet &
                Hisse Ara" sekmesinden ilgilendiğiniz hisseleri
                ekleyebilirsiniz.
              </td>
            </tr>
          ) : (
            activeSymbols.map((symRaw) => {
              const sym = symRaw.replace(/\.IS$/, "").toUpperCase();
              const quote = quoteMap.get(sym);
              return (
                <WatchlistRow
                  key={sym}
                  symbol={sym}
                  quote={quote}
                  onOpenChart={onOpenChart}
                  onAddRuleClick={onAddRuleClick}
                  onAiAnalyzeClick={onAiAnalyzeClick}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
