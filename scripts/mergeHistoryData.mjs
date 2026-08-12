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
  
  // Regex to extract history events/concepts by title
  const itemRegex = /title:\s*"([^"]+)"/g;
  let match;
  
  const categories = {};
  
  while ((match = itemRegex.exec(content)) !== null) {
    // Ignore internal nav titles, only get event titles
    if (match[1].includes('Anadolu') || match[1].includes('Osmanlı')) continue; 
    
    if (!categories[topicName]) categories[topicName] = [];
    categories[topicName].push(match[1]);
  }
  
  if (categories[topicName]) {
      categories[topicName].forEach(title => {
          mdContent += `- ${title}\n`;
      });
      mdContent += '\n';
  }
});

fs.writeFileSync(outputFile, mdContent);
console.log('History summary generated at:', outputFile);
