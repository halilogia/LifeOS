import type { GeoPin } from "./types.js";

export const TURKEY_RIVERS: GeoPin[] = [
  // Karadeniz'e Dökülenler — Doğu Karadeniz ve Kuzey Anadolu'dan akanlar.
  { name: "Çoruh",      city: "Artvin",          x: 825.0, y: 75.0,  category: "Karadeniz" },
  { name: "Harşit",     city: "Giresun",         x: 685.0, y: 88.0,  category: "Karadeniz" },
  { name: "Yeşilırmak", city: "Samsun",          x: 585.0, y: 85.0,  category: "Karadeniz" },
  { name: "Kızılırmak", city: "Samsun",          x: 540.0, y: 75.0,  category: "Karadeniz" },
  { name: "Bartın",     city: "Bartın",          x: 395.0, y: 55.0,  category: "Karadeniz" },
  { name: "Sakarya",    city: "Sakarya",         x: 235.0, y: 75.0,  category: "Karadeniz" },

  // Marmara'ya Dökülenler
  { name: "Susurluk",   city: "Balıkesir",       x: 155.0, y: 125.0, category: "Marmara" },

  // Ege'ye Dökülenler
  { name: "Meriç",             city: "Edirne",          x: 85.0,  y: 45.0,  category: "Ege" },
  { name: "Bakırçay",          city: "İzmir",           x: 65.0,  y: 195.0, category: "Ege" },
  { name: "Gediz",             city: "İzmir",           x: 85.0,  y: 215.0, category: "Ege" },
  { name: "Küçük Menderes",    city: "İzmir",           x: 95.0,  y: 255.0, category: "Ege" },
  { name: "Büyük Menderes",    city: "Aydın",           x: 105.0, y: 285.0, category: "Ege" },

  // Akdeniz'e Dökülenler
  { name: "Köprü",      city: "Antalya",         x: 245.0, y: 355.0, category: "Akdeniz" },
  { name: "Manavgat",   city: "Antalya",         x: 265.0, y: 365.0, category: "Akdeniz" },
  { name: "Göksu",      city: "Mersin",          x: 375.0, y: 375.0, category: "Akdeniz" },
  { name: "Seyhan",     city: "Adana",           x: 485.0, y: 365.0, category: "Akdeniz" },
  { name: "Ceyhan",     city: "Adana",           x: 515.0, y: 365.0, category: "Akdeniz" },
  { name: "Asi",        city: "Hatay",           x: 565.0, y: 395.0, category: "Akdeniz" },

  // Basra Körfezi'ne Dökülenler (Açık Havza)
  { name: "Fırat",      city: "Şanlıurfa",       x: 685.0, y: 355.0, category: "Basra Körfezi" },
  { name: "Dicle",      city: "Şırnak",          x: 775.0, y: 345.0, category: "Basra Körfezi" },

  // Hazar Denizi'ne Dökülenler (Kapalı Havza)
  { name: "Kura",       city: "Ardahan",         x: 885.0, y: 55.0,  category: "Hazar Denizi" },
  { name: "Aras",       city: "Iğdır",           x: 915.0, y: 115.0, category: "Hazar Denizi" },
];
