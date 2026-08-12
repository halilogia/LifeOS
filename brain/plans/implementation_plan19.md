# KPSS Haritalar: Tüm Coğrafya Konularını Kapsayan Geliştirme Planı

Bu geliştirme planı, ZenTodo / Life OS KPSS Modülü içindeki **Türkiye Coğrafya Haritası**'nı genişleterek ÖSYM KPSS Coğrafya müfredatındaki **tüm fiziki, beşeri ve ekonomik coğrafya** konularını interaktif harita haritasına entegre etmeyi hedeflemektedir.

---

## ⚠️ Kullanıcı İncelemesi Gereken Konular (User Review Required)

> [!IMPORTANT]
> **Kategori Bazlı Sidebar Yapılanması**: Mevcut flat (düz) konu listesi, 20+ yeni konu eklendiğinde kullanışsız hale gelecektir. Bu nedenle sol panel (`MapTopicSidebar.tsx`), **Fiziki Coğrafya**, **Beşeri Coğrafya** ve **Ekonomik Coğrafya** şeklinde 3 ana grup başlığı altında akordeon/kategori yapısına dönüştürülecektir.
>
> **Enzenginleştirilmiş Pin Kartları (Sınav İpuçları)**: Her pin haritada seçildiğinde sadece şehir/isim değil, **KPSS Sınav Notu (examTip)** ve **Detaylı Açıklama (description)** içeren zengin bilgi kartı görüntüleyecektir.

---

## ❓ Açık Sorular (Open Questions)

> [!NOTE]
> 1. **Bölgesel Kalkınma Projeleri (BKP)**: GAP, DAP, DOKAP, KOP, ZBK gibi projelerde tekil nokta pinleri yerine ilgili il merkezlerinin haritada toplu vurgulanması tasarlandı. Bu görselleştirmeyi uygun buluyor musunuz?
> 2. **Varsayılan Konu**: Harita açılışında en popüler KPSS konusu olan "Fiziki Dağlar" mı yoksa "Kapsamlı Özet Haritası" mı öncelikli açılsın?

---

## 🎯 KPSS Coğrafya Tüm Konu Haritası (Müfredat Haritası)

Aşağıda haritaya eklenecek **3 Ana Kategori** ve **20 Alt Konu Başlığı** ve her birinin KPSS kapsama detayları yer almaktadır:

### 🏔️ 1. FİZİKİ COĞRAFYA (Physical Geography)
1. **Kıvrım Dağları** (*Mevcut - Genişletilecek*): Kuzey Anadolu ve Toros Dağları sistemi.
2. **Kırık Dağlar (Horst-Graben)** (*Mevcut*): Kaz, Madra, Yunt, Bozdağlar, Aydın, Menteşe, Nur (Amanos) Dağları.
3. **Volkanik Dağlar** (*Mevcut*): Ağrı, Tendürek, Süphan, Nemrut, Erciyes, Hasan, Melendiz, Karadağ, Karacadağ, Kula.
4. **Ovalar (Delta, Karstik, Tektonik)** (*Mevcut - Zenginleştirilecek*): Bafra, Çarşamba, Çukurova, Silifke, Menemen, Tefenni, Acıpayam, Korkuteli vb.
5. **Platolar (Aşınım, Karstik, Lav, Tabaka)** (*Mevcut - Zenginleştirilecek*): Çatalca-Kocaeli, Teke, Taşeli, Erzurum-Kars, Haymana, Cihanbeyli, Obruk, Bozok, Gaziantep.
6. **Akarsular & Sınır Aşan Havzalar** (*Mevcut - Zenginleştirilecek*): Açık/Kapalı havza akarsuları, döküldüğü denizler, Meriç, Asi, Kura, Aras, Fırat, Dicle, Çoruh.
7. **Göller & Oluşum Türleri** (*Mevcut - Zenginleştirilecek*): Tektonik, Karstik, Volkanik/Mağar, Heyelan set (Abant, Tortum, Sera), Kıyı set (Terkos, Çekmece), Volkanik set (Van, Erçek, Çıldır).
8. **Kıyı Tipleri, Boğazlar & Körfezler** (*YENİ*): Ria (İstanbul/Çanakkale/Haliç), Dalmaçya (Kaş-Finike), Falezli (Doğu Karadeniz/Antalya), Limanlı, Kalanklı; İzmit, Bandırma, Saros, Gökova körfezleri.
9. **Karstik & Jeolojik Şekiller** (*YENİ*): Pamukkale Travertenleri, Kızören/Cennet-Cehennem obrukları, Karain, Damlataş, İnsuyu, Ballıca, Altınbeşik mağaraları.
10. **İklim, Rüzgarlar & Yağış Dağılımı** (*YENİ*): En çok yağış alan yöreler (Rize, Hakkari, Teke/Taşeli), en az yağış alan yöreler (Tuz Gölü, Ergene, Iğdır); Lodos, Poyraz, Karayel, Samyeli, Keşişleme, Etezyen.

---

### 👥 2. BEŞERİ COĞRAFYA (Human Geography)
11. **Nüfus Yoğunluk Haritası** (*YENİ*): Yoğun nüfuslu yöreler (Çatalca-Kocaeli, Çukurova, Doğu Karadeniz kıyısı vb.) vs Seyrek nüfuslu yöreler (Yıldız Dağları, Teke-Taşeli, Hakkari, Sivas, Tuz Gölü çevresi).
12. **Mesken Tipleri ve Yapı Malzemeleri** (*YENİ*): Ahşap meskenler (Karadeniz), Kerpiç meskenler (İç/Güneydoğu Anadolu), Taş meskenler (Akdeniz/Doğu Anadolu).
13. **Bölgesel Kalkınma Projeleri (BKP)** (*YENİ*): GAP (Şanlıurfa, Gaziantep vb.), DAP (Erzurum, Van vb.), DOKAP (Trabzon, Rize vb.), KOP (Konya, Karaman vb.), ZBK (Zonguldak, Bartın, Karabük).

---

### 🏭 3. EKONOMİK COĞRAFYA (Economic Geography)
14. **Tarım Ürünleri Üretim Merkezleri** (*YENİ*): Çay (Rize), Fındık (Ordu/Giresun), Pamuk (Şanlıurfa/Aydın), Tütün (Manisa/Adıyaman), Zeytin, İncir, Haşhaş, Ayçiçeği, Şeker Pancarı, Gül.
15. **Hayvancılık Türleri & Bölgeleri** (*YENİ*): Büyükbaş/Mera (Erzurum-Kars), Küçükbaş/Tiftik Keçisi (Ankara), Kıl Keçisi (Teke-Taşeli), Arıcılık (Muğla/Ordu/Hakkari), İpekböcekçiliği (Diyarbakır/Bursa), Kümes (Balıkesir/Manisa/Bolu).
16. **Maden Yatakları ve İşleme Tesisleri** (*YENİ*): Demir (Divriği/Hekimhan -> Ereğli/Karabük/İskenderun), Bakır (Murgul/Küre/Ergani -> Samsun), Krom (Guleman/Fethiye -> Elazığ/Antalya), Bor (Eskişehir/Balıkesir -> Bandırma/Kırka), Boksit (Seydişehir).
17. **Enerji Kaynakları ve Santraller** (*YENİ*): Taşkömürü (Çatalağzı), Linyit (Afşin-Elbistan, Soma, Yatağan), Doğalgaz (Hamtitabat, Ovaakça), Hidroelektrik (Atatürk, Keban, Deriner), Jeotermal (Sarayköy, Germencik), Rüzgar (Alaçatı), Güneş (Karapınar), Nükleer (Akkuyu).
18. **Sanayi Bölgeleri & Hammadde / Pazar İlişkisi** (*YENİ*): Demir-çelik, Otomotiv, Dokuma/Tekstil, Petrol rafinerileri (İzmit, Aliağa, Kırıkkale, Batman).
19. **Ulaşım Ağı & Sınır Kapıları** (*YENİ*): Sınır Kapıları (Kapıkule, Sarp, Habur, Dilucu, İpsala, Gürbulak, Kapıköy) ve Demiryolu Bağlantısı Olmayan İller (Bursa, Antalya, Muğla, Trabzon, Rize, Artvin vb.).
20. **UNESCO Dünya Mirasları ve Turizm** (*YENİ*): Göbeklitepe, Efes, Kapadokya, Pamukkale, Nemrut Dağı, Çatalhöyük, Xanthos-Letoon, Divriği Ulu Camii, Ani Harabeleri, Gordion.

---

## 🛠️ Önerilen Mimari & Kod Değişiklikleri

### Component: Data Layer & Domain Models

#### [MODIFY] [types.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/types.ts)
- `TurkeyMapTopic` type union'ını 20+ yeni konu ID'si ekleyerek güncellemek.
- `GeoPin` arayüzüne opsiyonel `description?: string` ve `examTip?: string` alanlarını eklemek.
- `MAP_TOPICS` listesini kategorize edilmeye uygun metadata (`category: "fiziki" | "beseri" | "ekonomik"`) ile genişletmek.

#### [NEW] Modular Geography Data Files under `src/domain/constants/geography/`
- [coasts.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/coasts.ts) (Kıyı tipleri, boğazlar, körfezler)
- [karst.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/karst.ts) (Mağaralar, obruklar, travertenler)
- [climateRain.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/climateRain.ts) (Yağış ve rüzgarlar)
- [population.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/population.ts) (Nüfus ve meskenler)
- [developmentProjects.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/developmentProjects.ts) (BKP projeleri)
- [agriculture.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/agriculture.ts) (Tarım ürünleri)
- [livestock.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/livestock.ts) (Hayvancılık)
- [mines.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/mines.ts) (Madenler ve tesisler)
- [energy.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/energy.ts) (Enerji santralleri)
- [transportBorders.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/transportBorders.ts) (Sınır kapıları & demiryolu ağı)
- [tourismUnesco.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/tourismUnesco.ts) (UNESCO mirası ve turizm)

#### [MODIFY] [index.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/geography/index.ts)
- Tüm modüllerden gelen pin verilerini merkezi `TOPIC_PINS` ve `ALL_GEOGRAPHY_PINS` objelerine eşlemek.

---

### Component: Presentation & UI Layer

#### [MODIFY] [MapTopicSidebar.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/MapTopicSidebar.tsx)
- Konuları 3 Ana Kategori altında gruplayarak akordeon veya sekme yapısında sunmak.
- Her kategorideki pin sayısını badge olarak göstermek.

#### [MODIFY] [MapCanvas.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/MapCanvas.tsx)
- Bilgi kartını (`info box`) zenginleştirerek `description` ve 💡 **KPSS Sınav İpucu (examTip)** göstermek.

#### [MODIFY] Localization Translations
- [tr/kpss.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/kpss.ts) ve [en/kpss.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/en/kpss.ts) dosyalarına yeni eklenecek konu başlıkları, lejant metinleri ve i18n anahtarlarını tanımlamak.

---

## 🧪 Doğrulama Planı (Verification Plan)

### Otomatik Testler & Derleme Kontrolleri
- `npx tsc --noEmit`: Tüm TypeScript tiplerinin ve `TurkeyMapTopic` referanslarının 0 hata ile geçtiğini doğrulamak.
- `npx eslint src`: Kod ve linter standartlarına tam uyumu doğrulamak.
- `npx prettier --write src`: Kod biçimlendirmesini Prettier standartlarında birleştirmek.
- `npm run build`: Extension paketinin hatasız derlendiğini doğrulamak.

### Manuel / Görsel Doğrulama
- 1. Harita sol panelinde (Sidebar) Fiziki, Beşeri ve Ekonomik Coğrafya kategorilerinin düzgün açılıp kapandığını kontrol etmek.
- 2. Her yeni kategorinin (örn. Madenler, Sınır Kapıları, UNESCO Mirasları) pinlerinin Türkiye haritası SVG'si üzerinde doğru x/y koordinatlarında çıktığını doğrulamak.
- 3. Öğrenme ve İnteraktif Konum Bulma Oyunu (Quiz) modlarının yeni konularla %100 uyumlu çalıştığını test etmek.
