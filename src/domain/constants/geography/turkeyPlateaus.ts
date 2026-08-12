import type { GeoPin } from "./types.js";

export const TURKEY_PLATEAUS: GeoPin[] = [
  // Aşınım — Akarsuların yüksek düzlükleri aşındırmasıyla oluşan platolardır.
  { name: "Çatalca-Kocaeli Platosu", city: "İstanbul", x: 190.4, y: 69.8, category: "Aşınım" },

  // Tabaka Düzlüğü — Yatay tabakaların akarsular tarafından aşındırılmasıyla oluşur.
  { name: "Yazılıkaya Platosu", city: "Eskişehir", x: 250.0, y: 190.0, category: "Tabaka Düzlüğü" },
  { name: "Haymana Platosu", city: "Ankara", x: 367.9, y: 181.3, category: "Tabaka Düzlüğü" },
  { name: "Cihanbeyli Platosu", city: "Konya", x: 383.6, y: 221.8, category: "Tabaka Düzlüğü" },
  { name: "Bozok Platosu", city: "Yozgat", x: 488.0, y: 161.0, category: "Tabaka Düzlüğü" },
  { name: "Uzunyayla Platosu", city: "Sivas", x: 566.3, y: 208.3, category: "Tabaka Düzlüğü" },
  { name: "Gaziantep Platosu", city: "Gaziantep", x: 592.4, y: 323.0, category: "Tabaka Düzlüğü" },
  { name: "Şanlıurfa Platosu", city: "Şanlıurfa", x: 686.3, y: 336.5, category: "Tabaka Düzlüğü" },
  { name: "Adıyaman Platosu", city: "Adıyaman", x: 640.0, y: 300.0, category: "Tabaka Düzlüğü" },
  { name: "Diyarbakır Platosu", city: "Diyarbakır", x: 740.0, y: 300.0, category: "Tabaka Düzlüğü" },

  // Karstik — Kireç taşının çözünmesiyle oluşan engebeli platolardır.
  { name: "Teke Platosu", city: "Antalya", x: 216.5, y: 370.2, category: "Karstik" },
  { name: "Taşeli Platosu", city: "Karaman/Mersin", x: 378.4, y: 356.8, category: "Karstik" },
  { name: "Obruk Platosu", city: "Konya", x: 394.0, y: 289.0, category: "Tabaka Düzlüğü" },

  // Volkanik (Lav) — Volkanik lavların geniş alanlara yayılıp katılaşmasıyla oluşur.
  { name: "Ardahan Platosu", city: "Ardahan", x: 860.0, y: 65.0, category: "Volkanik" },
  { name: "Erzurum-Kars Platosu", city: "Erzurum/Kars", x: 853.4, y: 140.8, category: "Volkanik" },
];
