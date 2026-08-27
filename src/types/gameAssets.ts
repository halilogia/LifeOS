/**
 * Types for Free Game Assets module.
 * Feeds from Itch.io, Kenney.nl, OpenGameArt.org, and GamerPower Loot.
 */

export type AssetCategory =
  | "all"
  | "2d"
  | "3d"
  | "audio"
  | "ui"
  | "textures"
  | "loot";

export type AssetSource =
  | "all"
  | "itch"
  | "kenney"
  | "opengameart"
  | "gamerpower";

export interface GameAssetItem {
  id: string;
  title: string;
  thumbnail: string;
  link: string;
  description: string;
  source: "itch" | "kenney" | "opengameart" | "gamerpower";
  category: AssetCategory;
  license?: string; // e.g. "CC0", "Free / 100% Off", "Open Source", "DLC Free"
  author?: string;
  publishedDate?: string;
  price?: string; // "$0.00" or original price if discounted
  isPermanent?: boolean;
}

export interface CachedGameAssets {
  timestamp: number;
  data: GameAssetItem[];
}

export interface AssetHubShortcut {
  name: string;
  url: string;
  description: string;
  badge?: string;
  category: "3d" | "2d" | "audio" | "ui" | "textures" | "all";
}
