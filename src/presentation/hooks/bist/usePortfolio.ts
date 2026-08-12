/**
 * usePortfolio.ts
 * BIST portföy state + CRUD + toplam hesaplamaları.
 * Alt-hook — tuval (useBist.ts) orkestrasyonu yapar; nakit/satış mantığı
 * useStockTrading'de yaşar. Tüketici hiç değişmez (return yüzeyi useBist'te).
 */

import { useCallback, useMemo, useState } from "preact/hooks";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import type { StockQuote } from "@/types/bist.js";
import type { StockPortfolioItem } from "@/types/stock.js";

export interface PortfolioTotals {
  quoteMap: Map<string, StockQuote>;
  totalPortfolioValue: number;
  totalPortfolioCost: number;
  dailyProfitLossTotal: number;
  dailyProfitLossPercent: number;
}

export function usePortfolio(
  stockRepository: IStockRepository,
  quotes: StockQuote[],
) {
  const [portfolio, setPortfolio] = useState<StockPortfolioItem[]>([]);

  /** Portfolio-only kayıt; nakit düşme tuvalde (useBist) yapılır. */
  const saveStock = useCallback(
    async (itemData: Omit<StockPortfolioItem, "id">) => {
      const fullItem: StockPortfolioItem = {
        id: (itemData as StockPortfolioItem).id || `stock-${Date.now()}`,
        ...itemData,
      };
      const existingIdx = portfolio.findIndex(
        (p) => p.symbol.toUpperCase() === fullItem.symbol.toUpperCase(),
      );
      let updated: StockPortfolioItem[];
      if (existingIdx >= 0) {
        updated = [...portfolio];
        updated[existingIdx] = fullItem;
      } else {
        updated = [...portfolio, fullItem];
      }
      setPortfolio(updated);
      await stockRepository.savePortfolio(updated);
      return updated;
    },
    [portfolio, stockRepository],
  );

  const deleteStock = useCallback(
    async (symbolOrId: string) => {
      const updated = portfolio.filter(
        (p) =>
          p.id !== symbolOrId &&
          p.symbol.toUpperCase() !== symbolOrId.toUpperCase(),
      );
      setPortfolio(updated);
      await stockRepository.savePortfolio(updated);
    },
    [portfolio, stockRepository],
  );

  const totals = useMemo<PortfolioTotals>(() => {
    const quoteMap = new Map<string, StockQuote>(
      quotes.map((q) => [q.symbol.toUpperCase(), q]),
    );
    let totalPortfolioValue = 0;
    let totalPortfolioCost = 0;
    let dailyProfitLossTotal = 0;

    for (const item of portfolio) {
      const q = quoteMap.get(item.symbol.toUpperCase());
      const price = q && q.price > 0 ? q.price : item.buyPrice;
      const itemVal = price * item.lotCount;
      const itemCost = item.buyPrice * item.lotCount;
      totalPortfolioValue += itemVal;
      totalPortfolioCost += itemCost;
      if (q && q.price > 0) {
        dailyProfitLossTotal += q.change * item.lotCount;
      }
    }

    const dailyProfitLossPercent =
      totalPortfolioCost > 0
        ? (dailyProfitLossTotal / totalPortfolioCost) * 100
        : 0;

    return {
      quoteMap,
      totalPortfolioValue,
      totalPortfolioCost,
      dailyProfitLossTotal,
      dailyProfitLossPercent,
    };
  }, [portfolio, quotes]);

  return {
    portfolio,
    setPortfolio,
    saveStock,
    deleteStock,
    ...totals,
  };
}
