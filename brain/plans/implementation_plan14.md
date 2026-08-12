# KPSS İnteraktif Coğrafya Harita Oyunu (Konum Bulma Sınavı) Uygulama Planı

Bu plan, KPSS Coğrafya harita modülüne kullanıcının paylaştığı ekran görüntülerine tam uyumlu **İnteraktif Konum Bulma Oyunu / Harita Sınavı** özelliğinin eklenmesini kapsar.

## 🎯 Hedef ve Genel Bakış
Haritanın alt kısmında veya üstünde kart formatında hedef konum adı (ör. **Ilgaz Dağı**, **Menteşe Dağları**, **Çukurova**, **Van Gölü** vb.) görüntülenecek, kullanıcı Türkiye haritası üzerindeki nokta pinlerine veya alan düğümlerine tıklayarak konumu bulmaya çalışacaktır.

### 🌟 Ana Özellikler
1. **İki Ana Görünüm Modu**:
   - 📖 **Öğrenme & Oynatma Modu**: Mevcut otomatik/manuel adımlı öğrenme haritası.
   - 🎯 **İnteraktif Konum Oyunu Modu**: Kullanıcının istediği quiz/oyun deneyimi.
2. **Alt Hedef Çubuğu (Target Bar)**:
   - Ekran görüntüsündeki gibi haritanın alt/orta kısmında hedef ismi ("Ilgaz Dağı"), konu ikonu, soru sayacı ("3 / 15"), **PAS** (Atla) butonu, **İpucu** (Hint) butonu ve anlık skor rozeti.
3. **Görsel & İşitsel Geri Bildirim**:
   - **Doğru seçim**: Yeşil halka animasyonu, ses efekti (Web Audio API), puan artışı ve otomatik bir sonraki hedefe geçiş.
   - **Yanlış seçim**: Kırmızı titreşim animasyonu ve "Tekrar Dene" bildirimi.
   - **İpucu**: İlgili bölgeyi veya doğru pini sarı ışıkla parlatma.
4. **Zengin KPSS Coğrafya Veri Seti**:
   - Kıvrım Dağları (Ilgaz, Bolu, Köroğlu, Küre, Canik, Giresun, Kaçkarlar, Mescit, Yalnızçam, Allahuekber, Yıldız, Sultan, Dedegöl, Geyik, Tahtalı, Aladağlar, Mercan, Güneydoğu Toroslar)
   - Kırık Dağlar (Kaz, Madra, Yunt, Bozdağlar, Aydın, Menteşe, Nur/Amanos)
   - Volkanik Dağlar (Kula, Karadağ, Karacadağ, Hasan, Melendiz, Erciyes, Nemrut, Süphan, Tendürek, Ağrı)
   - Ovalar (Bafra, Çarşamba, Çukurova, Amik, Gediz, Bakırçay, Küçük/Büyük Menderes, Menemen, Silifke, Konya, Harran, Muş, Pasinler, Yüksekova)
   - Platolar (Cihanbeyli, Haymana, Bozok, Obruk, Taşeli, Teke, Erzurum-Kars, Ardahan, Gaziantep, Şanlıurfa, Perşembe, Çatalca-Kocaeli)
   - Akarsular & Göller (Kızılırmak, Yeşilırmak, Sakarya, Susurluk, Gediz, Fırat, Dicle, Aras, Çoruh, Van Gölü, Tuz Gölü, Beyşehir, Eğirdir, İznik, Sapanca, Manyas, Uluabat, Burdur, Akşehir, Hazar, Çıldır)
   - Tümü / Karma Mod (Tüm konuları karışık sınama)
5. **Sonuç & Başarı Modalı**:
   - Doğruluk oranı (%), tamamlama süresi, seri (streak) rekoru, tekrar başlatma ve öğrenme moduna dönme butonları.

---

## ⚠️ User Review Required

> [!IMPORTANT]
> - **Sıfır Dış Bağımlılık & Web Audio Efektleri**: Oyun ses efektleri (doğru/yanlış sesleri) dış mp3 dosyalarına bağımlı kalmadan tarayıcının yerel Web Audio API'si ile temiz ve hafif tonda sentezlenecektir.
> - **Mobil ve Dokunmatik Uyumlu**: Harita pan/zoom kontrolleri ile tıklama/dokunma işlevleri sorunsuz çalışacaktır.

---

## 📑 Proposed Changes

### Domain & Veri Katmanı

#### [MODIFY] [TurkeyGeographyData.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/domain/constants/TurkeyGeographyData.ts)
- `KIVRIM_MOUNTAINS` ve `KIRIK_MOUNTAINS` veri dizileri eklenecek.
- Tüm KPSS coğrafya konuları için hassas SVG koordinatları tamamlanacak.
- `TurkeyMapTopic` türüne `"kivrim"` ve `"kirik"` ile `"all"` (karma sınav) eklenecek.

---

### Presentation & UI Katmanı (`src/components/kpss/map/`)

#### [NEW] [useMapQuiz.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/useMapQuiz.ts)
- Harita quiz oyunu için Preact custom hook:
  - Hedef seçimi, karıştırma (shuffle), kullanıcı tıklama doğrulama, PAS, İpucu, süre ve skor takibi.

#### [NEW] [MapQuizTargetBar.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/MapQuizTargetBar.tsx)
- Haritanın alt kısmında yer alacak hedef konum rozeti ("Ilgaz Dağı"), konu ikonu, sayaç, PAS ve İpucu butonları.

#### [NEW] [MapQuizCanvas.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/MapQuizCanvas.tsx)
- İnteraktif tıklanabilir nokta düğümleri (target nodes) içeren harita tuvali.
- Doğru/yanlış/ipucu animasyonları ve hover efektleri.

#### [NEW] [MapQuizResultModal.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/MapQuizResultModal.tsx)
- Quiz tamamlandığında ekrana gelen tebrikler ve performans özet dialogu.

#### [NEW] [mapAudioUtils.ts](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/mapAudioUtils.ts)
- Web Audio API ile doğru tıklama, yanlış tıklama ve zafer ses efektleri üreten hafif yardımcı servis.

#### [MODIFY] [TurkeyMapView.tsx](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/components/kpss/map/TurkeyMapView.tsx)
- Mod geçiş butonları (📖 Öğrenme & Oynatma / 🎯 İnteraktif Konum Bulma Oyunu).
- Seçili moda göre `MapCanvas` veya `MapQuizCanvas` + `MapQuizTargetBar` görüntüleme.

---

### Localization (i18n)

#### [MODIFY] [kpss.ts (tr)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/tr/kpss.ts) & [kpss.ts (en)](file:///c:/Users/Halil%20Emre/Desktop/GitHub/Private/LifeOS/src/utils/translations/en/kpss.ts)
- Harita sınavı modları, butonlar (PAS, İpucu, Oyuna Başla, Doğru/Yanlış vb.) için Türkçe & İngilizce çeviri metinleri.

---

## 🧪 Verification Plan

### Automated Tests / Compile Checks
- `npx tsc --noEmit` çalıştırılarak strict TypeScript ve No-Any tip denetimleri yapılacak.
- `npm run build` çalıştırılarak Vite extension bundle derlemesi doğrulanacak.
- `node scripts/findDeadFiles.mjs` çalıştırılarak ölü dosya bulunmadığı teyit edilecek.

### Manual Verification
1. KPSS > Haritalar sekmesine gidilecek.
2. "İnteraktif Konum Oyunu" moduna geçilecek.
3. Alt çubukta hedef konumun (ör. "Ilgaz Dağı", "Menteşe") göründüğü doğrulanacak.
4. Haritada doğru konuma tıklandığında yeşil halka, puan artışı ve ses efekti verildiği; yanlış konuma tıklandığında uyarı alındığı test edilecek.
5. "PAS" ve "İpucu" butonlarının doğru çalıştığı gözlemlenecek.
6. Tüm sorular bitince başarı modalının açıldığı kontrol edilecek.
