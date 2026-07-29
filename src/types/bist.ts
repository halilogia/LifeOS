/**
 * bist.ts
 * Type definitions for BIST (Borsa İstanbul) stock data.
 * Shared between components and service layer.
 */

export interface StockQuote {
  symbol: string;
  shortName: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  currency: string;
  marketCap?: number;
  error?: boolean;
}

export interface BISTSearchResult {
  symbol: string;
  cleanSymbol: string;
  shortName: string;
  longName: string;
  sector?: string;
  exchange: string;
}

export interface StockHistoryItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockCache {
  timestamp: number;
  data: StockQuote[];
}
