# Life OS - Personal Dashboard

Bu eklenti, tüm kişisel ihtiyaçlarımı, eğitim sürecimi, günlük görevlerimi ve ilgi alanlarımı tek bir noktadan yönettiğim özel ve tamamen kişiselleştirilmiş bir **"Life OS"** (Yaşam İşletim Sistemi) New Tab arayüzüdür.

Eklenti, tarayıcınızın yeni sekme (New Tab) sayfasını tamamen özelleştirerek size modern, minimalist ve yüksek performanslı bir çalışma alanı sunar.

---

## 🚀 Öne Çıkan Özellikler

- **🎯 Odaklanma (Pomodoro)**: Verimli çalışma seansları için özelleştirilebilir odaklanma zamanlayıcısı (Focus, Kısa Mola, Uzun Mola modları), dairesel SVG ilerleme çubuğu, entegre kronometre ve alarm aracı.
- **📋 Görev Yönetimi (To-Do & Kanban)**:
  - Günlük hedefleri yönettiğiniz **Odağım** bölümü.
  - Günlük, haftalık veya aylık tekrarlanan görevler için **Rutinler** listesi.
  - Sürükle-bırak (Drag-and-Drop) ve kolay taşımayı destekleyen modern **Kanban Panosu**.
- **📚 KPSS Hazırlık Takibi**: Detaylı konu checklistleri, dinamik ilerleme çubuğu, çözülen soru sayılarını girme paneli ve çalışma istatistiklerini gösteren Canvas tabanlı grafik ekranı.
- **🕌 Namaz Vakitleri**: Belirlenen konum için anlık namaz vakitlerini API'den çekme, vakitleri listeleme ve o anki vaktin bitimine kalan süreyi gösteren dinamik sayaç.
- **📖 Hıfız Paneli & İmam-Hatip Yeterlilikleri**:
  - Sure, dua ve ayet ezber takibi.
  - Aday Din Görevlisi (İmam-Hatip) ezber ve yeterlilik müfredat checklist'i.
  - Surelerin Mushaf sayfalarını eklenti içinden okumanızı sağlayan **Mushaf Sayfa Görüntüleyicisi**.
- **🎮 Ücretsiz Oyun Takibi (Free Games Tracker) [Yeni]**:
  - Steam, Epic Games, GOG ve diğer platformlardaki güncel ücretsiz oyun ve loot fırsatlarını listeleyen premium arayüz.
  - **GamerPower API** entegrasyonu ve kota aşımını engelleyip açılışı hızlandıran **15 dakikalık akıllı önbellekleme (local cache)** sistemi.
  - Platform ve fırsat türüne göre gelişmiş filtreleme seçenekleri.
- **✍️ Notlarım & Motivasyon Sözleri**: Renkli kartlarla not tutma, düzenleme ve kendi eklediğiniz motivasyon sözlerinden oluşan dinamik bir söz havuzu.
- **🔄 Aralıklı Tekrar (Spaced Repetition - SRS)**: Kelime ezberi veya önemli notları bilimsel aralıklarla tekrar etmenizi sağlayan sistem.
- **📅 Entegre Takvim**: Günlük görevleri, planları tarih bazlı takip etmeyi sağlayan modern takvim paneli.
- **⚙️ Veri & Dil Yönetimi**:
  - Türkçe ve İngilizce dilleri arasında dinamik geçiş (i18n).
  - Tüm verileri JSON olarak tek tıkla yedekleme (Backup) ve yedekten geri yükleme (Restore).
- **✨ Premium Tasarım**: Glassmorphism (buzlu cam) estetiği, yanıp sönen durum ışıkları, dinamik sidebar, yumuşak hover efektleri, platform bazlı özel renkler ve göz yormayan koyu mod tasarımı.

---

## 🛠️ Kurulum ve Geliştirme

Eklentiyi bilgisayarınıza kurmak ve derlemek için aşağıdaki adımları izleyin:

### Gereksinimler
- Bilgisayarınızda **Node.js** yüklü olmalıdır.

### 1. Adım: Bağımlılıkları Yükleyin
Proje klasöründe bir terminal açarak npm bağımlılıklarını kurun:
```bash
npm install
```

### 2. Adım: Projeyi Derleyin
TypeScript kodlarını derlemek ve HTML/CSS/Görsel dosyalarını `dist/` klasörüne kopyalamak için derleme betiğini çalıştırın:
```bash
node build.js
```
*(Eğer sisteminizde PowerShell script çalıştırma politikası izin veriyorsa `npm run build` komutunu da kullanabilirsiniz).*

### 3. Adım: Chrome'a Yükleyin
1. Google Chrome tarayıcınızı açın ve `chrome://extensions/` adresine gidin.
2. Sağ üst köşede bulunan **Geliştirici modu** (Developer mode) seçeneğini aktif hale getirin.
3. Sol üstte çıkan **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
4. Bu proje klasörünün içindeki **`dist`** klasörünü seçin.

Artık tarayıcınızda her yeni sekme açtığınızda **Life OS** paneliniz yüklenecektir! Değişiklik yaptıktan sonra eklentiyi güncellemek için `chrome://extensions/` sayfasındaki yenileme simgesine tıklamanız yeterlidir.

---
*Bu çalışma; üretkenliği artırmak, kişisel hedeflere (KPSS, Hıfız, Yazılım) odaklanmak ve güncel fırsatları tek ekranda toplamak için geliştirilmiştir.*
