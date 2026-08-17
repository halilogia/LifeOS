/**
 * WorldMapGeoService.ts
 * D3.js ve TopoJSON kullanarak Natural Earth Dünya Haritası verilerini dinamik yükleme,
 * Mercator harita projeksiyonu hesaplama ve ISO ülke kodları ile eşleştirme servisi.
 */
import * as d3 from "d3-geo";
import {
  PREPROJECTED_WORLD_FEATURES,
  type CountryGeoFeature,
} from "@/domain/constants/history/worldCountryFeaturesData.js";

export type { CountryGeoFeature };

const ISO_MAP: Record<string, string[]> = {
  turkey: ["792"],
  greece: ["300"],
  balkans: ["688", "100", "348", "642", "070", "191", "499", "807", "705"], // Sırbistan, Bulgaristan, Macaristan, Romanya, Bosna, Hırvatistan, Karadağ, M.Kuzey Makedonya, Slovenya
  austria: ["040"],
  podolia: ["804", "616"], // Ukrayna, Polonya
  crimea: ["804"], // Kırım / Ukrayna (Rusya hariç)
  syria: ["760", "422"], // Suriye, Lübnan
  iraq: ["368"],
  iran: ["364"],
  egypt: ["818"],
  libya: ["434"],
  algeria: ["012", "788"], // Cezayir, Tunus
  cyprus: ["196"],
};

export const PROJECTION_WIDTH = 1000;
export const PROJECTION_HEIGHT = 500;

// EMENA (Avrupa, Akdeniz, Orta Doğu, Kuzey Afrika) D3 Mercator projeksiyonu
export const emenaProjection = d3
  .geoMercator()
  .center([28.0, 36.5]) // Lon 28.0 E, Lat 36.5 N (Doğu Akdeniz / Anadolu merkezli)
  .scale(540)
  .translate([PROJECTION_WIDTH / 2, PROJECTION_HEIGHT / 2]);

export const emenaPathGenerator = d3.geoPath().projection(emenaProjection);

/** Coğrafi Boylam (lon) ve Enlem (lat) değerini haritadaki SVG (x, y) piksel koordinatına dönüştürür */
export function geoToSvgCoords(
  lon: number,
  lat: number,
): { x: number; y: number } {
  const coords = emenaProjection([lon, lat]);
  if (!coords) {
    return { x: 500, y: 250 };
  }
  return { x: coords[0], y: coords[1] };
}

/** Önceden projeksiyonu yapılmış 0-gecikmeli dünya ülkesi harita özelliklerini senkron getirir */
export function getWorldFeaturesSync(): CountryGeoFeature[] {
  return PREPROJECTED_WORLD_FEATURES;
}

export async function loadWorldCountryFeatures(): Promise<CountryGeoFeature[]> {
  return PREPROJECTED_WORLD_FEATURES;
}

/** Verilen bölge adı (örn: 'iran', 'austria', 'balkans') için ISO kodlarını döndürür */
export function getIsoCodesForRegion(regionKey: string): string[] {
  const lower = regionKey.toLowerCase();
  return ISO_MAP[lower] || [regionKey];
}
