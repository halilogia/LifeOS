/**
 * StateStructureOutline.ts
 * Devlet Teşkilatı şema verisi — SchemaBuilder tarafından tüketilen saf metin outline.
 * Tarih haritası şeması için ayrı veri dosyası (HistoryMapView içine gömülü değil).
 * Tire sayısı = hiyerarşi derinliği. Toplam 9 düğüm.
 * Kaynak: archives/kpss-sema-olusturucu-v2.html örnek formatı.
 */
export const TESKILAT_OUTLINE = `Sultan
-Melik
--Ikta Sistemi
-Atabey
-Divan-ı Saltanat
--Tuğracı
--Pervane
---Emir-i Dad
--Müstevfi`;

/** Şema başlığı (SchemaBuilder title prop'u) */
export const TESKILAT_TITLE = "SELÇUKLU DEVLET TEŞKİLATI ŞEMASI";

/** Outline düğüm sayısı (satır sayısı) — SchemaBuilder kutu sayısıyla senkron */
export function countOutlineLines(outline: string): number {
  return outline.split("\n").filter((l) => l.trim().length > 0).length;
}
