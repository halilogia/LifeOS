/**
 * IStockRepository Interface
 * Repository pattern for BIST portfolio, watchlists, rules, alert logs,
 * trade history, and cash balance persistence.
 * Domain layer - no external dependencies, pure interface.
 */

import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
  StockWatchlist,
  StockTradeHistory,
  StockCashBalance,
} from "@/types/stock.js";

export interface IStockRepository {
  getPortfolio(): Promise<StockPortfolioItem[]>;
  savePortfolio(portfolio: StockPortfolioItem[]): Promise<void>;
  getRules(): Promise<StockRule[]>;
  saveRules(rules: StockRule[]): Promise<void>;
  getAlertLogs(): Promise<StockAlertLog[]>;
  saveAlertLogs(logs: StockAlertLog[]): Promise<void>;
  addAlertLog(log: StockAlertLog): Promise<void>;
  getTradeHistory(): Promise<StockTradeHistory[]>;
  saveTradeHistory(items: StockTradeHistory[]): Promise<void>;
  addTradeHistory(item: StockTradeHistory): Promise<void>;
  getCashBalance(): Promise<StockCashBalance>;
  setCashBalance(balance: StockCashBalance): Promise<void>;
  getWatchlists(): Promise<StockWatchlist[]>;
  saveWatchlists(watchlists: StockWatchlist[]): Promise<void>;
  createWatchlist(
    name: string,
    description?: string,
  ): Promise<StockWatchlist[]>;
  deleteWatchlist(id: string): Promise<StockWatchlist[]>;
  toggleSymbolInWatchlist(
    watchlistId: string,
    symbol: string,
  ): Promise<StockWatchlist[]>;
}
