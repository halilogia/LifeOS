/**
 * StateStructureOutline.ts
 * Selçuklu ve Osmanlı Devlet Teşkilatı şema verileri — SchemaBuilder tarafından tüketilen hiyerarşik metinler.
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

export const TESKILAT_TITLE = "SELÇUKLU DEVLET TEŞKİLATI ŞEMASI";

export const OSMANLI_TESKILAT_OUTLINE = `PADİŞAH
-Divan-ı Hümayun
--Sadrazam (Vezir-i Azam)
--Seyfiye (Yürütme & Asker)
---Kubbealtı Vezirleri
---Kaptan-ı Derya
---Yeniçeri Ağası
--İlmiye (Yargı & Eğitim)
---Şeyhülislam
---Kazasker
---Kadılar & Müderrisler
--Kalemiye (Bürokrasi & Maliye)
---Defterdar
---Nişancı
---Reisülküttab
-Taşra Teşkilatı
--Eyalet (Beylerbeyi)
--Sancak (Sancakbeyi)
--Kaza (Kadı)
--Köy (Köy Kethüdası)`;

export const OSMANLI_TESKILAT_TITLE = "OSMANLI DEVLET TEŞKİLATI ŞEMASI";

/** Outline düğüm sayısı (satır sayısı) — SchemaBuilder kutu sayısıyla senkron */
export function countOutlineLines(outline: string): number {
  return outline.split("\n").filter((l) => l.trim().length > 0).length;
}
