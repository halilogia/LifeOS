import fs from 'fs';
import path from 'path';

const historyDir = './src/domain/constants/history';
const outputFile = './docs/history_summary.md';

const files = [
  'selcukluUnit.ts', 'osmanliKurulusUnit.ts', 'osmanliYukselmeUnit.ts', 
  'osmanliDuraklamaUnit.ts', 'osmanliGerilemeUnit.ts', 'osmanliDagilmaUnit.ts', 
  'kurtulusSavasiUnit.ts', 'beyliklerUnit.ts', 'ilkDonemBeyliklerUnit.ts',
  'ekonomiKulturUnit.ts', 'osmanliTeskilatUnit.ts'
];

let mdContent = '# Tarih Konu Özetleri\n\n';

files.forEach(file => {
  const filePath = path.join(historyDir, file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const topicName = file.replace('Unit.ts', '').toUpperCase();
  
  mdContent += `## ${topicName}\n\n`;

  // Extract subtitle line from source
  const subtitleMatch = content.match(/subtitle:\s*"([^"]+)"/);
  if (subtitleMatch) {
    mdContent += `- ${subtitleMatch[1]}\n`;
  }

  // Extract events with year + title
  const eventRegex = /{\s*\n?\s*year:\s*(\d+),\s*\n?\s*title:\s*"([^"]+)"/g;
  let match;
  const events = [];
  
  while ((match = eventRegex.exec(content)) !== null) {
    const year = parseInt(match[1], 10);
    const title = match[2];
    // Skip unit-level umbrella titles
    if (title.includes('Devleti') && (title.includes('Dönemi') || title.includes('Kuruluş') || title.includes('Kültür'))) continue;
    events.push({ year, title });
  }
  
  // Sort by year
  events.sort((a, b) => a.year - b.year);
  
  events.forEach(ev => {
    mdContent += `- **${ev.year}** — ${ev.title}\n`;
  });
  
  mdContent += '\n';
});

fs.writeFileSync(outputFile, mdContent);
console.log('History summary generated at:', outputFile);
