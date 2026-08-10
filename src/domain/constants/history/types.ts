/**
 * types.ts
 * KPSS Tarih Haritası ortak tipleri ve sabitleri.
 */

export type HistoryMode = "territory" | "points" | "diagram";

export interface HistoryEvent {
  year?: number;
  title: string;
  city?: string;
  desc: string;
  tag?: string;
  /** territory modunda bu olayın boyanacağı iller */
  territory?: string[];
  /** territory modunda elden çıkan / kaybedilen iller */
  lostTerritory?: string[];
  color?: string;
  x: number;
  y: number;
}

export interface HistoryLegendRow {
  c: string;
  l: string;
}

export interface HistoryUnit {
  id: string;
  navLabel: string;
  mode: HistoryMode;
  title: string;
  subtitle: string;
  showYear: boolean;
  color: string;
  legend: HistoryLegendRow[] | null;
  events?: HistoryEvent[];
}

export const HISTORY_VIEWBOX = "0 0 1000.0 421.9991241865445";

/** Varsayılan il rengi (parşömen) */
export const HISTORY_PROVINCE_FILL = "#d8cba7";
export const HISTORY_PROVINCE_STROKE = "#a3906a";
