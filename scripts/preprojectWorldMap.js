import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const OUT_PATH = path.join(__dirname, '../src/domain/constants/history/worldCountryFeaturesData.ts');

const PROJECTION_WIDTH = 1000;
const PROJECTION_HEIGHT = 500;

const emenaProjection = d3
  .geoMercator()
  .center([28.0, 36.5])
  .scale(540)
  .translate([PROJECTION_WIDTH / 2, PROJECTION_HEIGHT / 2]);

const emenaPathGenerator = d3.geoPath().projection(emenaProjection);

async function main() {
  console.log('🔄 Fetching & pre-projecting World 110m TopoJSON for 0ms Instant Loading...');
  const res = await fetch(URL);
  const topoData = await res.json();

  const geoCollection = topojson.feature(
    topoData,
    topoData.objects.countries
  );

  const features = geoCollection.features
    .map((feature) => {
      const pathD = emenaPathGenerator(feature);
      const rawId = String(feature.id || '');
      const id = rawId.padStart(3, '0');
      return {
        id,
        d: pathD || '',
        name: feature.properties?.name || id,
      };
    })
    .filter((f) => f.d.length > 0);

  const code = `/**
 * worldCountryFeaturesData.ts
 * Pre-projected 0-delay D3 Mercator World Map paths.
 * Guarantees 0ms instant render with 0 flash of old geometric fallbacks!
 */
export interface CountryGeoFeature {
  id: string;
  d: string;
  name: string;
}

export const PREPROJECTED_WORLD_FEATURES: CountryGeoFeature[] = ${JSON.stringify(features, null, 2)};
`;

  fs.writeFileSync(OUT_PATH, code, 'utf-8');
  console.log(`🎉 SUCCESS! Generated ${features.length} pre-projected country paths in worldCountryFeaturesData.ts!`);
}

main();
