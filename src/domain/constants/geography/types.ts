/**
 * types.ts
 * Türkiye fiziki haritası ortak tipleri ve konu metadataları.
 */

export interface GeoPin {
  name: string;
  city: string;
  x: number;
  y: number;
}

export type TurkeyMapTopic =
  | "kivrim"
  | "kirik"
  | "volcanic"
  | "plains"
  | "lakes"
  | "rivers"
  | "plateaus"
  | "all";

export const MAP_VIEWBOX = "0 0 1000.0 421.9991241865445";

export const MAP_TOPICS: {
  id: TurkeyMapTopic;
  color: string;
  legendKey: string;
}[] = [
  { id: "kivrim", color: "#16a34a", legendKey: "kpss_map_legend_kivrim" },
  { id: "kirik", color: "#dc2626", legendKey: "kpss_map_legend_kirik" },
  { id: "volcanic", color: "#c8511f", legendKey: "kpss_map_legend_volcanic" },
  { id: "plains", color: "#4f8f5b", legendKey: "kpss_map_legend_plains" },
  { id: "lakes", color: "#2563eb", legendKey: "kpss_map_legend_lakes" },
  { id: "rivers", color: "#0ea5e9", legendKey: "kpss_map_legend_rivers" },
  { id: "plateaus", color: "#a16207", legendKey: "kpss_map_legend_plateaus" },
  { id: "all", color: "#9333ea", legendKey: "kpss_map_legend_all" },
];
