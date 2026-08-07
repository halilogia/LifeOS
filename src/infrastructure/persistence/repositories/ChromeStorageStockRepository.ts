/**
 * ChromeStorageStockRepository.ts
 * BIST Portföy, Kurallar ve Alarm geçmişinin chrome.storage.local ile yönetilmesi.
 */

import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
  StockWatchlist,
  StockTradeHistory,
  StockCashBalance,
} from "@/types/stock.js";
import {
  SYNC_STOCK_PORTFOLIO,
  SYNC_STOCK_RULES,
  SYNC_STOCK_ALERT_LOGS,
  SYNC_STOCK_WATCHLISTS,
  SYNC_STOCK_TRADE_HISTORY,
  SYNC_STOCK_CASH,
} from "@/infrastructure/storage/keys.js";
import { scheduleCloudBackup } from "@/utils/cloudBackup.js";
import type { IStockRepository } from "@/domain/repositories/IStockRepository.js";

const PORTFOLIO_KEY = SYNC_STOCK_PORTFOLIO;
const RULES_KEY = SYNC_STOCK_RULES;
const LOGS_KEY = SYNC_STOCK_ALERT_LOGS;
const WATCHLISTS_KEY = SYNC_STOCK_WATCHLISTS;
const TRADE_HISTORY_KEY = SYNC_STOCK_TRADE_HISTORY;
const CASH_KEY = SYNC_STOCK_CASH;

export class ChromeStorageStockRepository implements IStockRepository {
  async getPortfolio(): Promise<StockPortfolioItem[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([PORTFOLIO_KEY], (res) => {
        const items = res[PORTFOLIO_KEY] as StockPortfolioItem[] | undefined;
        resolve(items || []);
      });
    });
  }

  async savePortfolio(portfolio: StockPortfolioItem[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [PORTFOLIO_KEY]: portfolio }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async getRules(): Promise<StockRule[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([RULES_KEY], (res) => {
        const rules = res[RULES_KEY] as StockRule[] | undefined;
        resolve(rules || []);
      });
    });
  }

  async saveRules(rules: StockRule[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [RULES_KEY]: rules }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async getAlertLogs(): Promise<StockAlertLog[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([LOGS_KEY], (res) => {
        const logs = res[LOGS_KEY] as StockAlertLog[] | undefined;
        resolve(logs || []);
      });
    });
  }

  async saveAlertLogs(logs: StockAlertLog[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [LOGS_KEY]: logs }, () => {
        scheduleCloudBackup();
        resolve();
      });
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
      chrome.storage.local.get([TRADE_HISTORY_KEY], (res) => {
        const items = res[TRADE_HISTORY_KEY] as StockTradeHistory[] | undefined;
        resolve(items || []);
      });
    });
  }

  async saveTradeHistory(items: StockTradeHistory[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [TRADE_HISTORY_KEY]: items }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async addTradeHistory(item: StockTradeHistory): Promise<void> {
    const existing = await this.getTradeHistory();
    // Son 100 satış kaydını sakla
    const updated = [item, ...existing].slice(0, 100);
    await this.saveTradeHistory(updated);
  }

  async getCashBalance(): Promise<StockCashBalance> {
    return new Promise((resolve) => {
      chrome.storage.local.get([CASH_KEY], (res) => {
        const bal = res[CASH_KEY] as StockCashBalance | undefined;
        resolve(bal || { amount: 0, updatedAt: new Date().toISOString() });
      });
    });
  }

  async setCashBalance(balance: StockCashBalance): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [CASH_KEY]: balance }, () => {
        scheduleCloudBackup();
        resolve();
      });
    });
  }

  async getWatchlists(): Promise<StockWatchlist[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([WATCHLISTS_KEY], (res) => {
        const lists = res[WATCHLISTS_KEY] as StockWatchlist[] | undefined;
        resolve(lists || []);
      });
    });
  }

  async saveWatchlists(watchlists: StockWatchlist[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [WATCHLISTS_KEY]: watchlists }, () => {
        scheduleCloudBackup();
        resolve();
      });
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
