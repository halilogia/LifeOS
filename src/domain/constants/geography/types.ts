/**
 * types.ts
 * Türkiye fiziki, beşeri ve ekonomik coğrafya haritası tipleri ve konu metadataları.
 */

export interface GeoPin {
  name: string;
  city: string;
  x: number;
  y: number;
  description?: string;
  examTip?: string;
  category?: string;
}

export type TurkeyMapCategory = "fiziki" | "beseri" | "ekonomik" | "general";

export type TurkeyMapTopic =
  // 1. Fiziki Coğrafya
  | "mountains"  // Tüm dağlar (kıvrım + kırık + volkanik birleşik)
  | "kivrim"
  | "kirik"
  | "volcanic"
  | "plains"
  | "lakes"
  | "rivers"
  | "plateaus"
  | "coasts"
  | "karst"
  | "passes"
  | "gates"
  | "unesco"
  | "gulfs"
  | "climate_rain"
  // 2. Beşeri Coğrafya
  | "population"
  | "dwellings"
  | "development_projects"
  // 3. Ekonomik Coğrafya
  | "agriculture"
  | "livestock"
  | "mines"
  | "energy"
  | "industry"
  | "transport_borders"
  | "tourism_unesco"
  // 4. Genel
  | "all";

export interface MapCategoryMeta {
  id: TurkeyMapCategory;
  titleKey: string;
  icon: string;
  color: string;
}

export interface MapTopicMeta {
  id: TurkeyMapTopic;
  category: TurkeyMapCategory;
  color: string;
  legendKey: string;
}

export const MAP_VIEWBOX = "0 0 1000.0 421.9991241865445";

export const MAP_CATEGORIES: MapCategoryMeta[] = [
  { id: "fiziki", titleKey: "kpss_map_cat_fiziki", icon: "🏔️", color: "#16a34a" },
  { id: "beseri", titleKey: "kpss_map_cat_beseri", icon: "👥", color: "#3b82f6" },
  { id: "ekonomik", titleKey: "kpss_map_cat_ekonomik", icon: "🏭", color: "#f59e0b" },
  { id: "general", titleKey: "kpss_map_cat_general", icon: "🗺️", color: "#9333ea" },
];

export const MAP_TOPICS: MapTopicMeta[] = [
  // Fiziki Coğrafya
  { id: "mountains", category: "fiziki", color: "#6b7280", legendKey: "kpss_map_legend_mountains" },
  { id: "kivrim", category: "fiziki", color: "#16a34a", legendKey: "kpss_map_legend_kivrim" },
  { id: "kirik", category: "fiziki", color: "#dc2626", legendKey: "kpss_map_legend_kirik" },
  { id: "volcanic", category: "fiziki", color: "#ea580c", legendKey: "kpss_map_legend_volcanic" },
  { id: "plains", category: "fiziki", color: "#65a30d", legendKey: "kpss_map_legend_plains" },
  { id: "lakes", category: "fiziki", color: "#2563eb", legendKey: "kpss_map_legend_lakes" },
  { id: "rivers", category: "fiziki", color: "#0ea5e9", legendKey: "kpss_map_legend_rivers" },
  { id: "plateaus", category: "fiziki", color: "#ca8a04", legendKey: "kpss_map_legend_plateaus" },
  { id: "coasts", category: "fiziki", color: "#0284c7", legendKey: "kpss_map_legend_coasts" },
  { id: "karst", category: "fiziki", color: "#d97706", legendKey: "kpss_map_legend_karst" },
  { id: "passes", category: "fiziki", color: "#be123c", legendKey: "kpss_map_legend_passes" },
  { id: "gates", category: "fiziki", color: "#4c1d95", legendKey: "kpss_map_legend_gates" },
  { id: "unesco", category: "fiziki", color: "#7c3aed", legendKey: "kpss_map_legend_unesco" },
  { id: "gulfs", category: "fiziki", color: "#64748b", legendKey: "kpss_map_legend_gulfs" },
  { id: "climate_rain", category: "fiziki", color: "#059669", legendKey: "kpss_map_legend_climate_rain" },

  // Beşeri Coğrafya
  { id: "population", category: "beseri", color: "#8b5cf6", legendKey: "kpss_map_legend_population" },
  { id: "dwellings", category: "beseri", color: "#ec4899", legendKey: "kpss_map_legend_dwellings" },
  { id: "development_projects", category: "beseri", color: "#6366f1", legendKey: "kpss_map_legend_development_projects" },

  // Ekonomik Coğrafya
  { id: "agriculture", category: "ekonomik", color: "#84cc16", legendKey: "kpss_map_legend_agriculture" },
  { id: "livestock", category: "ekonomik", color: "#eab308", legendKey: "kpss_map_legend_livestock" },
  { id: "mines", category: "ekonomik", color: "#ef4444", legendKey: "kpss_map_legend_mines" },
  { id: "energy", category: "ekonomik", color: "#f97316", legendKey: "kpss_map_legend_energy" },
  { id: "industry", category: "ekonomik", color: "#64748b", legendKey: "kpss_map_legend_industry" },
  { id: "transport_borders", category: "ekonomik", color: "#14b8a6", legendKey: "kpss_map_legend_transport_borders" },
  { id: "tourism_unesco", category: "ekonomik", color: "#a855f7", legendKey: "kpss_map_legend_tourism_unesco" },

  // Karma / Tüm Konular
  { id: "all", category: "general", color: "#9333ea", legendKey: "kpss_map_legend_all" },
];

/** Harita bilgi çubuğunda gösterilen alt kategori (tür) renk ve açıklamaları */
export interface CategoryMeta {
  name: string;
  color: string;
  note: string;
}

export const CATEGORY_LEGEND: Record<string, CategoryMeta> = {
  // Platolar
  "Aşınım":         { name: "Aşınım",         color: "#ef4444", note: "Akarsuların yüksek düzlükleri aşındırmasıyla oluşur." },
  "Tabaka Düzlüğü": { name: "Tabaka Düzlüğü", color: "#3b82f6", note: "Yatay tabakaların aşınmasıyla oluşan düzlüklerdir." },
  "Karstik":        { name: "Karstik",         color: "#f59e0b", note: "Kireç taşının çözünmesiyle oluşan çukurlarda birikir/oluşur." },
  "Volkanik":       { name: "Volkanik",         color: "#a855f7", note: "Lavların geniş alanlara yayılıp katılaşmasıyla oluşur." },

  // Göller
  "Tektonik":         { name: "Tektonik",         color: "#ec4899", note: "Yer kabuğu hareketleriyle oluşan çanaklarda birikir." },
  "Karstik Tektonik": { name: "Karstik Tektonik", color: "#06b6d4", note: "Tektonik çukurların karstik erime ile genişlemesiyle oluşur." },
  "Heyelan Set":      { name: "Heyelan Set",      color: "#f97316", note: "Vadinin heyelanla tıkanması sonucu oluşur." },
  "Alüvyal Set":      { name: "Alüvyal Set",      color: "#22c55e", note: "Akarsuyun getirdiği alüvyonların vadi önünü tıkamasıyla oluşur." },
  "Kıyı Set":         { name: "Kıyı Set",         color: "#e879f9", note: "Kıyı okunun koyu kapatmasıyla oluşan lagündür." },
  "Volkanik Set":     { name: "Volkanik Set",      color: "#fb7185", note: "Volkanik lavların bir vadiyi kapatmasıyla oluşur." },
  "Karma":            { name: "Karma",             color: "#94a3b8", note: "Birden fazla yer şekillendirme sürecinin ortak etkisiyle oluşur." },

  // Dağlar
  "Kıvrım": { name: "Kıvrım", color: "#84cc16", note: "Levha hareketleriyle kıvrılarak yükselen dağlardır." },
  "Kırık":  { name: "Kırık",  color: "#f43f5e", note: "Faylanma sonucu blokların yükselmesiyle oluşan dağlardır." },

  // Ovalar
  "Göl Tabanı":  { name: "Göl Tabanı",  color: "#1e293b", note: "Kuruyan veya çekilen göllerin tabanında kalan düzlüklerdir." },

  // Akarsular (Döküldüğü Yer)
  "Karadeniz":    { name: "Karadeniz",    color: "#475569", note: "Karadeniz'e dökülen açık havza akarsularıdır." },
  "Marmara":      { name: "Marmara",      color: "#2563eb", note: "Marmara Denizi'ne dökülen akarsulardır." },
  "Ege":          { name: "Ege Denizi",   color: "#ca8a04", note: "Ege Denizi'ne dökülen ve genelde batı-doğu akan akarsulardır." },
  "Akdeniz":      { name: "Akdeniz",      color: "#16a34a", note: "Akdeniz'e dökülen ve genelde Toroslar'dan beslenen akarsulardır." },
  "Basra Körfezi":{ name: "Basra Körfezi",color: "#dc2626", note: "Fırat ve Dicle gibi Basra'ya ulaşan açık havza akarsularıdır." },
  "Hazar Denizi": { name: "Hazar Denizi", color: "#06b6d4", note: "Kura ve Aras gibi Hazar'a ulaşan kapalı havza akarsularıdır." },

  // Geçitler
  "Karadeniz Geçitleri": { name: "Karadeniz Bölgesi", color: "#16a34a", note: "Kuzey Anadolu Dağları üzerindeki geçitlerdir." },
  "Akdeniz Geçitleri":   { name: "Akdeniz Bölgesi", color: "#ea580c", note: "Toroslar üzerindeki önemli bağlantı geçitleridir." },

  // UNESCO
  "Tarihi Eserler": { name: "Tarihi Eserler", color: "#ef4444", note: "Cami, külliye ve kaleden oluşan yapılar." },
  "Tarihi Alanlar": { name: "Tarihi Alanlar", color: "#3b82f6", note: "Antik kentler ve arkeolojik sit alanları." },
  "Karma Miras":    { name: "Karma Miras",     color: "#eab308", note: "Doğal ve kültürel mirasın bir arada olduğu alanlar." },

  // Sınır Kapıları
  "Yunanistan":  { name: "Yunanistan",  color: "#ef4444", note: "Batı sınırındaki Yunanistan kapıları." },
  "Bulgaristan": { name: "Bulgaristan", color: "#3b82f6", note: "Batı sınırındaki Bulgaristan kapıları." },
  "Gürcistan":   { name: "Gürcistan",   color: "#eab308", note: "Kuzeydoğu sınırındaki Gürcistan kapıları." },
  "Ermenistan":  { name: "Ermenistan",  color: "#f59e0b", note: "Doğu sınırındaki Ermenistan kapıları (kapalı)." },
  "Nahçıvan":    { name: "Nahçıvan",    color: "#8b5cf6", note: "Azerbaycan'a bağlı Nahçıvan kapısı." },
  "İran":        { name: "İran",        color: "#1e293b", note: "Doğu sınırındaki İran kapıları." },
  "Irak":        { name: "Irak",        color: "#94a3b8", note: "Güneydoğu sınırındaki Irak kapıları." },
  "Suriye":      { name: "Suriye",      color: "#ec4899", note: "Güney sınırındaki Suriye kapıları." },

  // Kıyı Tipleri
  "Kalanklı":  { name: "Kalanklı",  color: "#ef4444", note: "Karstik erime sonucu oluşan kıyılardır." },
  "Dalmaçya":  { name: "Dalmaçya",  color: "#3b82f6", note: "Vadilerin sular altında kalmasıyla oluşur." },
  "Enine":     { name: "Enine",     color: "#eab308", note: "Dağların kıyıya dik uzandığı bölgelerde görülür." },
  "Boyuna":    { name: "Boyuna",    color: "#22c55e", note: "Dağların kıyıya paralel uzandığı hatlarda görülür." },
  "Ria":       { name: "Ria",       color: "#8b5cf6", note: "Akarsu vadilerinin sular altında kalmasıyla oluşur." },
  "Limanlı":   { name: "Limanlı",   color: "#1e293b", note: "Kıyı setlerinin koyların önünü kapatmasıyla oluşur." },

  // Körfezler
  "Marmara Körfezleri": { name: "Marmara Denizi Körfezleri", color: "#ef4444", note: "Marmara bölgesindeki girintili körfezler." },
  "Ege Körfezleri":     { name: "Ege Denizi Körfezleri",     color: "#3b82f6", note: "Ege bölgesindeki girintili körfezler." },
  "Akdeniz Körfezleri": { name: "Akdeniz Körfezleri",         color: "#eab308", note: "Akdeniz bölgesindeki girintili körfezler." },
  "Karadeniz Körfezleri":{ name: "Karadeniz Körfezleri",      color: "#22c55e", note: "Karadeniz bölgesindeki girintili körfezler." },
};

