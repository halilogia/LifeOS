# KPSS Tarih Konuları — Osmanlı Devleti (Kuruluş'tan Yıkılış'a) Tam Geliştirme Planı

Bu plan, KPSS Tarih modülünde Osmanlı Devleti konusunun **Kuruluş'tan (1299) Yıkılış'a/Saltanatın Kaldırılmasına (1922)** kadar tüm siyasi olayları, fetihleri, antlaşmaları, ıslahatları ve Devlet Teşkilatını harita, kronoloji ve ders notları katmanında eksiksiz geliştirmeyi kapsar.

---

## 🎯 Hedef ve Kapsam

Osmanlı Tarihi KPSS sınavında ortalama **8-10 soru** (Siyaset: 3 soru, Kültür-Medeniyet: 5 soru, 20. Yüzyıl Osmanlı: 4 soru) getiren en kritik derstir. 

Yapılacak geliştirmeler ile:
1. **İnteraktif Tarih Haritası (`TurkeyHistoryData.ts` & `HistoryMapView.tsx`)** tüm Osmanlı dönemlerini haritada iller, sınırlar ve zafer noktaları olarak kronolojik sırayla görselleştirecektir.
2. **Osmanlı Devlet Teşkilatı Şeması (`SchemaBuilder.tsx`)** Sadrazam, Divan-ı Hümayun, Seyfiye/Kalemiye/İlmiye sınıfları ve Tımar sistemini hiyerarşik şemayla sunacaktır.
3. **Müfredat & Alt Konu Analizi (`kpssCurriculum.ts`)** Kuruluş, Yükselme, Duraklama, Gerileme, Dağılma ve Kültür-Medeniyet başlıklarına detaylı alt konular ekleyecektir.

---

## 📅 Osmanlı Tarihi Dönem ve Harita Üniteleri

### 1. ⚔️ Osmanlı Kuruluş Dönemi (1299 - 1453)
- **Kilit Olaylar**: Söğüt & Bilecik'in fethi (1299), Koyunhisar Savaşı (1302), Bursa'nın Fethi (1326), Palekanon Savaşı (1329), İznik ve İzmit'in Alınışı, Karesioğulları'nın Katılması (İlk Donanma), Çimpe Kalesi (Rumeli'ye Geçiş - 1353), Sırpsındığı Zaferi (1364), Çirmen Savaşı, 1. Kosova Zaferi (1389), Niğbolu Savaşı (1396), Ankara Savaşı ve Fetret Devri (1402-1413), Şeyh Bedrettin İsyanı, Varna Savaşı (1444), 2. Kosova Zaferi (1448).
- **Harita Etkisi**: Marmara'dan Rumeli ve Balkanlar'a genişleme sınır boyaması (`territory`).

### 2. 👑 Osmanlı Yükselme Dönemi / Klasik Çağ (1453 - 1579)
- **Kilit Olaylar**: İstanbul'un Fethi (1453), Mora ve Sırbistan'ın Fethi, Trabzon Rum İmparatorluğu'na Son Verilmesi (1461), Otlukbeli Savaşı (1473), Kırım'ın Fethi (Karadeniz Türk Gölü), Cem Sultan Olayı (1481), Çaldıran Savaşı (1514), Turnadağ Savaşı (Dulkadiroğulları - Anadolu Türk Birliği), Mercidabık (1516) & Ridaniye (1517 - Halifeliğin Geçişi), Belgrat ve Rodos'un Fethi, Mohaç Meydan Muharebesi (1526), 1. Viyana Kuşatması, Preveze Deniz Zaferi (1538 - Akdeniz Türk Gölü), Kıbrıs'ın Fethi (1571) ve İnebahtı Deniz Savaşı.
- **Harita Etkisi**: 3 kıtaya yayılan imparatorluk sınırları.

### 3. 🛡️ Osmanlı Duraklama & Arayış Yılları (1579 - 1699)
- **Kilit Olaylar**: Ferhat Paşa Antlaşması (Doğuda en geniş sınırlar - 1590), Haçova Meydan Savaşı (1596), Zitvatorok Antlaşması (1606 - Mütekabiliyet ilkesi), Celali İsyanları, Hotin Seferi (Genç Osman), Kasr-ı Şirin Antlaşması (Bugünkü İran sınırı - 1639), Girit'in Fethi (24 yıllık kuşatma - 1669), Bucaş Antlaşması (Batıda en geniş sınırlar - 1672), II. Viyana Kuşatması (1683), Kutsal İttifak Savaşları ve Karlofça Antlaşması (1699 - Büyük toprak kaybı başlangıcı).

### 4. 📉 Osmanlı Gerileme & Islahatlar Dönemi (1700 - 1792)
- **Kilit Olaylar**: İstanbul Antlaşması (1700), Edirne Vakası (1703), Prut Antlaşması (1711 - Kaybedilen yerleri geri alma ümidi), Lale Devri (1718-1730 - Matbaa, İtfaiye, Çini fabrikası), Pasarofça Antlaşması (Batının üstünlüğünün kabulü), Patrona Halil İsyanı, Belgrat Antlaşması (1739 - Son kazançlı antlaşma), I. Mahmud ve III. Mustafa Islahatları, Küçük Kaynarca Antlaşması (1774 - Kırım'ın kaybı ve Ortodoks hamiliği), Ziştovi (1791) ve Yaş Antlaşması (1792 - Kırım'ın Rusya'ya ait olduğunun kabulü).

### 5. 💥 Osmanlı Dağılma & Yıkılış Dönemi (1792 - 1922)
- **Kilit Olaylar**: III. Selim Nizam-ı Cedid Devri, Kabakçı Mustafa İsyanı, Sened-i İttifak (1808 - İlk demokratikleşme adımı), Navarin Baskını (1827), Edirne Antlaşması (Yunanistan'ın bağımsızlığı - 1829), Mısır Meselesi ve Hünkâr İskelesi Antlaşması (1833), Tanzimat Fermanı (1839 - Kanun üstünlüğü), Islahat Fermanı (1856 - Azınlık hakları), Kırım Savaşı ve İlk Dış Borç (1854), 93 Harbi (1877-78) ve Berlin Antlaşması (Sırbistan, Karadağ, Romanya bağımsız), I. Meşrutiyet & Kanun-ı Esasi (1876), Duyun-ı Umumiye (1881), II. Meşrutiyet & 31 Mart Vakası (1909), Trablusgarp Savaşı (Uşi Antlaşması - 1912), I. ve II. Balkan Savaşları (1912-1913), I. Dünya Savaşı (Çanakkale, Kut'ül Amare, Sarıkamış), Mondros Mütarekesi (1918), Sevr Antlaşması (1920) ve Saltanatın Kaldırılması (1 Kasım 1922).

### 6. 🏛️ Osmanlı Kültür, Medeniyet & Devlet Teşkilatı
- **Divan-ı Hümayun ve Merkez Teşkilatı**: Padişah, Sadrazam, Seyfiye (Askeri/Bürokrasi), İlmiye (Yargı/Eğitim: Şeyhülislam, Kazasker), Kalemiye (Bürokrasi/Maliye: Nişancı, Defterdar, Reisülküttab).
- **Eyalet Yönetimi**: Sancak, Kaza, Köy; Salyaneli (Yıllıklı) ve Salyanesiz (Tımarlı) Eyaletler.
- **Toprak ve Ordu Sistemi**: Tımar sistemi, Dirlik, Vakıf, Mülk; Kapıkulu Süvarileri, Yeniçeriler, Tımarlı Sipahiler.

---

## 📑 Proposed Changes

### Domain & Veri Katmanı

#### [MODIFY] [TurkeyHistoryData.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/TurkeyHistoryData.ts)
- `HISTORY_UNITS` dizisine 6 yeni kapsamlı Osmanlı ünitesi eklenecek:
  1. `osmanli-kurulus` (1299-1453 - 12 Siyasi Olay ve Fetih)
  2. `osmanli-yukselme` (1453-1579 - 14 Klasik Çağ Olayı)
  3. `osmanli-duraklama` (1579-1699 - 10 Arayış Dönemi Olayı)
  4. `osmanli-gerileme` (1700-1792 - 9 Islahat ve Antlaşma Olayı)
  5. `osmanli-dagilma` (1792-1922 - 16 Yıkılış Dönemi Olayı)
  6. `osmanli-teskilat` (Devlet Teşkilatı ve Kültür Medeniyet Şeması)

#### [MODIFY] [kpssCurriculum.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/kpssCurriculum.ts)
- `tarih` başlığı altındaki `Osmanlı Devleti Siyareti`, `Osmanlı Kültür ve Uygarlık` ve `20. Yüzyılda Osmanlı` konularına detaylı KPSS alt başlıkları ve sınav stratejisi açıklamaları eklenecek.

---

### Presentation & UI Katmanı

#### [MODIFY] [StateStructureOutline.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/StateStructureOutline.ts)
- Osmanlı Devlet Teşkilatı şeması için hiyerarşik organizasyon ağacı eklenecek (Divan-ı Hümayun, Seyfiye, İlmiye, Kalemiye, Taşra Teşkilatı).

#### [MODIFY] [HistoryTopicSidebar.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/HistoryTopicSidebar.tsx)
- Yan menüde Osmanlı Dönemlerinin gruplanmış şık rozetler halinde listelenmesi.

---

### Localization (i18n)

#### [MODIFY] [kpss.ts (tr)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/kpss.ts) & [kpss.ts (en)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/en/kpss.ts)
- Yeni eklenen Osmanlı dönem başlıkları, harita lejantları ve açıklama metinleri için çeviriler.

---

## 🧪 Verification Plan

### Automated Tests & Verification
- `npm run build` komutu çalıştırılarak Vite bundle ve TypeScript derleme kontrolü yapılacak.
- `node scripts/findDeadFiles.mjs` çalıştırılarak ölü dosya bulunmadığı teyit edilecek.

### Manual Verification
1. KPSS > Haritalar > Tarih sekmesine gidilecek.
2. Osmanlı Kuruluş, Yükselme, Duraklama, Gerileme, Dağılma ve Teşkilat şeması ünitelerinin sorunsuz yüklendiği doğrulanacak.
3. Oynat (Play), İleri/Geri butonları ile 1299'dan 1922'ye kadar olan tüm tarih olaylarının harita üzerinde tarih, sehir ve açıklama kartlarıyla aktığı test edilecek.
