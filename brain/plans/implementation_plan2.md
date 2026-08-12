# KPSS Tarih Haritası Entegrasyonu

## Amaç
`archives/anadolu_selcuklu_devleti.html` dosyasındaki interaktif tarih haritasını (kronolojik olay oynatma) mevcut coğrafya haritası mimarisine taşımak. Kullanıcının istediği: coğrafyada yaptığımız gibi (pan/zoom/reset + modern UI) tarihi de entegre etmek.

## Kaynak dosyadan çıkarılanlar
- **EVENTS** (8 olay): Malazgirt 1071, Kuruluş 1075, İznik kaybı 1097, Miryokefalon 1176, Sinop 1214, Alanya 1221, Kösedağ 1243, Sona erme 1308 — her biri: year, title, city, x, y, desc
- **PROVINCES**: zaten `TurkeyProvincePaths.ts`'de var — kopyalanmaz
- **Oynatma mantığı**: play → kronolojik sırayla pin belirir + bilgi kartı; reset; ilerleme göstergesi
- **Görsel desen**: bayrak/çivi pinler, trail animasyonu, bilgi kartı

## Yeni dosyalar

### [NEW] src/domain/constants/TurkeyHistoryData.ts
- `HistoryEvent` interface: `{ id, year, title, city, x, y, desc, color? }`
- `HISTORY_TOPICS`: konu grupları (örn. `anadolu-selcuklu` aktif, diğerleri "yakında" — HTML'deki disabled butonlar gibi)
- `HISTORY_EVENTS: Record<HistoryTopic, HistoryEvent[]>`
- `HISTORY_VIEWBOX` (aynı 1000×422)

### [NEW] src/components/kpss/history/HistoryMapView.tsx
- `TurkeyMapView` deseninde: sidebar konu listesi + harita + kontroller (play/reset/step/progress)
- **Pan + zoom + reset** (coğrafyaya eklediğimiz güncellemeler — tekerlek zoom, sol click pan, reset'te sıfırlama)
- Bilgi kartında: yıl vurgusu + olay başlığı + açıklama + şehir
- Bayrak pinleri (HTML'deki flagpole/flag görseli) + trail bağlantı çizgisi
- `MapControls`/`MapCanvas` gibi parçalama: `HistoryMapView` (tuval) + alt parçalar

### [MODIFY] src/components/KpssView.tsx
- Coğrafya haritasının yanına **Tarih Haritası** girişi (sekme veya kart)

### [MODIFY] src/utils/i18n.ts
- Tarih haritası için çeviri anahtarları (tr/en): `kpss_history_title`, konu adları, butonlar

### [MODIFY] src/ARCHITECTURE.md
- `kpss/history/` yeni satır

## Doğrulama
- `npx tsc --noEmit` → `npx eslint src --quiet` → `npm run build` → `node scripts/findDeadFiles.mjs` (0 ölü dosya)
- Kullanıcı tarayıcıda test: oynat, pan, zoom, reset

## Notlar
- `archives/` dosyası silinmez (kullanıcının referansı) ama veri `TurkeyHistoryData.ts`'e taşınır
- İlk konu: Anadolu Selçuklu (8 olay). Diğer konular (Büyük Selçuklu, Beylikler, Osmanlı kuruluşu, Haçlı) "Yakında" olarak listelenir — HTML'deki gibi
- Metinler Türkçe içerik ama kod/isimlendirme İngilizce (§2.8)
