# Life OS - Personal Dashboard

Bu eklenti, tüm kişisel ihtiyaçlarımı, eğitim sürecimi, günlük görevlerimi, odaklanma seanslarımı ve ilgi alanlarımı tek bir noktadan yönettiğim özel ve tamamen kişiselleştirilmiş bir **"Life OS"** (Yaşam İşletim Sistemi) New Tab arayüzüdür.

Eklenti, tarayıcınızın yeni sekme (New Tab) sayfasını tamamen özelleştirerek size modern, minimalist, yüksek güvenlikli ve yüksek performanslı bir çalışma alanı sunar.

---

## 🚀 Öne Çıkan Özellikler

- **🎯 Gelişmiş Odaklanma (Pomodoro, Kronometre ve Alarmlar)**:
  - Verimli çalışma seansları için özelleştirilebilir odaklanma zamanlayıcısı (Focus, Kısa Mola, Uzun Mola modları) ve dairesel SVG ilerleme çubuğu.
  - **Telefon Tipi Alarmlar**: Klasik alarm arayüzleri gibi çalışabilen, aktif/pasif hale getirilebilen, listeden silinebilen ve çaldığında otomatik kapanan çoklu alarm modülü.
  - **Senkronize Kronometre**: Sekmeler ve sağ üst pop-up penceresi arasında canlı olarak senkronize olan entegre kronometre.
- **📋 Görev Yönetimi (To-Do & Kanban)**:
  - Günlük hedefleri yönettiğiniz ve ortalanmış şık odak kartına sahip **Odağım** bölümü.
  - Günlük, haftalık veya aylık tekrarlanan görevler için **Rutinler** listesi.
  - Sürükle-bırak (Drag-and-Drop) ve kolay taşımayı destekleyen modern **Kanban Panosu**.
- **📚 KPSS Hazırlık Takibi**:
  - Detaylı konu checklistleri, dinamik ilerleme çubukları, günlük çözülen soru sayılarını girme paneli ve çalışma istatistiklerini gösteren Canvas tabanlı grafik ekranı.
  - **Yapay Zeka Seviye Tespit Sınavı**: Her konu için AI tarafından oluşturulan 5-25 soruluk çoktan seçmeli seviye belirleme testleri ve sonuca göre otomatik güncellenen konu tamamlanma durumu.
  - **Dinamik Bitiş Tahmini**: Kalan KPSS konuları ve güncel çalışma hızına bağlı olarak sınav hazırlığının tahmini tamamlanma tarihini gösteren akıllı sayaç ile KPSS Lisans sınav tarihine (6 Eylül 2026) kalan süre sayacı.
- **📈 Özel Borsa İstanbul Grafik Paneli**:
  - BIST hisseleri için tamamen kendi geliştirdiğimiz, Yahoo Finance veri altyapısıyla çalışan mum (Candlestick) grafik ekranı. 1M, 3M, 6M, 1Y zaman aralığı filtreleri ve fare takipli crosshair veri çubuğu.
- **🕌 Namaz Vakitleri**:
  - Belirlenen konum için anlık namaz vakitlerini API'den çekme, vakitleri listeleme ve o anki vaktin bitimine kalan süreyi gösteren dinamik sayaç.
- **📖 Hıfız Paneli & İmam-Hatip Yeterlilikleri**:
  - Sure, dua ve ayet ezber takibi. Aday Din Görevlisi (İmam-Hatip) ezber müfredat checklist'i.
  - Surelerin Mushaf sayfalarını okumanızı sağlayan **Mushaf Sayfa Görüntüleyicisi**.
- **🔄 Kelime Ezberi & Aralıklı Tekrar (Spaced Repetition - SRS)**:
  - Kelime ezberini bilimsel aralıklarla yapmanızı sağlayan A1, A2, B1, B2, C1, GRE, Phrasal Verbs ve Düzensiz Fiiller listelerine sahip Spaced Repetition modülü.
- **📅 Tarih Bazlı Takvim**:
  - Tam ekranı kaplayacak şekilde genişletilmiş, namaz vakitlerinden arındırılmış ve tamamlanan görevlerin geçmişini tarih bazında izlemeyi sağlayan modern takvim paneli.
- **✍️ Günlüğüm (Notlar & Ders Notları)**:
  - Klasik not kartlarının yanı sıra "Günlük" ve "Cornell Metodu Ders Notu" türünde kayıtlar ekleme desteği. Premium pill segment butonları ile şık arayüz geçişleri. Yapay zeka sohbetinden doğrudan komutla günlük/not ekleyebilme desteği.
- **🎛️ Dinamik Menü Sıralaması (Drag-and-Drop Sidebar)**:
  - Sol sidebar üzerindeki navigasyon butonlarını sürükleyip bırakarak özelleştirilebilir sıralama. Sıralamadaki en üst sekmeye göre yer değiştiren akıllı Hero Saat widget'ı.
- **🎮 Ücretsiz Oyun Takibi & Masaüstü Bildirimleri**:
  - Steam, Epic Games ve GOG platformlarındaki güncel ücretsiz oyun fırsatlarını listeleyen premium arayüz.
  - **Saatlik Arkaplan Alarmı**: `chrome.alarms` servisiyle Steam, Epic ve GOG platformlarındaki yeni ücretsiz oyunları takip edip masaüstü bildirimi gönderir. Bildirime tıklandığında oyunun claim sayfası otomatik açılır.
- **🚫 Sosyal Medya Detoksu (Detox Blocker) & Ekran Süresi Sayacı**:
  - **Derin Bloklama**: Twitter/X, Instagram, YouTube, TikTok ve Facebook platformlarını veya manuel girdiğiniz siteleri tamamen engeller. Hydration/SPA güncellemelerini `MutationObserver` ile izleyerek engelin aşılmasını önler.
  - **Popup Hızlı Seçim Grid**: Pop-up panelinde, manuel site yazmak yerine logoları (SVG ikonları) ile popüler sosyal ağları hızlıca kilitlemenizi sağlayan 5 sütunlu görsel seçim tablosu.
  - **Ekran Süresi Sayacı**: Günlük hangi sitede kaç dakika geçirdiğinizi arkaplanda (`background.js`) takip edip Detox panelinde grafiksel bar şeklinde listeler.
- **🛡️ Güvenlik Hardening**:
  - **DOM XSS Koruması**: Detoks bloke ekranına basılan metinlerin DOM XSS oluşturmaması için güvenli `escapeHtml` filtreleri.
  - **Zod Şema Doğrulaması**: Veri yedeklerini geri yüklerken zararlı kod enjeksiyonunu engellemek amacıyla Zod kütüphanesi ile veri şeması kontrolü.
- **✨ Premium Tasarım**:
  - Gri sistem pencereleri (`confirm()`) yerine tasarlanmış, mor gradientli glassmorphic **ConfirmModal** onay kutusu.
  - Glassmorphism (buzlu cam) estetiği, yanıp sönen durum ışıkları, yumuşak hover efektleri ve eklentiye özel marka logosu.

---

## 🛠️ Kurulum ve Geliştirme

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
npm run build
```

### 3. Adım: Chrome'a Yükleyin
1. Google Chrome tarayıcınızı açın ve `chrome://extensions/` adresine gidin.
2. Sağ üst köşede bulunan **Geliştirici modu** (Developer mode) seçeneğini aktif hale getirin.
3. Sol üstte çıkan **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
4. Bu proje klasörünün içindeki **`dist`** klasörünü seçin.

---
*Bu çalışma; kişisel üretkenliği artırmak, hedeflere (KPSS, Hıfız, Yazılım) odaklanmak ve güncel ücretsiz oyun fırsatlarını tek ekranda toplamak için geliştirilmiştir.*
