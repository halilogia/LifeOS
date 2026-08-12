# KPSS Tarih Modülü Tam Yol Haritası & Mevcut Durum Planı

Bu plan, kullanıcının belirttiği müfredat yapısına göre KPSS Tarih harita ve ders modülünün mevcut durumunu analiz etmeyi ve eksik kalan **I. Dönem Anadolu Beylikleri (1071-12. yy)** ile **Türkiye Cumhuriyeti / Kurtuluş Savaşı (1919-1923)** ünitelerini ekleyerek müfredatı %100 eksiksiz hale getirmeyi kapsar.

---

## 📊 Mevcut Durum Analizi (Şu An Ne Durumdayız?)

| Ünite / Dönem | Harita Verisi | Detaylı Dosya | Durum |
|---|---|---|---|
| 🏛️ **Anadolu Selçuklu Devleti (1075-1308)** | `selcukluUnit.ts` | Tam (İznik'in kaybı 1097 `lostTerritory` dahil) | ✅ Tamamlandı |
| ⚔️ **I. Dönem Anadolu Beylikleri (1071-12. yy)** | Eksik | Oluşturulacak: `ilkDonemBeyliklerUnit.ts` | 🚧 Yapılacak |
| 🛡️ **II. Dönem Anadolu Beylikleri (13-15. yy)** | `beyliklerUnit.ts` | Tam (Karamanoğulları, Karesi, Germiyan, Hamit vb.) | ✅ Tamamlandı |
| 👑 **Osmanlı Kuruluş (1299-1453)** | `osmanliKurulusUnit.ts` | Tam | ✅ Tamamlandı |
| 👑 **Osmanlı Yükselme (1453-1579)** | `osmanliYukselmeUnit.ts` | Tam | ✅ Tamamlandı |
| 👑 **Osmanlı Duraklama (1579-1699)** | `osmanliDuraklamaUnit.ts` | Tam | ✅ Tamamlandı |
| 👑 **Osmanlı Gerileme (1700-1792)** | `osmanliGerilemeUnit.ts` | Tam | ✅ Tamamlandı |
| 👑 **Osmanlı Dağılma (1792-1922)** | `osmanliDagilmaUnit.ts` | Tam | ✅ Tamamlandı |
| 🏛️ **Devlet Teşkilatı (Şemalar)** | `osmanliTeskilatUnit.ts` | Tam (`SchemaBuilder.tsx` ağaç diyagramı) | ✅ Tamamlandı |
| 🇹🇷 **Türkiye Cumhuriyeti & Kurtuluş Savaşı (1919-1923)** | Eksik | Oluşturulacak: `kurtulusSavasiUnit.ts` | 🚧 Yapılacak |

---

## 🎯 Tamamlanacak Eksik Üniteler ve Detayları

### 1. ⚔️ I. Dönem Anadolu Beylikleri (`ilkDonemBeyliklerUnit.ts`)
1071 Malazgirt Savaşı'ndan sonra kurulan 5 temel beylik haritaya eklenecektir:
- 🏰 **Saltuklular (1072 - 1202)**: Erzurum ve çevresi (İlk Türk beyliği, Mama Hatun Külliyesi).
- 🏛️ **Mengücekliler (1080 - 1228)**: Erzincan, Divriği, Kemah (Divriği Ulu Camii).
- 📜 **Danişmentliler (1080 - 1178)**: Sivas, Tokat, Amasya (En güçlü I. dönem beyliği, Yağıbasan Medreseyi - İlk medrese).
- 🏰 **Artuklular (1102 - 1409)**: Mardin, Hasankeyf, Harput (Malabadi Köprüsü, El-Jazari).
- ⚓ **Çaka Beyliği (1081 - 1093)**: İzmir ve çevresi (İlk Türk denizci beyliği ve deniz kuvvetleri kuruluşu).

### 2. 🇹🇷 Türkiye Cumhuriyeti ve Kurtuluş Savaşı (`kurtulusSavasiUnit.ts`)
1919-1923 Milli Mücadele ve Cumhuriyetin Kuruluşu harita kronolojisine eklenecektir:
- 🚢 **19 Mayıs 1919**: Mustafa Kemal'in Samsun'a Çıkışı (Milli Mücadele Başlangıcı).
- 📜 **Amasya Genelgesi (Haziran 1919)**: Vatanın bütünlüğü milletin bağımsızlığı tehlikededir.
- 🏛️ **Erzurum & Sivas Kongreleri (Temmuz - Eylül 1919)**: Manda ve himaye kabul edilemez.
- 🏛️ **TBMM'nin Açılışı (23 Nisan 1920)**: Ankara'da kurucu meclisin açılması.
- ⚔️ **Kurtuluş Savaşı Cepheleri (1920 - 1922)**:
  - Doğu Cephesi (Gümrü Antlaşması - Kazım Karabekir)
  - Güney Cephesi (Maraş, Antep, Urfa savunması & Ankara Antlaşması)
  - Batı Cephesi: I. ve II. İnönü, Kütahya-Eskişehir, Sakarya Meydan Muharebesi ("Hattı müdafaa yoktur, sathı müdafaa vardır"), Büyük Taarruz & Başkomutanlık Meydan Muharebesi (30 Ağustos 1922).
- 🕊️ **Mudanya Mütarekesi & Lozan Barış Antlaşması (24 Temmuz 1923)**: Türkiye Cumhuriyeti'nin tapu senedi.
- 🇹🇷 **Cumhuriyetin İlanı (29 Ekim 1923)**: Ankara başkent, Mustafa Kemal ilk Cumhurbaşkanı.

---

## 📑 Proposed Changes

### [NEW] [ilkDonemBeyliklerUnit.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/history/ilkDonemBeyliklerUnit.ts)
- Saltuklular, Mengücekliler, Danişmentliler, Artuklular ve Çaka Beyliği harita ünite verisi.

### [NEW] [kurtulusSavasiUnit.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/history/kurtulusSavasiUnit.ts)
- Samsun'a çıkıştan Lozan ve Cumhuriyetin ilanına kadar olan 12 kritik Milli Mücadele adımı.

### [MODIFY] [history/index.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/history/index.ts)
- Yeni üniteleri `HISTORY_UNITS` dizisine kronolojik sırayla dahil etme.

---

## 🧪 Verification Plan

### Automated Tests
- `npm run build` komutu ile %100 hatasız Vite derlemesi doğrulanacak.
- `node scripts/findDeadFiles.mjs` ile ölü dosya bulunmadığı kontrol edilecek.

### Manual Verification
- Tarih haritası sol menüsünden **I. Dönem Anadolu Beylikleri** ve **Kurtuluş Savaşı & Türkiye Cumhuriyeti** seçilip haritada adımların aktığı test edilecek.
