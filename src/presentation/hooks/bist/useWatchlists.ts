/**
 * useWatchlists.ts
 * BIST izleme listeleri (watchlist) state + CRUD.
 * Alt-hook — tuval (useBist.ts) orkestrasyonu yapar.
 */

import { useCallback, useState } from "preact/hooks";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import type { StockWatchlist } from "@/types/stock.js";

export function useWatchlists(stockRepository: IStockRepository) {
  const [watchlists, setWatchlists] = useState<StockWatchlist[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>("all");

  const createWatchlist = useCallback(
    async (name: string) => {
      const updated = await stockRepository.createWatchlist(name);
      setWatchlists(updated);
      if (updated.length > 0) {
        setActiveWatchlistId(updated[updated.length - 1].id);
      }
    },
    [stockRepository],
  );

  const deleteWatchlist = useCallback(
    async (id: string) => {
      const updated = await stockRepository.deleteWatchlist(id);
      setWatchlists(updated);
      setActiveWatchlistId("all");
    },
    [stockRepository],
  );

  const toggleSymbol = useCallback(
    async (watchlistId: string, symbol: string) => {
      const updated = await stockRepository.toggleSymbolInWatchlist(
        watchlistId,
        symbol,
      );
      setWatchlists(updated);
    },
    [stockRepository],
  );

  return {
    watchlists,
    setWatchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    createWatchlist,
    deleteWatchlist,
    toggleSymbol,
  };
}
