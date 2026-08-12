# Coğrafya & Tarih Ünitelerini Modüler Dosyalara Bölme Planı

Bu plan, `TurkeyGeographyData.ts` ve `TurkeyHistoryData.ts` içerisindeki monolithic veri yapılarını, bakımı ve geliştirmeyi kolaylaştırmak amacıyla konu/ünite bazında bağımsız modüler dosyalara ayırmayı kapsar.

---

## 🎯 Hedef ve Mimari Tasarım

Tüm coğrafya ve tarih üniteleri kendi domain klasörlerine ayrılacaktır:
- `src/domain/constants/geography/`: Her coğrafya konusu (Kıvrım Dağları, Kırık Dağlar, Volkanik Dağlar, Ovalar, Platolar, Akarsular, Göller) ayrı dosyada yaşayacaktır.
- `src/domain/constants/history/`: Her tarih dönemi ve ünitesi (Anadolu Selçuklu, Osmanlı Kuruluş, Yükselme, Duraklama, Gerileme, Dağılma, Devlet Teşkilatı, Ekonomi & Kültür, Beylikler) ayrı dosyada yaşayacaktır.

Geriye dönük uyumluluk ve %100 sıfır kayıp garantisi için `TurkeyGeographyData.ts` ve `TurkeyHistoryData.ts` kök dosyaları re-exporter olarak hizmet verecektir.

---

## 📂 Dosya Düzeni

### 1. Coğrafya Modülleri (`src/domain/constants/geography/`)
- `types.ts`: `GeoPin`, `TurkeyMapTopic`, `MAP_VIEWBOX`, `MAP_TOPICS` sabitleri.
- `kivrimMountains.ts`: Kıvrım Dağları veri seti (`KIVRIM_MOUNTAINS`).
- `kirikMountains.ts`: Kırık Dağlar veri seti (`KIRIK_MOUNTAINS`).
- `volcanicMountains.ts`: Volkanik Dağlar veri seti (`VOLCANIC_MOUNTAINS`).
- `turkeyPlains.ts`: Ovalar veri seti (`TURKEY_PLAINS`).
- `turkeyLakes.ts`: Göller veri seti (`TURKEY_LAKES`).
- `turkeyRivers.ts`: Akarsular veri seti (`TURKEY_RIVERS`).
- `turkeyPlateaus.ts`: Platolar veri seti (`TURKEY_PLATEAUS`).
- `index.ts`: Tüm konuları `ALL_GEOGRAPHY_PINS` ve `TOPIC_PINS` haritalarında birleştiren ve dışa aktaran indeks.

### 2. Tarih Modülleri (`src/domain/constants/history/`)
- `types.ts`: `HistoryMode`, `HistoryEvent`, `HistoryLegendRow`, `HistoryUnit`, `HISTORY_VIEWBOX`, `HISTORY_PROVINCE_FILL`, `HISTORY_PROVINCE_STROKE`.
- `selcukluUnit.ts`: Anadolu Selçuklu Devleti ünitesi (`SELCUKLU_UNIT`).
- `osmanliKurulusUnit.ts`: Osmanlı Kuruluş Dönemi ünitesi (`OSMANLI_KURULUS_UNIT`).
- `osmanliYukselmeUnit.ts`: Osmanlı Yükselme Dönemi ünitesi (`OSMANLI_YUKSELME_UNIT`).
- `osmanliDuraklamaUnit.ts`: Osmanlı Duraklama Dönemi ünitesi (`OSMANLI_DURAKLAMA_UNIT`).
- `osmanliGerilemeUnit.ts`: Osmanlı Gerileme Dönemi ünitesi (`OSMANLI_GERILEME_UNIT`).
- `osmanliDagilmaUnit.ts`: Osmanlı Dağılma Dönemi ünitesi (`OSMANLI_DAGILMA_UNIT`).
- `osmanliTeskilatUnit.ts`: Osmanlı Devlet Teşkilatı şema ünitesi (`OSMANLI_TESKILAT_UNIT`).
- `ekonomiKulturUnit.ts`: Ekonomi, Ticaret, Bilim ve Kültür üniteleri (`EKONOMI_UNIT`, `KULTUR_UNIT`).
- `beyliklerUnit.ts`: Anadolu Beylikleri ünitesi (`BEYLIKLER_UNIT`).
- `index.ts`: Tüm üniteleri `HISTORY_UNITS` dizisinde birleştiren ve dışa aktaran indeks.

---

## 📑 Proposed Changes

### [NEW] Coğrafya Modülleri
- `src/domain/constants/geography/types.ts`
- `src/domain/constants/geography/kivrimMountains.ts`
- `src/domain/constants/geography/kirikMountains.ts`
- `src/domain/constants/geography/volcanicMountains.ts`
- `src/domain/constants/geography/turkeyPlains.ts`
- `src/domain/constants/geography/turkeyLakes.ts`
- `src/domain/constants/geography/turkeyRivers.ts`
- `src/domain/constants/geography/turkeyPlateaus.ts`
- `src/domain/constants/geography/index.ts`

### [NEW] Tarih Modülleri
- `src/domain/constants/history/types.ts`
- `src/domain/constants/history/selcukluUnit.ts`
- `src/domain/constants/history/osmanliKurulusUnit.ts`
- `src/domain/constants/history/osmanliYukselmeUnit.ts`
- `src/domain/constants/history/osmanliDuraklamaUnit.ts`
- `src/domain/constants/history/osmanliGerilemeUnit.ts`
- `src/domain/constants/history/osmanliDagilmaUnit.ts`
- `src/domain/constants/history/osmanliTeskilatUnit.ts`
- `src/domain/constants/history/ekonomiKulturUnit.ts`
- `src/domain/constants/history/beyliklerUnit.ts`
- `src/domain/constants/history/index.ts`

### [MODIFY] Kök Re-exporter Dosyaları
- `src/domain/constants/TurkeyGeographyData.ts` (Kökte durur, `./geography/index.js` re-export eder)
- `src/domain/constants/TurkeyHistoryData.ts` (Kökte durur, `./history/index.js` re-export eder)

---

## 🧪 Verification Plan

### Automated Tests & Checks
- `npm run build` komutu çalıştırılarak tüm modül alias'ları (`@/domain/constants/...`) ve re-export'ların sorunsuz derlendiği doğrulanacak.
- `node scripts/findDeadFiles.mjs` çalıştırılarak 0 ölü dosya olduğu teyit edilecek.

### Manual Verification
- Coğrafya haritası (Öğrenme ve İnteraktif Konum Oyunu) test edilecek.
- Tarih haritası (Selçuklu, Beylikler ve tüm Osmanlı dönemleri) test edilecek.
