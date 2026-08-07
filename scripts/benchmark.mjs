import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

console.log("==========================================");
console.log(" 🚀 ZenTodo Performans & Benchmark Raporu ");
console.log("==========================================\n");

// 1. Bundle & Chunks Audit
const distAssetsPath = path.join(process.cwd(), "dist", "assets");
if (fs.existsSync(distAssetsPath)) {
  const files = fs.readdirSync(distAssetsPath);
  let totalJsSize = 0;
  let totalCssSize = 0;
  let newtabJsSize = 0;

  files.forEach((file) => {
    const fullPath = path.join(distAssetsPath, file);
    const stat = fs.statSync(fullPath);
    if (file.endsWith(".js")) {
      totalJsSize += stat.size;
      if (file.startsWith("newtab-")) {
        newtabJsSize = stat.size;
      }
    } else if (file.endsWith(".css")) {
      totalCssSize += stat.size;
    }
  });

  console.log("📦 1. DERLEME PAKET BOYUTLARI (Bundle Audit)");
  console.log(`   - Ana Sekme JS (newtab.js): ${(newtabJsSize / 1024).toFixed(2)} KB`);
  console.log(`   - Toplam Üretilen JS: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`   - Toplam Üretilen CSS: ${(totalCssSize / 1024).toFixed(2)} KB\n`);
} else {
  console.log("⚠️ dist/assets bulunamadı. Lütfen önce `npm run build` çalıştırın.\n");
}

// 2. Storage & Serialization Throughput Test
console.log("⚡ 2. VERİ SERİLEŞTİRME & BELLEK İŞLEME HIZI");

const mockTodos = Array.from({ length: 2000 }, (_, i) => ({
  id: `todo-${i}`,
  text: `Örnek Görev Tanımı ${i} - Detaylı açıklama metni ve etiketler`,
  completed: i % 2 === 0,
  createdAt: new Date().toISOString(),
  urgent: i % 3 === 0,
  important: i % 4 === 0,
  status: i % 2 === 0 ? "done" : "todo",
}));

const t0 = performance.now();
const jsonStr = JSON.stringify(mockTodos);
const t1 = performance.now();
const parsed = JSON.parse(jsonStr);
const t2 = performance.now();

console.log(`   - 2,000 Görev Stringify Süresi: ${(t1 - t0).toFixed(3)} ms`);
console.log(`   - 2,000 Görev Parse Süresi:     ${(t2 - t1).toFixed(3)} ms`);
console.log(`   - Oluşan JSON Boyutu:            ${(jsonStr.length / 1024).toFixed(2)} KB\n`);

// 3. Filtering & Sorting Micro-benchmark
console.log("🔍 3. SORGULAMA VE FİLTRELEME PERFORMANSI");

const t3 = performance.now();
for (let iter = 0; iter < 100; iter++) {
  const filtered = mockTodos.filter((t) => !t.completed && t.urgent && t.important);
  const sorted = filtered.sort((a, b) => a.text.localeCompare(b.text));
}
const t4 = performance.now();

console.log(`   - 2,000 Görev x 100 Filtreleme & Sıralama Döngüsü: ${(t4 - t3).toFixed(3)} ms (Ortalama: ${((t4 - t3) / 100).toFixed(4)} ms/op)\n`);

// 4. Memory Footprint
const memoryUsage = process.memoryUsage();
console.log("💾 4. ÇALIŞMA ZAMANI BELLEK KULLANIMI (Process Memory)");
console.log(`   - RSS (Resident Set Size): ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Heap Used:                ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Heap Total:               ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB\n`);

console.log("==========================================");
console.log(" ✅ Performans Testi Tamamlandı! ");
console.log("==========================================");
