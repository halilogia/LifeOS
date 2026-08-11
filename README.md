# Life OS - Personal Dashboard

Bu eklenti, tüm kişisel ihtiyaçlarımı, eğitim sürecimi, günlük görevlerimi, odaklanma seanslarımı ve ilgi alanlarımı tek bir noktadan yönettiğim özel ve tamamen kişiselleştirilmiş bir **"Life OS"** (Yaşam İşletim Sistemi) New Tab arayüzüdür.

Eklenti, tarayıcınızın yeni sekme (New Tab) sayfasını tamamen özelleştirerek size modern, minimalist, yüksek güvenlikli ve yüksek performanslı bir çalışma alanı sunar.

---

## 🚀 Öne Çıkan Özellikler

- **🎯 Gelişmiş Odaklanma**:
  - Verimli çalışma seansları için özelleştirilebilir odaklanma zamanlayıcısı (Focus, Kısa Mola, Uzun Mola modları) ve dairesel SVG ilerleme çubuğu.
  - **Fiziksel Ses Sentezleyiciler**: Pomodoro seansları için harici site bağımlılığı olmayan çevrimdışı Web Audio API sentezleyicileri (LFO dalgalanmalı Rüzgar, stokastik tıkırtılı Yağmur damlaları, vinyl çıtırtılı warm Lo-Fi piyano döngüsü ve saç kurutma makinesi gürültüsü).
  - **Alarmlar**: Klasik alarm arayüzleri gibi çalışabilen, aktif/pasif hale getirilebilen, listeden silinebilen ve çaldığında otomatik kapanan çoklu alarm modülü.
  - **Senkronize Kronometre**: Sekmeler ve sağ üst pop-up penceresi arasında canlı olarak senkronize olan entegre kronometre.
- **📋 Görev Yönetimi (To-Do & Kanban)**:
  - Günlük hedefleri yönettiğiniz ve ortalanmış şık odak kartına sahip **Odağım** bölümü.
  - Günlük, haftalık veya aylık tekrarlanan görevler için **Rutinler** listesi.
  - Sürükle-bırak (Drag-and-Drop) ve kolay taşımayı destekleyen modern **Kanban Panosu**.
- **📚 KPSS Hazırlık Takibi & Vikipedi Ders Notları**:
  - Detaylı konu checklistleri, dinamik ilerleme çubukları, günlük çözülen soru sayılarını girme paneli, 7g/30g zaman ve metrik filtreli hafızalı Canvas çalışma grafiği.
  - **Vikipedi Tarzı Ders Notları Okuyucusu**: Notlar arasında `[[Konu Adı]]` sözdizimi ile interaktif mavi iç bağlantılar (Wikilinks) kurabilme. Otomatik Başlık İçindekiler (TOC) menüsü, Okuma Süresi / Kelime İstatistiği ve İç & Gelen Bağlantıları (Backlinks) gösteren Wikipedia Bilgi Kutusu (Infobox).
  - **Yapay Zeka Seviye Tespit Sınavı**: Her konu için AI tarafından oluşturulan 5-25 soruluk çoktan seçmeli seviye belirleme testleri. Sınav sonucuna göre konu durumları otomatik güncellenir.
  - **Çıkmış Sorular Sınav Salonu**: 2009-2021 yılları arası orijinal ÖSYM çıkmış KPSS Lisans sorularını yıl bazında veya tüm yılların karışımından oluşan karma denemeler halinde çözebilme desteği. Sınav ekranında ÖSYM'nin kritik sınav reformu milatlarını (2013-2014-2018) gösteren dairesel `!` kılavuz butonu.
  - **Dinamik Bitiş Tahmini**: Kalan KPSS konuları ve güncel çalışma hızına bağlı olarak sınav hazırlığının tahmini tamamlanma tarihini gösteren akıllı sayaç ile KPSS Lisans sınav tarihine (6 Eylül 2026) kalan süre sayacı.
- **📈 Otomatik Borsa İstanbul (BIST) Yönetim & Strateji Sistemi**:
  - **Canlı Takip & Portföy Metrikleri**: Tüm BIST hisseleri ve Halka Arzlar için canlı fiyat akışı, maliyet, lot adedi, toplam portföy değeri ve anlık Kar/Zarar göstergesi.
  - **Nakit & Toplam Varlık (Mal Varlığım)**: Manuel nakit ekleme; hisse alımında otomatik düşme, satışında otomatik eklenme. Toplam Varlık = Nakit + Hisse Değeri. Cyberpunk **Varlık Dağılımı pasta grafiği** ve **Satış Geçmişi** (gerçekleşen K/Z).
  - **30 Günlük Derinlemesine Yapay Zeka Analizi (`stockAiService.ts`)**: Hisselerin 30 günlük OHLC mum verileri, 1 aylık getiri %, 30 günlük zirve/dip aralığı ve destek/direnç seviyeleri otomatik hesaplanarak AI modeline sunulur. 4 derinlemesine bölüm halinde raporlanır (*30 Günlük Performans*, *Günün Seyri*, *Kritik Destek/Direnç*, *Risk Stratejisi*).
  - **Şeffaf Mor Glassmorphic Boğa / Ayı Rozetleri**: `85/100 🐂 Boğa`, `50/100 ⚖️ Nötr` ve `35/100 🐻 Ayı` rozetleri şeffaf mor cam estetiğiyle canlı sunulur.
  - **Dinamik TL İşlem Hacmi & Pozitif İvme Vitrini**: Öne çıkan BİST hisseleri ham lot yerine `Fiyat × Lot = TL Hacim` formülüyle taranır ve primli hisseler ilk sırada gösterilir.
  - **Otomatik Satış & Alarm Motoru (`stockRuleEngine.ts`)**: Kırmızı Mum (Değişim < %0), Tavan Bozma (%10 seriden sarkma), Stop-Loss %, Kar-Al % ve İzleyen Stop (Trailing Stop - Zirveden % düşüş) kuralları.
  - **Masaüstü Alarmları**: Arka plan servisi (`background.js`) üzerinden 3 dakikada bir otomatik fiyat kontrolü ve `chrome.notifications` masaüstü alarm uyarısı.
  - **Özel Mum (Candlestick) Grafiği**: BIST hisseleri için 1M, 3M, 6M, 1Y zaman aralığı filtreli ve fare takipli crosshair mum grafik ekranı.
- **✍️ Günlüğüm (Notlar & Ders Notları & .md İndirme)**:
  - Klasik not kartlarının yanı sıra "Günlük" ve "Cornell Metodu Ders Notu" kayıtları ekleme. Her karta eklenen **`📥 .md İndir`** butonu ile notları bilgisayara `.md` formatında dışa aktarabilme.
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
- **🕹️ Life OS Arcade & Indie Dev Game Hub (Oyun Kütüphanesi & Laboratuvarı)**:

  - **YouTube Playables Estetiği**: YouTube "Hazır Oyunlar" tasarımından ilham alan büyük visual kapak posterleri, filtreleme çipleri (`Oynanabilir`, `Geliştirilenler`, `Favoriler`), arama çubuğu ve hızlı Oyna butonları.
  - **Steam Tarzı Geliştirici & İstatistik Paneli**: Her oyun için en yüksek skor, oynanma sayısı, `C:\Users\emre_\Desktop\GitHub\In Progress` proje klasör yolu, güncellenebilir geliştirici notları ve interaktif To-Do checklist paneli.
  - **Dahili HTML5 Mini Oyunlar**: Retro Neon Yılan (Snake), 2D Şövalye Runner ve Galaxy Defender 2D uzay savaşı oyunları.
  - **Yerel Geliştirici Oyun Entegrasyonu**: `In Progress` klasöründeki bağımsız projeler ve yerel dev sunucuları (`http://localhost:5173`) için canlı iframe oynatıcı ve kütüphane kaydedici.
- **🎮 Ücretsiz Oyun Takibi & Masaüstü Bildirimleri**:
  - Steam, Epic Games ve GOG platformlarındaki güncel ücretsiz oyun fırsatlarını listeleyen premium arayüz.
  - **Saatlik Arkaplan Alarmı**: `chrome.alarms` servisiyle Steam, Epic ve GOG platformlarındaki yeni ücretsiz oyunları takip edip masaüstü bildirimi gönderir. Bildirime tıklandığında oyunun claim sayfası otomatik açılır.
- **🛡️ Sosyal Medya Detoksu (Detox Blocker) & Ekran Süresi Sayacı**:
  - **Derin Bloklama (SSM Tekniği)**: Twitter/X, Instagram, YouTube, TikTok ve Facebook platformlarında **container-gizleme** stratejisi ile akışı, Reels/Shorts bölümlerini ve abonelik butonlarını seçici olarak gizler. SPA güncellemeleri `MutationObserver` + 100ms polling ile izlenir, React geri getirse bile yeniden gizlenir.
  - **Facebook Reels Temizleyici (`facebookCleaner.ts`)**: 4 katmanlı JS tarayıcı (href, aria-label, pagelet, görünür text) ile modern FB DOM'undaki Reels butonlarını akıllı şekilde gizler.
  - **YouTube Abonelikler Kaldırma (`ytSubscriptionsBlock`)**: Ayarlardan tek toggle ile Abonelikler/Subscriptions navigasyon butonunu tamamen gizler.
  - **Ekran Süresi Sayacı**: Günlük hangi sitede kaç dakika geçirdiğinizi arkaplanda (`background.js`) takip edip Detox panelinde grafiksel bar şeklinde listeler.
- **📡 RSS Takip & Okuyucu (`RssView.tsx`)**:
  - **Sağ tık ile anında kayıt**: Herhangi bir sayfada sağ tık → "📡 RSS Kaydet" menüsü. Feed URL'i otomatik kaydedilir ve ilk çekme anında yapılır.
  - **Sidebar paneli**: Feed listesi (favicon + okunmamış rozeti + hata göstergesi) + item listesi (başlık + tarih + açıklama önizleme). Tıkla → yeni sekmede aç + otomatik okundu işaretle.
  - **Otomatik arka plan senkron**: `chrome.alarms` ile 30 dakikada bir tüm feed'ler çekilir, yeni item'lar otomatik eklenir.
  - **RSS 2.0 + Atom desteği**: XML parser ile her iki format desteklenir, max 50 item/feed tutulur.
  - **XSS güvenli**: Tüm feed içeriği `textContent` ile extract edilir — HTML injection riski sıfır.
  - **Yönetim**: Manuel URL ekleme, tek-tık yenileme, feed silme (onay modalı ile).
- **🔒 Güvenlik Hardening**:
  - **DOM XSS Koruması**: Detoks bloke ekranına basılan metinlerin DOM XSS oluşturmaması için güvenli `escapeHtml` filtreleri.
  - **Zod Şema Doğrulaması**: Veri yedeklerini geri yüklerken zararlı kod enjeksiyonunu engellemek amacıyla Zod kütüphanesi ile veri şeması kontrolü.
- **🌐 Evrensel Dil Desteği & Temiz Mimari**:
  - **Proxy Fallback Yerelleştirme**: Tüm eklenti panelleri (KPSS, Pomodoro, Detoks, SRS vb.) Türkçe ve İngilizce dillerini destekler. ES6 Proxy altyapısı sayesinde çevirisi eksik kalan anahtarlar otomatik olarak İngilizce'ye fallback yapar.

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
