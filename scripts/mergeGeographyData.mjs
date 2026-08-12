import fs from 'fs';
import path from 'path';

const geoDir = './src/domain/constants/geography';
const outputFile = './docs/geography_summary.md';

const files = [
  'turkeyPlateaus.ts', 'turkeyLakes.ts', 'turkeyPlains.ts', 'turkeyRivers.ts',
  'kivrimMountains.ts', 'kirikMountains.ts', 'volcanicMountains.ts', 
  'turkeyPasses.ts', 'turkeyGates.ts', 'coasts.ts', 'turkeyGulfs.ts', 'unesco.ts'
];

let mdContent = '# Coğrafya Konu Özetleri\n\n';

files.forEach(file => {
  const filePath = path.join(geoDir, file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  // Dosya isminden topic ismini düzgün çıkar
  let topicName = file.replace('.ts', '').toUpperCase();
  if (topicName.startsWith('TURKEY')) {
    topicName = topicName.replace('TURKEY', '');
  }
  
  mdContent += `## ${topicName}\n\n`;
  
  // Regex to match GeoPin objects more flexibly across lines/whitespace
  const pinRegex = /\{[\s\S]*?name:\s*"([^"]+)",[\s\S]*?city:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)"/g;
  let match;
  
  const categories = {};
  
  while ((match = pinRegex.exec(content)) !== null) {
    const [_, name, city, category] = match;
    if (!categories[category]) categories[category] = [];
    categories[category].push({ name, city });
  }

  for (const [cat, items] of Object.entries(categories)) {
    mdContent += `### ${cat}\n`;
    items.forEach(item => {
      mdContent += `- **${item.name}** (${item.city})\n`;
    });
    mdContent += '\n';
  }
});

fs.writeFileSync(outputFile, mdContent);
console.log('Geography summary generated at:', outputFile);
