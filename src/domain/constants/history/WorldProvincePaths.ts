/**
 * WorldProvincePaths.ts
 * Avrupa, Orta Doğu, Kuzey Afrika ve Kafkasya (EMENA) bölgesi için SVG harita sınırları ve görünüm sabitleri.
 * ViewBox: "0 0 1000 500"
 */

export const WORLD_VIEWBOX = "0 0 1000 500";

export interface WorldCountryPath {
  id: string;
  name: string;
  d: string;
}

export const WORLD_COUNTRY_PATHS: WorldCountryPath[] = [
  // Anadolu & Trakya (Türkiye)
  {
    id: "turkey",
    name: "Anadolu & Trakya",
    d: "M 480 160 L 520 150 L 580 152 L 640 160 L 680 170 L 670 200 L 620 215 L 560 210 L 510 215 L 475 195 Z",
  },
  // Yunanistan & Mora
  {
    id: "greece",
    name: "Yunanistan & Mora",
    d: "M 445 165 L 475 160 L 470 190 L 450 205 L 435 190 Z",
  },
  // Balkanlar (Sırbistan, Bosna, Macaristan, Romanya)
  {
    id: "balkans",
    name: "Balkanlar & Macaristan",
    d: "M 380 100 L 450 95 L 485 130 L 475 160 L 420 165 L 375 135 Z",
  },
  // Avusturya & Viyana
  {
    id: "austria",
    name: "Avusturya",
    d: "M 330 80 L 390 75 L 400 100 L 340 105 Z",
  },
  // Polonya & Ukrayna (Podolya)
  {
    id: "podolia",
    name: "Polonya & Ukrayna (Podolya)",
    d: "M 410 40 L 540 35 L 570 95 L 450 95 Z",
  },
  // Kırım Hanlığı
  {
    id: "crimea",
    name: "Kırım Hanlığı",
    d: "M 600 115 L 645 110 L 650 135 L 610 138 Z",
  },
  // Suriye & Lübnan
  {
    id: "syria",
    name: "Suriye & Levant",
    d: "M 570 215 L 615 210 L 625 255 L 580 260 Z",
  },
  // Irak & Bağdat
  {
    id: "iraq",
    name: "Irak",
    d: "M 625 235 L 685 225 L 705 285 L 640 280 Z",
  },
  // İran / Safevi Devleti
  {
    id: "iran",
    name: "İran (Safeviler)",
    d: "M 685 200 L 840 190 L 860 300 L 705 285 Z",
  },
  // Mısır & Nil Vadisi
  {
    id: "egypt",
    name: "Mısır",
    d: "M 530 280 L 615 270 L 625 380 L 535 375 Z",
  },
  // Trablusgarp (Libya)
  {
    id: "libya",
    name: "Trablusgarp (Libya)",
    d: "M 310 270 L 530 270 L 535 375 L 315 360 Z",
  },
  // Cezayir & Tunus
  {
    id: "algeria",
    name: "Cezayir & Tunus",
    d: "M 150 240 L 310 240 L 310 320 L 160 310 Z",
  },
  // Girit Adası
  {
    id: "crete",
    name: "Girit Adası",
    d: "M 480 240 L 515 240 L 515 250 L 480 250 Z",
  },
  // Kıbrıs Adası
  {
    id: "cyprus",
    name: "Kıbrıs Adası",
    d: "M 560 228 L 585 224 L 580 234 L 558 234 Z",
  },
];
