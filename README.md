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
  - Klasik not kartlarının yanı sıra "Günlük" ve "Cornell Metodu Ders Notu" kayıtları ekleme. Premium pill segment butonları ile arayüz geçişi; yapay zeka sohbetinden doğrudan komutla ekleme.
  - Her karta eklenen **`📥 .md İndir`** butonu ile notları bilgisayara `.md` formatında dışa aktarabilme.
  - `[[Konu Adı]]` wikilink sözdizimi, otomatik TOC, okuma süresi/kelime istatistiği ve backlinks içeren Wikipedia tarzı ders notu okuyucusu.
- **🤖 AI Asistan (Companion AI) — Yeni Sekme & Kenar Paneli**:
  - **Çok modlu ekler**: PDF, görsel ve kod dosyaları sohbete eklenebiliyor; pano yapıştırma (`Ctrl+V`) ve sürükle-bırak destekli.
  - **Token streaming** ile akış yanıt, **oturum yönetimi** (çoklu oturum, sekme bazlı geçiş), **kuyruklanmış mesajlar** ve `/` komut otomatik tamamlama.
  - **Etkileşimli doğrulama**: AI gerektiğinde `clarification` isteği gönderir veya seçenekli soru sorar; markdown dışa aktarımı.
  - **Genişletilebilir eylem kaydı (`AiFeatureRegistry`)**: Yeni modüller çekirdek sohbet kodunu değiştirmeden kendi eylemini ekler (görev, not, KPSS, borsa, namaz, medya, pomodoro, rutin, hafıza, gezinme — 10 eylem).
  - **DOM Ajanı**: Web formlarını doldurma, `contenteditable` alanlarına yazma, sosyal medya gönderi oluşturma, `/form` ve `/post` komutları.
- **🎬 Media Vault (Kütüphane)**: Film, dizi, kitap ve oyun takibi. Türe özgü ilerleme yüzdesi (sayfa / bölüm / oynama süresi), istatistik özeti (tamamlananlar, ortalama puan, devam edenler, backlog), alıntılar ve tüm kütüphanenin JSON dışa aktarımı.
- **🌐 Ağ Teşhisi**: Ping/gecikme ölçümü, **IPv4 vs IPv6** anormali tespiti, **DNS-over-HTTPS** doğrulaması ve bant genişliği hız testi. 5 sekmeli arayüz (Genel Bakış / Servis Radarı / Hız Testi / IPv4-IPv6 / Geçmiş) ve kopyalanabilir Markdown tanı raporu. Tüm ölçümler kullanıcı tarafından tetiklenir, hiçbir veri dışarı gönderilmez.
- **🏛️ Kamu İlanları & Kariyer Kapısı**: Kariyer Kapısı (CBİKO), ilan.gov.tr (BİK) ve Resmi Gazete kaynaklarından canlı kamu ilanları; son başvuru tarihine göre aciliyet rozeti ve resmi başvuru portallarına (Kariyer Kapısı, e-Devlet, İŞKUR) kısayollar. **Sıfır sahte veri politikası** uygulanır.
- **🎭 Şehir Nabzı (City Pulse)**: İBB Kültür Sanat, Biletix, Passo, AKM ve Zorlu gibi 10 kültür portalına hızlı erişim; görsel afişli etkinlik kartları (WordPress REST API), tür filtreleri ve tek tıkla Google Takvim etkinliği oluşturma.
- **🔥 Rutin Alışkanlık Zinciri**: Duolingo tarzı çok katmanlı SVG alev, 12 haftalık (84 gün) GitHub tarzı katkı ısı haritası, en uzun seri rozeti ve günlük tamamlama oranı.
- **🕌 Namaz Vakitleri**:
  - Belirlenen konum için anlık namaz vakitlerini API'den çekme, vakitleri listeleme ve o anki vaktin bitimine kalan süreyi gösteren dinamik sayaç.
- **📖 Hıfız Paneli & İmam-Hatip Yeterlilikleri**:
  - Sure, dua ve ayet ezber takibi. Aday Din Görevlisi (İmam-Hatip) ezber müfredat checklist'i.
  - Surelerin Mushaf sayfalarını okumanızı sağlayan **Mushaf Sayfa Görüntüleyicisi**.
- **🔄 Kelime Ezberi & Aralıklı Tekrar (Spaced Repetition - SRS)**:
  - Kelime ezberini bilimsel aralıklarla yapmanızı sağlayan A1, A2, B1, B2, C1, GRE, Phrasal Verbs ve Düzensiz Fiiller listelerine sahip Spaced Repetition modülü.
- **📅 Tarih Bazlı Takvim**:
  - Tam ekranı kaplayacak şekilde genişletilmiş, namaz vakitlerinden arındırılmış ve tamamlanan görevlerin geçmişini tarih bazında izlemeyi sağlayan modern takvim paneli.
- **🧭 Sidebar Kişiselleştirme**: Görünüm sırasını sürükle-bırak değiştirilir ve kalıcı olarak saklanır; kullanılmayan girdiler ayarlardan gizlenebilir; açılışta en sık kullanılan görünüm üste otomatik gelir.
- **🕹️ Life OS Arcade & Indie Dev Game Hub (Oyun Kütüphanesi & Laboratuvarı)**:

  - **YouTube Playables Estetiği**: YouTube "Hazır Oyunlar" tasarımından ilham alan büyük visual kapak posterleri, filtreleme çipleri (`Oynanabilir`, `Geliştirilenler`, `Favoriler`), arama çubuğu ve hızlı Oyna butonları.
  - **Steam Tarzı Geliştirici & İstatistik Paneli**: Her oyun için en yüksek skor, oynanma sayısı, `C:\Users\emre_\Desktop\GitHub\In Progress` proje klasör yolu, güncellenebilir geliştirici notları ve interaktif To-Do checklist paneli.
  - **Dahili HTML5 Mini Oyunlar**: Retro Neon Yılan (Snake), 2D Şövalye Runner ve Galaxy Defender 2D uzay savaşı oyunları.
  - **Yerel Geliştirici Oyun Entegrasyonu**: `In Progress` klasöründeki bağımsız projeler ve yerel dev sunucuları (`http://localhost:5173`) için canlı iframe oynatıcı ve kütüphane kaydedici.
- **🎮 Ücretsiz Oyun Takibi & Masaüstü Bildirimleri**:
  - Steam, Epic Games ve GOG platformlarındaki güncel ücretsiz oyun fırsatlarını listeleyen premium arayüz.
  - **Saatlik Arkaplan Alarmı**: `chrome.alarms` servisiyle Steam, Epic ve GOG platformlarındaki yeni ücretsiz oyunları takip edip masaüstü bildirimi gönderir. Bildirime tıklandığında oyunun claim sayfası otomatik açılır.
- **🎨 Ücretsiz Oyun Assetleri & Geliştirici Kaynakları (`GameAssetsView.tsx`)**:
  - **Çoklu Canlı Akışlar**: Itch.io Free & On-Sale varlıkları, Kenney.nl %100 CC0 kamu malı paketleri, OpenGameArt.org açık kaynak topluluk kütüphanesi ve GamerPower Loot fırsatlarını eşzamanlı listeleyen modül.
  - **Quick Hubs Hızlı Varlık Merkezleri**: Poly Pizza (3D CC0), Kenney, Itch.io, OpenGameArt, Quaternius (3D CC0), Game-Icons (SVG), AmbientCG (PBR), Epic Fab Free, Unity Asset Store Free ve Mixamo'ya tek tıkla doğrudan erişim.
  - **Kategori & Kaynak Filtreleri**: 2D, 3D, Ses/Müzik, UI, Doku/Kaplama ve DLC/Loot kategorileri, anlık arama ve Chrome Storage'da saklanan "Kaydedildi/İndirildi" işaretleme takibi.
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

## 🧭 Ekranlar (21 görünüm)

| Alan | Ekranlar |
|---|---|
| **Odak & Üretkenlik** | Liste (Odak/Rutin) · Eisenhower & Kanban · Takvim · Pomodoro · Kişisel Disiplin |
| **Bilgi & Notlar** | Günlüğüm · Not Stüdyosu (KPSS) · Hıfız · SRS Kelime Ezberi |
| **KPSS** | Konu & İlerleme · Çıkmış Sorular · Harita |
| **Finans** | BIST OS (Portföy / Takip Listesi / Keşfet / Alarmlar) · Halka Arz |
| **Medya & Oyun** | Media Vault · Ücretsiz Oyunlar · Oyun Varlıkları · Arcade |
| **Asistan & Sistem** | AI Asistan · Ağ Teşhisi · RSS Okuyucu · Şehir Nabzı · Kamu İlanları · Dijital Detoks · Namaz Vakitleri |

---

## 🛠️ Kurulum ve Geliştirme

### Gereksinimler
- Bilgisayarınızda **Node.js** yüklü olmalıdır.

### 1. Adım: Bağımlılıkları Yükleyin
Proje klasöründe bir terminal açarak npm bağımlılıklarını kurun:
```bash
npm install
```

### 2. Adım: Doğrulama (isteğe bağlı ama önerilir)
```bash
npx tsc --noEmit              # tip kontrolü
npx eslint src --quiet        # lint (hatasız olmalı)
npx vitest run                # test paketi
npm run build                 # dist/ üretimi
node scripts/findDeadFiles.mjs       # ölü dosya taraması
node scripts/i18nHealthCheck.mjs     # eksik çeviri anahtarı taraması
```

### 3. Adım: Projeyi Derleyin
```bash
npm run build
```

### 4. Adım: Chrome'a Yükleyin
1. Google Chrome tarayıcınızı açın ve `chrome://extensions/` adresine gidin.
2. Sağ üst köşede bulunan **Geliştirici modu** (Developer mode) seçeneğini aktif hale getirin.
3. Sol üstte çıkan **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
4. Bu proje klasörünün içindeki **`dist`** klasörünü seçin.

### 5. Adım: Geliştirme Modu
```bash
npm run dev                   # Vite geliştirme sunucusu
npm run generate:tree         # project_tree.md dosyasını yeniden üretir
```

> **Geliştirme sırasında:** `ROADMAP.md` kapsam dondurması uygulamadadır. Yalnızca
> **AI Smart Goal Breakdown** ve **Offline P2P WebRTC Sync** üzerinde çalışılır;
> yeni modül ve yeni bağımlılık eklenmez. Ayrıntı için `ROADMAP.md` ve
> `docs/PROJECT_GUIDE.md`.

---
*Bu çalışma; kişisel üretkenliği artırmak, hedeflere (KPSS, Hıfız, Yazılım) odaklanmak ve güncel ücretsiz oyun fırsatlarını tek ekranda toplamak için geliştirilmiştir.*
