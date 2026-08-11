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
  | "kivrim"
  | "kirik"
  | "volcanic"
  | "plains"
  | "lakes"
  | "rivers"
  | "plateaus"
  | "coasts"
  | "karst"
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
  { id: "kivrim", category: "fiziki", color: "#16a34a", legendKey: "kpss_map_legend_kivrim" },
  { id: "kirik", category: "fiziki", color: "#dc2626", legendKey: "kpss_map_legend_kirik" },
  { id: "volcanic", category: "fiziki", color: "#ea580c", legendKey: "kpss_map_legend_volcanic" },
  { id: "plains", category: "fiziki", color: "#65a30d", legendKey: "kpss_map_legend_plains" },
  { id: "lakes", category: "fiziki", color: "#2563eb", legendKey: "kpss_map_legend_lakes" },
  { id: "rivers", category: "fiziki", color: "#0ea5e9", legendKey: "kpss_map_legend_rivers" },
  { id: "plateaus", category: "fiziki", color: "#ca8a04", legendKey: "kpss_map_legend_plateaus" },
  { id: "coasts", category: "fiziki", color: "#0284c7", legendKey: "kpss_map_legend_coasts" },
  { id: "karst", category: "fiziki", color: "#d97706", legendKey: "kpss_map_legend_karst" },
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

