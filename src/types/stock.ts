/**
 * stock.ts
 * BIST Otomatik Borsa Yönetim & Strateji Sistemi Tip Tanımları.
 */

export type StockRuleType =
  | "PRICE_ABOVE" // Fiyat Belirtilen TL Üstüne Çıkınca
  | "PRICE_BELOW" // Fiyat Belirtilen TL Altına İnince
  | "RED_CANDLE" // Mum kırmızıya döndüğünde (Değişim % < 0)
  | "TAVAN_BREAK" // Tavan bozulduğunda (%10 altına sarkma)
  | "STOP_LOSS" // Sabit Zarar Durdur (Örn: Maliyetin %3 altı)
  | "TAKE_PROFIT" // Kar Al (Örn: Maliyetin %15 üstü)
  | "TRAILING_STOP" // İzleyen Stop (Örn: Görülen en yüksek fiyatın %4 altı)
  | "RSI_OVERBOUGHT"; // RSI aşırı alım bölgesi (RSI > 70)

export interface StockPortfolioItem {
  id: string;
  symbol: string; // Örn: "THYAO.IS" veya "THYAO"
  displayName: string; // Örn: "Türk Hava Yolları"
  buyPrice: number; // Alış Fiyatı (TL)
  lotCount: number; // Adet / Lot
  buyDate: string; // YYYY-MM-DD
  note?: string;
  highestPriceSeen?: number; // İzleyen stop için görülen en yüksek fiyat
}

export interface StockRule {
  id: string;
  symbol: string; // Örn: "THYAO.IS"
  ruleType: StockRuleType;
  targetValue?: number; // Yüzde veya sabit hedef değer (örn: 3 = %3)
  isActive: boolean;
  createdAt: string;
}

export interface StockAlertLog {
  id: string;
  symbol: string;
  ruleType: StockRuleType;
  triggerValue: number; // Tetiklendiği andaki fiyat veya % değişim
  message: string; // İnsan tarafından okunabilir alarm mesajı
  timestamp: string; // ISO Tarih
  isRead: boolean;
}

export interface StockWatchlist {
  id: string;
  name: string;
  description?: string;
  symbols: string[]; // Hisse sembolleri listesi (örn: ["THYAO", "GARAN"])
  createdAt: string; // ISO Tarih
}

