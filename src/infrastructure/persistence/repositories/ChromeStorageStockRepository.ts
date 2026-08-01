/**
 * ChromeStorageStockRepository.ts
 * BIST Portföy, Kurallar ve Alarm geçmişinin chrome.storage.sync ile yönetilmesi.
 */

import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
  StockWatchlist,
  StockTradeHistory,
} from "@/types/stock.js";
import {
  SYNC_STOCK_PORTFOLIO,
  SYNC_STOCK_RULES,
  SYNC_STOCK_ALERT_LOGS,
  SYNC_STOCK_WATCHLISTS,
  SYNC_STOCK_TRADE_HISTORY,
} from "@/infrastructure/storage/keys.js";

const PORTFOLIO_KEY = SYNC_STOCK_PORTFOLIO;
const RULES_KEY = SYNC_STOCK_RULES;
const LOGS_KEY = SYNC_STOCK_ALERT_LOGS;
const WATCHLISTS_KEY = SYNC_STOCK_WATCHLISTS;
const TRADE_HISTORY_KEY = SYNC_STOCK_TRADE_HISTORY;

const DEFAULT_WATCHLISTS: StockWatchlist[] = [];

export class ChromeStorageStockRepository {
  async getPortfolio(): Promise<StockPortfolioItem[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([PORTFOLIO_KEY], (res) => {
        const items = res[PORTFOLIO_KEY] as StockPortfolioItem[] | undefined;
        resolve(items || []);
      });
    });
  }

  async savePortfolio(portfolio: StockPortfolioItem[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [PORTFOLIO_KEY]: portfolio }, resolve);
    });
  }

  async getRules(): Promise<StockRule[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([RULES_KEY], (res) => {
        const rules = res[RULES_KEY] as StockRule[] | undefined;
        resolve(rules || []);
      });
    });
  }

  async saveRules(rules: StockRule[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [RULES_KEY]: rules }, resolve);
    });
  }

  async getAlertLogs(): Promise<StockAlertLog[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([LOGS_KEY], (res) => {
        const logs = res[LOGS_KEY] as StockAlertLog[] | undefined;
        resolve(logs || []);
      });
    });
  }

  async saveAlertLogs(logs: StockAlertLog[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [LOGS_KEY]: logs }, resolve);
    });
  }

  async addAlertLog(log: StockAlertLog): Promise<void> {
    const existing = await this.getAlertLogs();
    // Son 100 kaydı sakla
    const updated = [log, ...existing].slice(0, 100);
    await this.saveAlertLogs(updated);
  }

  async getTradeHistory(): Promise<StockTradeHistory[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([TRADE_HISTORY_KEY], (res) => {
        const items = res[TRADE_HISTORY_KEY] as
          | StockTradeHistory[]
          | undefined;
        resolve(items || []);
      });
    });
  }

  async saveTradeHistory(items: StockTradeHistory[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [TRADE_HISTORY_KEY]: items }, resolve);
    });
  }

  async addTradeHistory(item: StockTradeHistory): Promise<void> {
    const existing = await this.getTradeHistory();
    // Son 100 satış kaydını sakla
    const updated = [item, ...existing].slice(0, 100);
    await this.saveTradeHistory(updated);
  }

  async getWatchlists(): Promise<StockWatchlist[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([WATCHLISTS_KEY], (res) => {
        const lists = res[WATCHLISTS_KEY] as StockWatchlist[] | undefined;
        resolve(lists || []);
      });
    });
  }

  async saveWatchlists(watchlists: StockWatchlist[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [WATCHLISTS_KEY]: watchlists }, resolve);
    });
  }

  async createWatchlist(
    name: string,
    description?: string,
  ): Promise<StockWatchlist[]> {
    const lists = await this.getWatchlists();
    const newList: StockWatchlist = {
      id: `wl-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || "",
      symbols: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...lists, newList];
    await this.saveWatchlists(updated);
    return updated;
  }

  async deleteWatchlist(id: string): Promise<StockWatchlist[]> {
    const lists = await this.getWatchlists();
    const updated = lists.filter((l) => l.id !== id);
    await this.saveWatchlists(updated);
    return updated;
  }

  async toggleSymbolInWatchlist(
    watchlistId: string,
    symbol: string,
  ): Promise<StockWatchlist[]> {
    const lists = await this.getWatchlists();
    const cleanSym = symbol.replace(/\.IS$/, "").toUpperCase();
    const updated = lists.map((list) => {
      if (list.id === watchlistId) {
        const hasSymbol = list.symbols.some(
          (s) => s.replace(/\.IS$/, "").toUpperCase() === cleanSym,
        );
        const newSymbols = hasSymbol
          ? list.symbols.filter(
              (s) => s.replace(/\.IS$/, "").toUpperCase() !== cleanSym,
            )
          : [...list.symbols, cleanSym];
        return { ...list, symbols: newSymbols };
      }
      return list;
    });
    await this.saveWatchlists(updated);
    return updated;
  }
}
