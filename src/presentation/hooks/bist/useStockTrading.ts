/**
 * useStockTrading.ts
 * BIST satış akışı + trade history + nakit yönetimi.
 * Alt-hook — tuval (useBist.ts) orkestrasyonu yapar.
 */

import { useCallback, useState } from "preact/hooks";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";
import type {
  StockPortfolioItem,
  StockTradeHistory,
  StockCashBalance,
} from "@/types/stock.js";

export interface SellModalState {
  id: string;
  symbol: string;
  currentLot: number;
  currentPrice: number;
}

export function useStockTrading(
  stockRepository: IStockRepository,
  getPortfolio: () => StockPortfolioItem[],
  setPortfolio: (v: StockPortfolioItem[]) => void,
) {
  const [tradeHistory, setTradeHistory] = useState<StockTradeHistory[]>([]);
  const [cashBalance, setCashBalance] = useState<StockCashBalance>({
    amount: 0,
    updatedAt: new Date().toISOString(),
  });
  const [sellModal, setSellModal] = useState<SellModalState | null>(null);

  const totalWealth = cashBalance.amount;

  const updateCash = useCallback(
    async (amount: number) => {
      const newCash: StockCashBalance = {
        amount,
        updatedAt: new Date().toISOString(),
      };
      setCashBalance(newCash);
      await stockRepository.setCashBalance(newCash);
    },
    [stockRepository],
  );

  const openSell = useCallback(
    (id: string, symbol: string, currentLot: number, currentPrice: number) => {
      setSellModal({ id, symbol, currentLot, currentPrice });
    },
    [],
  );

  const confirmSell = useCallback(
    async (lotToSell: number, sellPrice: number) => {
      if (!sellModal) {
        return;
      }
      const portfolio = getPortfolio();
      const item = portfolio.find((p) => p.id === sellModal.id);
      if (!item) {
        return;
      }

      const trade: StockTradeHistory = {
        id: `trade-${Date.now()}`,
        symbol: item.symbol,
        displayName: item.displayName,
        lotCount: lotToSell,
        sellPrice,
        buyPrice: item.buyPrice,
        realizedProfit: (sellPrice - item.buyPrice) * lotToSell,
        realizedProfitPercent:
          item.buyPrice > 0
            ? ((sellPrice - item.buyPrice) / item.buyPrice) * 100
            : 0,
        soldAt: new Date().toISOString(),
      };

      const remaining = item.lotCount - lotToSell;
      let updated: StockPortfolioItem[];
      if (remaining <= 0) {
        updated = portfolio.filter((p) => p.id !== sellModal.id);
      } else {
        updated = portfolio.map((p) =>
          p.id === sellModal.id ? { ...p, lotCount: remaining } : p,
        );
      }
      setPortfolio(updated);

      const newTradeHistory = [trade, ...tradeHistory].slice(0, 100);
      setTradeHistory(newTradeHistory);

      const sellIncome = sellPrice * lotToSell;
      const newCash: StockCashBalance = {
        amount: cashBalance.amount + sellIncome,
        updatedAt: new Date().toISOString(),
      };
      setCashBalance(newCash);

      await Promise.all([
        stockRepository.savePortfolio(updated),
        stockRepository.saveTradeHistory(newTradeHistory),
        stockRepository.setCashBalance(newCash),
      ]);
      setSellModal(null);
    },
    [
      sellModal,
      getPortfolio,
      setPortfolio,
      tradeHistory,
      cashBalance,
      stockRepository,
    ],
  );

  return {
    tradeHistory,
    setTradeHistory,
    cashBalance,
    setCashBalance,
    totalWealth,
    updateCash,
    sellModal,
    setSellModal,
    openSell,
    confirmSell,
  };
}
