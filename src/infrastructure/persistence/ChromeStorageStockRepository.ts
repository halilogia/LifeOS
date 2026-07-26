/**
 * ChromeStorageStockRepository.ts
 * BIST Portföy, Kurallar ve Alarm geçmişinin chrome.storage.sync ile yönetilmesi.
 */

import type {
  StockPortfolioItem,
  StockRule,
  StockAlertLog,
} from "@/types/stock.js";

const PORTFOLIO_KEY = "stockPortfolio";
const RULES_KEY = "stockRules";
const LOGS_KEY = "stockAlertLogs";

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
}
