/**
 * geography/index.ts
 * Türkiye fiziki, beşeri ve ekonomik coğrafya verilerinin merkezi dışa aktarım modülü.
 */

import type { GeoPin, TurkeyMapTopic } from "./types.js";
import { KIVRIM_MOUNTAINS } from "./kivrimMountains.js";
import { KIRIK_MOUNTAINS } from "./kirikMountains.js";
import { VOLCANIC_MOUNTAINS } from "./volcanicMountains.js";
import { TURKEY_PLAINS } from "./turkeyPlains.js";
import { TURKEY_LAKES } from "./turkeyLakes.js";
import { TURKEY_RIVERS } from "./turkeyRivers.js";
import { TURKEY_PLATEAUS } from "./turkeyPlateaus.js";
import { TURKEY_COASTS } from "./coasts.js";
import { TURKEY_KARST } from "./karst.js";
import { TURKEY_PASSES } from "./turkeyPasses.js";
import { TURKEY_GATES } from "./turkeyGates.js";
import { TURKEY_GULFS } from "./turkeyGulfs.js";
import { TURKEY_UNESCO } from "./unesco.js";
import { TURKEY_CLIMATE_RAIN } from "./climateRain.js";
import { TURKEY_POPULATION, TURKEY_DWELLINGS } from "./population.js";
import { TURKEY_DEVELOPMENT_PROJECTS } from "./developmentProjects.js";
import { TURKEY_AGRICULTURE } from "./agriculture.js";
import { TURKEY_LIVESTOCK } from "./livestock.js";
import { TURKEY_MINES } from "./mines.js";
import { TURKEY_ENERGY } from "./energy.js";
import {
  TURKEY_TRANSPORT_BORDERS,
  TURKEY_INDUSTRY,
} from "./transportBorders.js";

export * from "./types.js";
export * from "./kivrimMountains.js";
export * from "./kirikMountains.js";
export * from "./volcanicMountains.js";
export * from "./turkeyPlains.js";
export * from "./turkeyLakes.js";
export * from "./turkeyRivers.js";
export * from "./turkeyPlateaus.js";
export * from "./turkeyPasses.js";
export * from "./turkeyGates.js";
export * from "./turkeyGulfs.js";
export * from "./unesco.js";
export * from "./coasts.js";
export * from "./karst.js";
export * from "./climateRain.js";
export * from "./population.js";
export * from "./developmentProjects.js";
export * from "./agriculture.js";
export * from "./livestock.js";
export * from "./mines.js";
export * from "./energy.js";
export * from "./transportBorders.js";

export const ALL_GEOGRAPHY_PINS: GeoPin[] = [
  ...KIVRIM_MOUNTAINS,
  ...KIRIK_MOUNTAINS,
  ...VOLCANIC_MOUNTAINS,
  ...TURKEY_PLAINS,
  ...TURKEY_LAKES,
  ...TURKEY_RIVERS,
  ...TURKEY_PLATEAUS,
  ...TURKEY_COASTS,
  ...TURKEY_KARST,
  ...TURKEY_PASSES,
  ...TURKEY_GATES,
  ...TURKEY_GULFS,
  ...TURKEY_UNESCO,
  ...TURKEY_CLIMATE_RAIN,
  ...TURKEY_POPULATION,
  ...TURKEY_DWELLINGS,
  ...TURKEY_DEVELOPMENT_PROJECTS,
  ...TURKEY_AGRICULTURE,
  ...TURKEY_LIVESTOCK,
  ...TURKEY_MINES,
  ...TURKEY_ENERGY,
  ...TURKEY_INDUSTRY,
  ...TURKEY_TRANSPORT_BORDERS,
];

export const TOPIC_PINS: Record<TurkeyMapTopic, GeoPin[]> = {
  // 1. Fiziki Coğrafya
  mountains: [...KIVRIM_MOUNTAINS, ...KIRIK_MOUNTAINS, ...VOLCANIC_MOUNTAINS],
  kivrim: KIVRIM_MOUNTAINS,
  kirik: KIRIK_MOUNTAINS,
  volcanic: VOLCANIC_MOUNTAINS,
  plains: TURKEY_PLAINS,
  lakes: TURKEY_LAKES,
  rivers: TURKEY_RIVERS,
  plateaus: TURKEY_PLATEAUS,
  coasts: TURKEY_COASTS,
  karst: TURKEY_KARST,
  passes: TURKEY_PASSES,
  gates: TURKEY_GATES,
  gulfs: TURKEY_GULFS,
  climate_rain: TURKEY_CLIMATE_RAIN,

  // 2. Beşeri Coğrafya
  population: TURKEY_POPULATION,
  dwellings: TURKEY_DWELLINGS,
  development_projects: TURKEY_DEVELOPMENT_PROJECTS,

  // 3. Ekonomik Coğrafya
  agriculture: TURKEY_AGRICULTURE,
  livestock: TURKEY_LIVESTOCK,
  mines: TURKEY_MINES,
  energy: TURKEY_ENERGY,
  industry: TURKEY_INDUSTRY,
  transport_borders: TURKEY_TRANSPORT_BORDERS,
  unesco: TURKEY_UNESCO,

  // 4. Genel
  all: ALL_GEOGRAPHY_PINS,
};
