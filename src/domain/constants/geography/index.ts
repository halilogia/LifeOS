/**
 * geography/index.ts
 * Coğrafya verilerinin merkezi dışa aktarım modülü.
 */

import type { GeoPin, TurkeyMapTopic } from "./types.js";
import { KIVRIM_MOUNTAINS } from "./kivrimMountains.js";
import { KIRIK_MOUNTAINS } from "./kirikMountains.js";
import { VOLCANIC_MOUNTAINS } from "./volcanicMountains.js";
import { TURKEY_PLAINS } from "./turkeyPlains.js";
import { TURKEY_LAKES } from "./turkeyLakes.js";
import { TURKEY_RIVERS } from "./turkeyRivers.js";
import { TURKEY_PLATEAUS } from "./turkeyPlateaus.js";

export * from "./types.js";
export * from "./kivrimMountains.js";
export * from "./kirikMountains.js";
export * from "./volcanicMountains.js";
export * from "./turkeyPlains.js";
export * from "./turkeyLakes.js";
export * from "./turkeyRivers.js";
export * from "./turkeyPlateaus.js";

export const ALL_GEOGRAPHY_PINS: GeoPin[] = [
  ...KIVRIM_MOUNTAINS,
  ...KIRIK_MOUNTAINS,
  ...VOLCANIC_MOUNTAINS,
  ...TURKEY_PLAINS,
  ...TURKEY_LAKES,
  ...TURKEY_RIVERS,
  ...TURKEY_PLATEAUS,
];

export const TOPIC_PINS: Record<TurkeyMapTopic, GeoPin[]> = {
  kivrim: KIVRIM_MOUNTAINS,
  kirik: KIRIK_MOUNTAINS,
  volcanic: VOLCANIC_MOUNTAINS,
  plains: TURKEY_PLAINS,
  lakes: TURKEY_LAKES,
  rivers: TURKEY_RIVERS,
  plateaus: TURKEY_PLATEAUS,
  all: ALL_GEOGRAPHY_PINS,
};
