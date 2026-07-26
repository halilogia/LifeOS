/**
 * bistMarketHours.ts
 * Borsa İstanbul (BIST) işlem saatleri kontrolü (TSİ 09:55 - 18:15, Hafta İçi).
 */

export function isBistMarketOpen(date: Date = new Date()): boolean {
  // Türkiye Saati (UTC+3)
  const utcOffset = date.getTimezoneOffset() * 60000;
  const trtDate = new Date(date.getTime() + utcOffset + 3 * 3600000);

  const day = trtDate.getDay(); // 0: Pazar, 6: Cumartesi
  if (day === 0 || day === 6) {
    return false; // Hafta sonı borsa kapalı
  }

  const hours = trtDate.getHours();
  const minutes = trtDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const marketStart = 9 * 60 + 55; // 09:55 TSİ
  const marketEnd = 18 * 60 + 15; // 18:15 TSİ

  return timeInMinutes >= marketStart && timeInMinutes <= marketEnd;
}
