# Changelog (Değişiklik Günlüğü)

Bu dosya, **Life OS - Personal Dashboard** eklentisinin geliştirilme aşamalarını ve eklenen tüm özellikleri sürüm geçmişi olarak takip eder.

---

## [4.1.0] - 2026-08-01
### Eklendi & İyileştirildi
- **BIST Nakit Bakiyesi & Toplam Varlık (`CashBalanceModal.tsx`, `PortfolioSummaryCard.tsx`, `useBist.ts`)**:
  - Nakit bakiyesi `chrome.storage.sync`'te — A/B PC senkronize.
  - Hisse **alımında** nakit otomatik düşülür, **satışında** eklenir.
  - Toplam Varlık kartı: Nakit + Hisse Değeri kırılımı, kalem ikonu ile nakit ekleme (mevcut + yeni = canlı toplam önizleme).
- **Varlık Dağılımı Pasta Grafiği (`WealthDistributionModal.tsx`)**:
  - Toplam Varlık kartına tıklayınca açılan cyberpunk temalı SVG pasta grafiği.
  - Her varlık farklı renk + derinlik katmanı; canlı piyasa fiyatlarıyla hesaplanır.
- **Satış Geçmişi (`StockTradeHistoryModal.tsx`)**:
  - Satış fiyatı + kâr/zarar TL & % + tarih kaydı, toplam K/Z özeti.
- **WhatsApp & Telegram Köprü Aç/Kapa (`BridgeToggles.tsx`, `contentMain.ts`)**:
  - Ayarlar > Genel'den `@ai` asistan köprüleri açılıp kapatılabilir — **varsayılan KAPALI**.
  - Content script köprüyü sadece açıkken başlatır.
- **Mimari Temizlik**:
  - `BistView.tsx` 349 → 262 satır (`BistPortfolioTab.tsx` ayrıldı).
  - `GeneralSettingsTab.tsx` 447 → 84 satır (`AppSettingsGroup.tsx` + `BridgeToggles.tsx` ayrıldı).

## [4.0.0] - 2026-07-29
### Eklendi & İyileştirildi
- **Life OS Arcade & Indie Dev Game Hub (Oyun Kütüphanesi & Laboratuvarı)**:

  - **YouTube Playables Vitrin Tasarımı (`ArcadeHeader.tsx`, `ArcadeGameCard.tsx`)**: YouTube "Hazır Oyunlar" estetiğinde büyük kapak posterleri, canlı durum rozetleri (`Oynanabilir`, `Geliştiriliyor`, `Konsept`), teknoloji etiketleri (`Phaser`, `Three.js`, `Canvas`), kategori filtreleme çipleri ve arama çubuğu entegre edildi.
  - **Steam Tarzı Oyun & Geliştirici Detay Paneli (`ArcadeGameModal.tsx`)**:
    - Oyuna tıklandığında açılan oyun oynatma ve detay modalı.
    - **Oyna Sekmesi**: Gömülü oyunları doğrudan oynatır; yerel sunucularda (`http://localhost:5173`) çalışan `In Progress` oyun projeleri için canlı `iframe` çalıştırma desteği sağlar.
    - **Steam Dev Log Sekmesi**: En Yüksek Skor, Oynanma Sayısı, `C:\Users\emre_\Desktop\GitHub\In Progress\<oyun-klasoru>` proje klasör yolu, düzenlenebilir geliştirici notları ve interaktif To-Do checklist paneli.
  - **3 Adet Dahili HTML5 Mini Oyun (Built-in Engines)**:
    - **Neon Snake Arcade (`SnakeGame.tsx`)**: Skor takipli retro yılan oyunu.
    - **2D Knight Runner (`KnightRunner.tsx`)**: Engellerden zıplamalı ve altın toplamalı 2D şövalye koşu oyunu.
    - **Galaxy Defender 2D (`SpaceShooter.tsx`)**: Lazer ateşlemeli retro uzay savaşı oyunu.
  - **Yerel Proje & Özel Oyun Kaydedici (`arcadeService.ts`, `AddGameModal.tsx`)**: `In Progress` altındaki projelerinizi (2D Şövalye, 60 Days Survival, Isekai AI, Car Races, Tarot Kaderi vb.) veya özel dev sunucularınızı kütüphaneye kaydedebilme ve yönetebilme olanağı.
  - **Koyu Glassmorphic CSS & Tam i18n Desteği (`arcade.css`)**: Koyu temalı cam efekti (glassmorphism) stili yazıldı ve Türkçe/İngilizce dil çevirileri eklendi.

## [3.9.0] - 2026-07-28
### Eklendi & İyileştirildi

- **KPSS Ders Notları & Wiki Stüdyosu Yenilemesi (`KpssNotesDashboard.tsx`, `KpssWikiReader.tsx`)**:
  - Orijinal Vikipedi Dark Mode tasarımı uygulandı; mod sekmeleri (`Oku` | `Değiştir`), `.md İndir` butonu ve ikon bazlı **Wikiağ Nöral Graf** ikonu üst bar alanına taşındı.
  - **Türkçe Unicode Wikilink Otomatik Bağlantı Motoru (`kpssWikiService.ts`)**: `\p{L}` Unicode regex sınırları ile `Çorum`, `İstanbul`, `İç Anadolu` gibi tüm Türkçe karakterli notlar metin içinde mavi tıklanabilir Wikilink'e dönüştürüldü.
  - **Gelen Bağlantılar (Backlinks) Entegrasyonu**: Çapraz not atıfları Bilgi Kutusu altında `🔗 Gelen Bağlantılar` başlığı ile dinamik olarak listelendi.
  - **Otomatik Görsel Algılama & Link Gizleme**: Nota yapıştırılan görsel URL'leri metin içindeki çirkin link görünümünden gizlendi ve Vikipedi kapak görseli olarak Bilgi Kutusu'nun en üstüne eklendi.

## [3.8.0] - 2026-07-28
### Eklendi & İyileştirildi
- **BİST 30 Günlük Derinlemesine Yapay Zeka Analizi (`stockAiService.ts`)**:
  - Hisselerin 30 günlük OHLC mum verileri, 1 aylık toplam getiri %, 30 günlük zirve/dip aralığı otomatik hesaplanarak AI analiz motoruna bağlandı.
  - Yapay zeka çıktısı 4 derinlemesine bölüme dönüştürüldü: *30 Günlük Performans & Trend*, *Günün Seyri & Volatilite*, *Kritik Destek / Direnç Seviyeleri* ve *Risk & Strateji*.
- **Şeffaf Mor Glassmorphic Boğa / Ayı Rozetleri**:
  - Yapay zeka borsa analiz başlığında ve Keşfet kartlarında `85/100 🐂 Boğa`, `50/100 ⚖️ Nötr` ve `35/100 🐻 Ayı` rozetleri şeffaf mor cam estetiğiyle güncellendi.
- **Dinamik TL İşlem Hacmi & Pozitif İvme Sıralaması (`BistKesfetTab.tsx`)**:
  - Öne çıkan hisseler sıralaması ham lot adedi yerine `Fiyat × Lot = TL Hacim` formülüyle güncellendi. THYAO gibi piyasa devleri hak ettiği 1. sıraya taşındı.
  - Primli ve yükselişte olan hisseler Öne Çıkanlar vitrininde önceliklendirildi.
- **Arka Planda Kesintisiz Çalan Ortam Sesleri (Persistent Background Audio)**:
  - Popup penceresi kapatıldığında seslerin kesilmesi sorunu çözüldü; ortam sesleri (Yağmur, Rüzgar, Lo-Fi) `backgroundMain.ts` service worker üzerine taşındı.
- **Günlüğüm Ders Notlarını Markdown (.md) Olarak İndirme (`NoteCard.tsx`)**:
  - Her not ve Cornell kartına **`📥 .md İndir`** butonu eklenerek ders notlarının doğrudan `.md` olarak bilgisayara aktarılması sağlandı.
- **`Ctrl + Shift + E` Kısayol Entegrasyonu**:
  - Klavyeden `Ctrl + Shift + E` tuşuna basıldığında Companion AI Yan Paneli doğrudan açılacak şekilde `manifest.json` ve `backgroundMain.ts` güncellendi.

## [3.7.0] - 2026-07-26
### Eklendi
- **Tüm Borsa İstanbul (BIST) İçin Otomatik Borsa Yönetim & Strateji Sistemi**: Halka arzlar ve tüm BIST hisseleri (`THYAO`, `GARAN`, `KRDMD`, `SASA`, `EREGL` vb.) için canlı fiyat akışı, portföy takibi, kar/zarar hesaplamaları ve otomatik kural motoru eklendi.
- **Esnek Otomatik Kural Motoru (`stockRuleEngine.ts`)**:
  - 🔴 **Kırmızı Mum:** Günü eksiye geçen hisselerde anlık uyarı sinyali.
  - ⚡ **Tavan Bozdu:** %10 tavan serisinden sarkma olduğunda otomatik uyarı.
  - 📉 **Stop-Loss & 📈 Kar-Al:** Belirlenen yüzdesel maliyet marjlarına ulaşıldığında uyarı.
  - 🎯 **İzleyen Stop (Trailing Stop):** Görülen en yüksek zirve fiyatın % X altına düşüldüğünde karı korumak için alarm tetikleme.
- **Arka Plan Otomatik Fiyat Taraması & Masaüstü Alarmları**: `background.js` içinde `check_bist_stock_rules` periyodik alarmı tanımlanarak 3 dakikada bir fiyatlar taranır ve kural eşleşmelerinde Chrome Masaüstü Bildirimi (`chrome.notifications`) çıkarılır.
- **Yapay Zeka (Ollama / OpenRouter / Gemini) Borsa Danışmanı**: Seçilen BIST hissesi veya portföyün genel durumu için canlı teknik/temel yapay zeka analizi sunan `StockAiAnalysisModal` entegre edildi.
- **Clean Architecture & Layout Assembly Refactoring**: Borsa verileri `ChromeStorageStockRepository` depolama katmanına taşındı; `PortfolioSummaryCard`, `StockWatchlistTable`, `RuleBuilderModal`, `AddStockModal` ve `StockAlertHistoryModal` prop tabanlı alt bileşenlere ayrıştırıldı.

## [3.6.0] - 2026-07-19
### Eklendi
- **Eklenti Genelinde İngilizce Dil Desteği**: `i18n.ts` altyapısı genişletilerek eklentideki tüm ayar sekmeleri, aralık tekrar ekranları, namaz vakitleri, KPSS detayları ve motivasyon alanları İngilizce ve Türkçe olarak yerelleştirildi.
- **Dinamik Dil Fallback Proxy Altyapısı**: ES6 Proxy mimarisi kullanılarak, gelecekte eklenecek yeni dillerde bir çeviri anahtarı eksik olduğunda sistemin çökmeden doğrudan İngilizce (`en`) karşılığına fallback yapması sağlandı.
- **Sağ Üst Popup Temiz Mimari Geçişi**: `popup.tsx` dosyası Layout Assembly modeline göre bölündü. `usePopup` hook'u ile durum/zamanlayıcı iş mantığı soyutlandı; Pomodoro (`PopupPomoTab.tsx`) ve Detoks (`PopupDetoxTab.tsx`) arayüzleri prop tabanlı alt bileşenlere taşınarak popup ana dosyası 100 satırın altına düşürüldü.
- **Güvenlik ve Ahlaka Aykırı İçerik Taraması**: Eklenti genelinde küfür ve ahlaka aykırı kelimeler taranıp temizlendi. Kelime ezber veri tabanındaki (`phrasal.json`) uygunsuz örnek cümleler tamamen güvenli ve genel ahlaka uygun olanlarla değiştirildi.
- **ESLint & TypeScript Hata Sıfırlama**: Kod tabanındaki tüm kullanılmayan import'lar, yanlış regex kaçış karakterleri, boş catch blokları ve gereksiz değişken tanımlamaları düzeltilerek projedeki linter (`eslint`) hataları tamamen sıfıra düşürüldü.

## [3.5.0] - 2026-07-19
### Eklendi
- **ÖSYM KPSS Çıkmış Sorular Sınav Salonu**: 2021 yılından 2009 yılına kadar olan KPSS Lisans Genel Yetenek-Genel Kültür (Tarih, Coğrafya, Matematik) çıkmış sorularının yer aldığı sınav salonu eklendi. Kullanıcılar her yılın sınavını veya tüm yıllardan oluşan karma denemeleri çözebilmektedir.
- **İnteraktif Soru Sistemi Rehberi (Help Icon)**: Sınav çözme ekranına dairesel bir `!` bilgi düğmesi eklenerek ÖSYM'nin 2000'li yıllardan sonra yaptığı kritik sistem reformları (2013: Geçiş/Müfredat denemesi, 2014: Sözel/Sayısal mantığın resmi başlangıcı, 2018: ALES benzeri yeni nesil muhakeme soruları) hakkında bilgilendirme sunuldu.
- **Dinamik Soru Sayısı Gösterimi**: Dashboard ekranındaki konu ve ders soru sayıları statik değerler yerine sınav veri havuzundan (`KPSS_YEARLY_DATA`) anlık olarak okunup dinamik ve hatasız hesaplanacak şekilde güncellendi.
- **Temiz Mimari ve Refaktör (Clean Architecture Refactor)**: `KpssView.tsx` içindeki veri importları ve iş mantığı temizlendi:
  - Bütün sınav verileri `kpssDataRegistry.ts` altında merkezi hale getirildi.
  - Yapay zeka ile soru üretme ve API çağrısı mantığı `kpssAiService.ts` dosyasına taşındı.
  - Net puan hesaplama işlevleri `kpssCalculator.ts` modülüne taşınarak bileşenlerin okunabilirliği artırıldı.

## [3.4.0] - 2026-07-18
### Eklendi
- **Yapay Zeka Ses Sentezleyiciler**: Odak sesleri ve müzikleri (Yağmur, Rüzgar, Lo-Fi) harici mp3 sunucu bağımlılığından kurtarılarak tamamen çevrimdışı çalışabilen Web Audio API fiziksel ses sentezleyicilerine dönüştürüldü. Rüzgar uğultuları için LFO sweep modu, yağmur için stokastik üstel söndürmeli damla vuruşları ve Lo-Fi kanalı için vinyl çıtırtılı warm rhodes akor döngüsü sentezlendi.
- **Kişiselleştirilmiş Koyu Tema Takvim Seçici (Custom DatePicker)**: Yapılacak işler için son tarih belirlemede kullanılan beyaz renkli yerel tarayıcı takvimi kaldırıldı; yerine eklentinin mor gradientli ve dark-glassmorphic estetiğiyle bütünleşen, ay geçişli, dairesel seçimli özel `DatePicker` bileşeni eklendi.
- **Hıfız/Ezber Arayüzü Kart Düzeni**: Ezberlerim ekranında alt alta dizilerek yer kaplayan "Ezberlendi", "Çalışılıyor" ve "Hedef" durum kartları, yatayda tek satırda yan yana duracak şekilde grid düzenine geçirildi.
- **KPSS Tamamen Otomatik Sınav Tabanlı Süreç**: Konularda manuel olarak tik atıp tamamlama seçeneği kaldırıldı; konu durumları (Başlanmadı / Çalışılıyor / Tamamlandı) tamamen AI quiz seviye belirleme sınavından alınan başarı oranlarına göre (skor >= 80 ise tamamlandı, >= 40 ise çalışılıyor) otomatik hesaplanır hale getirildi. Planlayıcı satırlarına tıklandığında ilgili derse otomatik geçerek sınavı açan akıllı yönlendirme eklendi.
- **Sınav Başlama Arayüzü Bulanıklığı**: Seviye tespit sınavı başlama modal penceresinin arkasında checklist yazılarının saydam şekilde okunma hatası, modal yapısına `%98` opaklıkta slate arka plan ve `backdrop-filter: blur` eklenerek çözüldü.

## [3.3.0] - 2026-07-18
### Eklendi
- **KPSS Hedef Ayarları "Ayarlar" Paneline Taşındı**: Net ve Puan hedefi belirleme kontrolleri (artırma/azaltma düğmeleri ve hedef türü seçicileri) KPSS ana ekranından kaldırıldı ve sol alt köşedeki Ayarlar paneline entegre edildi.
- **Eisenhower Matrisi ve Kanban Menü Birleştirmesi**: Navigasyon sidebar'ındaki ayrı duran Kanban ve Eisenhower Matrix butonları, tek bir premium "Eisenhower & Kanban" menü seçeneği altında birleştirildi.
- **Düşük Kaliteli Emojilerin SVG İkonlarla Değiştirilmesi**: Arayüzlerdeki 📈, 📊 ve 🎯 gibi emojiler mor temalı yüksek çözünürlüklü vektörel SVG simgelerle güncellendi.
- **Grafik Yazı Üst Üste Binme Hatası Düzeltildi**: Çizgi grafikte soru ve video hedeflerinin çakışmasını engellemek amacıyla hedefler sol ve sağ kenarlara zıt olarak hizalandı.
- **Ekran Süresi Uyku Modu (Sleep) Düzeltmesi**: Bilgisayar kilitlendiğinde veya uykuya geçtiğinde süre birikmesini engellemek için tekil zaman artışları arka planda maksimum 12 saniye ile sınırlandırıldı.
- **Yasaklanan Emojiler Kuralı**: [.agents/AGENTS.md](file:///c:/Users/emre_/.agents/AGENTS.md) dosyasına görsel etiketlerde düşük kaliteli emoji kullanımını yasaklayan kural eklendi.

## [3.2.0] - 2026-07-18
### Eklendi
- **Notlar & Günlük İçin Gelişmiş Sözler Filtresi**: Günlüğüm (Notes) sekmesine özel "Sözler" filtresi eklendi. "Hepsi" ve "Sözler" seçildiğinde özel motivasyon sözlerinize erişim sağlanırken, diğer not kategorileri seçildiğinde ekranın sade kalması adına sözler listesi otomatik olarak gizlenir.
- **Amazon Luna & Ücretsiz Oyun Kısayolları**: Ücretsiz Oyunlar ekranının üst kısmına hızlı talep butonları eklenerek Prime Gaming, Epic Games, Steam, GOG ve yeni talep edilen Amazon Luna (`https://luna.amazon.com/claims/home?g=s`) sayfalarına hızlı geçiş sağlandı.
- **9Router Proxy ve Yerel Model Entegrasyonu**:
  - Yapay zeka ayarları sadeleştirilerek sadece `9Router Proxy (OpenAI Uyumlu)` seçeneği arayüzde bırakıldı. Gemini ve Ollama seçenekleri kaldırıldı.
  - Yapay zeka istek paketlerinden katı `response_format: { type: "json_object" }` parametresi kaldırılarak, yerel proxy modelleriyle ve Llama 3 tabanlı modellerle %100 uyumluluk sağlandı.
  - Model yanıtlarındaki markdown kod bloklarını (` ```json ... ``` `) otomatik temizleyen `cleanAndParseJSON` filtresi entegre edildi.
  - Yerel 9Router proxy'sine erişimi tarayıcı CORS engelinden korumak adına `manifest.json` dosyasına `localhost` ve `127.0.0.1` izinleri eklendi.
- **Temiz Mimari (Clean Architecture) Geliştirmesi**: Görsel kod ayırma kuralına uygun şekilde `FreeGamesView.tsx` dosyasından `<GameCard />` ve `<HistoryCard />` sunum bileşenleri ayrıştırıldı.
- **Açılır Kutu Okunabilirlik İyileştirmesi**: Açılır kutulardaki (Detox seçici vb.) beyaz üzeri beyaz yazı okunma kontrast hatası, tüm seçenek etiketlerine koyu arka plan (`#161622`) ve beyaz metin uygulanarak çözüldü.

---

## [3.1.0] - 2026-07-18
### Eklendi
- **BIST Hisseleri İçin Özel Mum Grafiği (Custom Canvas Stock Chart)**: Yavaş çalışan ve BIST verilerinde hata veren TradingView iframe'i yerine Yahoo Finance entegrasyonlu, tamamen özel çizilen HTML5 Canvas Candlestick (Mum) Grafik Paneli eklendi. Grafik üzerinde 1M, 3M, 6M, 1Y zaman aralığı filtreleri, fareyle takip edilen imleç (crosshair) ve Açılış, Kapanış, En Yüksek, En Düşük, Hacim bilgilerini gösteren anlık metadata çubuğu entegre edildi.
- **Premium Günlük ve Not Yönetimi (Günlüğüm)**: "Notlar" kısmı "Günlüğüm" olarak yeniden adlandırıldı. Klasik notların yanı sıra "Günlük" ve "Cornell Metodu Ders Notu" türünde kayıt ekleme desteği ile modal arayüzündeki standart tarayıcı açılır listesi (select dropdown) yerine modern, glassmorphic pill segment butonları (tabs) eklendi. Not eklemek için yapay zeka sohbet komutları ("günlük ekle...", "ders notu ekle...") desteği getirildi.
- **Yapay Zeka ile KPSS Seviye Tespit Sınavı**: KPSS konuları için yapay zeka tarafından 5, 10, 15, 20, 25 soruluk çoktan seçmeli, 5 seçenekli (A-E) test oluşturma sistemi eklendi. Sonuca göre o konudaki yetkinlik yüzdesi hesaplanıp KPSS ilerleme durumuna otomatik işlenmektedir (>=80% tamamlandı, >=40% çalışılıyor).
- **KPSS Çalışma Zamanı Tahmini ve Sınav Sayacı**: KPSS Lisans sınav tarihine (6 Eylül 2026) kalan süreyi saniye hassasiyetinde gösteren sayaç ve kalan konulara göre (konu başına 2 gün çalışma hızı kabul edilerek) tahmini bitiş süresini gösteren dinamik tamamlanma sayacı entegre edildi.
- **Dinamik Sürükle-Bırak Sidebar ve Akıllı Saat**: Sidebar menüsündeki ögelerin yerleri sürükle-bırak yöntemiyle yeniden sıralanabilir hale getirildi ve sıralama yerel depolamaya (local storage) kaydedildi. Üstteki Hero Dijital Saat widget'ı, sidebar'daki en üstte yer alan aktif sayfaya göre kendini dinamik olarak o sayfaya taşıyacak şekilde güncellendi.
- **Yerel/Ollama Yapay Zeka Desteği**: Settings paneli üzerinden Ollama yerel yapay zeka sunucusu entegrasyon desteği sağlandı (Örn. masaüstü bilgisayarı Ollama sunucusu olarak kullanıp eklentiden bağlanabilme).
- **Temiz Mimari (Clean Architecture) Refaktörü**: `App.tsx`, `KpssView.tsx` ve `PomodoroView.tsx` dosyalarındaki görsel kod yükü azaltılarak; `<HeroHeader />`, `<FooterQuote />`, `<KpssCountdownBanner />` ve `<PomoSidePanel />` gibi saf sunum (presentational) bileşenleri ayrı modüler `.tsx` dosyalarına taşındı.

### Düzeltildi
- Namaz vakitleri ile İstanbul şehri arasına hafif bir dikey boşluk eklenerek görsel hizalama iyileştirildi.

---

## [3.0.0] - 2026-07-14
### Eklendi
- **Google Bulut Senkronizasyonu (Google Drive AppData Sync)**: Tüm Life OS verilerini ( KPSS ilerlemesi, aralıklı tekrar kartları, hıfız kayıtları, notlar, pomodoro geçmişi, irade süresi vb.) Google Drive'ın gizli uygulama klasöründe yedekleyen ve geri yükleyen OAuth2 tabanlı sistem entegre edildi.
- **Zen Bahçesi & Odak Geçmişi (Zen Garden Sandbox)**: Tamamlanan odaklanma Pomodoro seansları için kullanıcılara Zen ögeleri (Bonsai, Koi, Pagoda vb.) hediye eden 5x5 interaktif kum bahçesi tasarlandı. Geçmiş seanslar için gelişmiş arama ve filtreleme tablosu eklendi.
- **Google Görevler (Tasks) Entegrasyonu**: Yapılacaklar listesi "Görevler" (Tasks) olarak yeniden adlandırılarak Google Tasks API ile çift yönlü tam senkronizasyon sağlandı. Görevler "Odak" (Focus) ve "Rutinler" (Routines) şeklinde ikiye ayrıldı.
- **Google Takvim (Calendar) Entegrasyonu**: Aylık takvim görünümünde tamamlanan yerel görevlerle yan yana Google Calendar etkinliklerinin de listelenmesi ve detaylandırılması sağlandı.

---

## [2.7.3] - 2026-07-12
### Düzeltildi
- **Akıllı Çeviri Balonu Konumlandırması**: Çeviri balonunun ekranın üst sınırından taşarak kesilmesi hatası, pencere yüksekliği ölçülerek otomatik olarak metnin altına kaydırılacak şekilde giderildi.

---

## [2.7.2] - 2026-07-12
### Düzeltildi
- Kısayol seçimindeki görünmeyen yazılar CSS ile düzeltildi.
- Çeviri karakter limiti 5000 karaktere çıkarıldı.
- Sayfaya boş yere tıklayınca balonun kapanmama sorunu çözüldü.

---

## [2.7.1] - 2026-07-12
### Düzeltildi
- Seçilen dil ile hedef dil aynı olduğunda çevrilmeme (kendini tekrarlama) hatası giderildi.

---

## [2.7.0] - 2026-07-12
### Eklendi
- Sayfa içi premium çeviri balonu (Universal Info Box) entegre edildi.
- Shadow DOM izolasyonu sağlandı ve güvenlik engelleri arka plan servisiyle aşıldı.
- Ayarlar paneline açma/kapama ve kısayol tuşu kontrolleri eklendi.

---

## [2.6.3] - 2026-07-12
### Eklendi
- Yol haritasına Universal Info Box entegrasyon planı eklendi.

---

## [2.6.2] - 2026-07-12
### Eklendi
- Yol haritasına sayfa içi metin çevirici planı eklendi.

---

## [2.6.1] - 2026-07-12
### Eklendi
- Gelecek planları yol haritası (`ROADMAP.md`) oluşturuldu ve `README.md` dokümantasyonu güncellendi.

---

## [2.6.0] - 2026-07-12
### Eklendi
- Özel onay penceresi (`ConfirmModal`) yapıldı ve tarayıcı `confirm()` popupları tamamen kaldırıldı.
- Saatlik çalışan ücretsiz oyun (Steam, Epic, GOG) bildirim servisi eklendi.
- Bildirimleri açma/kapama ayarı eklendi.
- Eklenti marka logosu (`icons/icon-128.png`) oluşturularak eklendi.

---

## [2.5.0] - 2026-07-11
### Eklendi
- **TypeScript & ESLint Kod Temizliği**:
  - `npx tsc` derleme aşamasında hata veren takvim gün hücreleri (`never[]`), storage okuma parametre tipi eşleşmeleri (`res as Record<string, any>`) ve App.tsx'teki eksik model değişkenleri (`category`, `lastCompletedDate`) tamamen çözüldü.
  - ESLint tarafındaki 65 adet kural ihlali (tek satırlık `if` deyimlerindeki süslü parantez eksiklikleri, kullanılmayan import ve değişken tanımlamaları, gereksiz atamalar) sıfırlandı.
  - Prettier biçimlendiricisi tüm proje genelinde (54 dosya) çalıştırılarak kod girintileri, boşluklar ve genel yazım formatı kusursuz bir standarda kavuşturuldu.

---

## [2.4.2] - 2026-07-11
### Değişti
- **Sağ Üst Popup Detoks Arayüzü Kolay Seçim Modu**:
  - Popup penceresindeki manuel adres yazma kutusu ve site listesi kaldırıldı. Manuel adres engelleme işlemi artık tamamen Yeni Sekme (New Tab) paneline taşındı.
  - Bunun yerine, pop-up ekranına 5 popüler sosyal medya sitesinin (Twitter/X, Instagram, YouTube, TikTok, Facebook) logolarıyla (SVG ikonları) seçilebileceği 5 sütunlu, modern bir seçim tablosu eklendi.
  - Seçilen popüler siteler, soft mor arka plan ve mor renkli ikon aydınlatmalarıyla görsel olarak seçildiğini belirtir hale getirildi. Seçimi kaldırmak ise tek tıkla oldukça pratik bir hale getirildi.
  - Yeni Sekmeden manuel eklenen diğer özel siteler, popup ekranında bu butonlara tıklandığında silinmez veya bozulmaz; sadece seçilen popüler sitelerin alan adları listede güncellenerek güvenli bir şekilde senkronize edilir.

---

## [2.4.1] - 2026-07-11
### Düzeltildi
- **Sağ Üst Popup Arayüzü İyileştirmeleri ve Font Düzeltmeleri**:
  - Chrome eklentilerinde varsayılan form denetimlerinin (butonlar, select kutuları ve inputlar) tarayıcı varsayılan serif yazı tipine (Times New Roman) düşmesini engellemek için `button, input, select, textarea { font-family: inherit; }` kuralı eklendi.
  - Tab geçiş butonlarındaki çakışan inline `background: transparent` kodları kaldırıldı. Bu sayede aktif sekmenin mor (`#8b5cf6`) arka plan rengi ve yumuşak gölgesi artık kararlı ve göz alıcı bir şekilde çalışıyor.
  - Tıklama sonrasında tarayıcının butonlara uyguladığı kaba, çiğ beyaz odaklanma çerçevesi/arka planı (`:focus`) engellendi.
  - Detoks başlatma ve bitirme butonları, çiğ beyaz dikdörtgen görünümden kurtarılarak mor renk geçişine (gradient), yuvarlatılmış köşelere, yumuşak gölgeye ve hover animasyonlarına sahip premium butonlarla değiştirildi.
  - Site listesindeki koyu ve çiğ arka planlar kaldırılarak tamamen şeffaf, ince kenarlıklı glassmorphic tasarıma geçildi.

---

## [2.4.0] - 2026-07-11
### Eklendi
- **Günlük Ekran Süresi Takipçisi (Screen-Time Tracker)**:
  - Arka planda aktif sekmeleri izleyen, domain bazlı aktif geçirilen süreyi saniye hassasiyetinde ölçen yeni bir servis betiği (`background.js`) yazıldı.
  - Tarayıcının veya aktif sekmenin odağını kaybetmesi durumunda sayaç durur, böylece yalnızca gerçek aktif kullanım süreleri doğru şekilde hesaplanır.
  - Performansı korumak amacıyla veriler arka planda biriktirilir (buffer) ve her 10 saniyede bir toplu olarak yerel depolama alanına (`chrome.storage.local`) kaydedilir.
- **Detoks Sekmesinde Kullanım Analiz Paneli**:
  - Sosyal Medya Detoksu görünümünün en üstüne yeni bir analiz kartı eklendi: *"Bugün Chrome'da Ne Kadar Vakit Geçirdin?"*.
  - Bu panelde, bugün tarayıcıda geçirilen toplam süre büyük dijital bir saat formatında gösterilir.
  - Altında, en çok vakit geçirilen siteler (domainler) süreleri ve yüzde paylarıyla birlikte listelenir.
  - Her sitenin altında, sürenin büyüklüğüne göre dolan, mor-mor/leylak renk geçişine sahip modern glassmorphic ilerleme çubukları (progress bars) bulunur.
  - En çok ziyaret edilen ilk 5 site gösterilir; daha fazlası için "Tümünü Göster" butonuyla genişletilebilir dinamik liste yapısı eklendi.

---

## [2.3.0] - 2026-07-11
### Eklendi
- **Manuel Detoks Adresi Engelleme**:
  - Detoks görünümü içerisine kullanıcının kendi istediği adresleri manuel yazıp ekleyebileceği bir özel alan ve engellenen adresleri listeleyen dinamik rozetler eklendi.
  - Bu manuel adreslerin engellenmesini sağlamak için `manifest.json` dosyasındaki içerik betikleri eşleşme kuralı tüm adresleri (`<all_urls>`) kapsayacak şekilde güncellendi.
- **Sağ Üst Eklenti Pop-up Panelinde Çoklu Özellik Desteği (Pomodoro & Detoks)**:
  - Tarayıcının sağ üstündeki eklenti ikonuna tıklandığında açılan popup arayüzü tamamen yenilenerek iki sekmeli bir yapıya geçildi: **Pomodoro & Alarmlar** ve **Detoks**.
  - **Pomodoro Sekmesi**: Ortak Pomodoro sayacı kontrolü, anlık senkronize olan bir Kronometre paneli ve telefon tarzı kurulmuş alarmları gösterip açıp kapatabileceğiniz bir Alarmlar paneli içerir.
  - **Detoks Sekmesi**: Yeni sekme açmaya gerek kalmadan detoks oturumunu başlatma/bitirme, süre seçme, manuel engellenecek site ekleme ve engelli siteleri listeleme özelliklerini barındırır.
- **Telefon Tarzı Çoklu Alarmlar Sistemi**:
  - Tek ve kontrolü zahmetli olan eski alarm kurma kutusu kaldırılarak tamamen telefon uygulamalarındaki gibi dinamik ve birden çok alarm eklenebilen bir alarmlar listesi geliştirildi.
  - Alarmlar listesinde her alarm; büyük saat karakterleri, aktif/pasif etme anahtarı (toggle switch) ve silme butonuyla birlikte gösterilir. Kurulan saat geldiğinde alarm tetiklenir, otomatik pasife alınır ve masaüstü bildirimi gönderilir.

### Düzeltildi
- **Kronometre & Alarm Senkronizasyonu**:
  - Kronometre ve telefon tarzı alarmların durumu `chrome.storage.local` üzerinde ortak bir yapıya alınarak Yeni Sekme ekranı ile Sağ Üst popup ekranı arasında 100% anlık senkronizasyon sağlandı.

---

## [2.2.5] - 2026-07-11
### Düzeltildi
- **Detoks Engelleme Ekranı Kilitlenme ve Yükleme Sorunları**:
  - `DOMContentLoaded` olayının, storage sorgusu tamamlanmadan önce gerçekleştiği race condition (yarış durumu) hatası düzeltilerek bloke ekranının anında yüklenmesi sağlandı.
  - Tek Sayfa Uygulamalarının (Single-Page-Apps) (Twitter/X, Instagram, YouTube vb.) kendi istemci taraflı JavaScript kodlarıyla eklentimizin engelleyici ekranını ezmelerini (React hydration override) engellemek amacıyla **MutationObserver** mekanizması entegre edildi.
  - Engellenen sitelere girildiğinde artık kilit simgesi, kalan detoks süresi sayacı ve rastgele motive edici bir söz içeren glassmorphic bloke kartı kesintisiz ve kararlı bir şekilde ekranda kilitlenmektedir.

---

## [2.2.4] - 2026-07-11
### Değişti
- **Görev Girişi ve Kart Arası Mesafe**:
  - Liste görünümünde üstteki sabit görev ekleme çubuğu ile alttaki "Bugünkü odağın nedir?" kartı arasındaki üst üste binme sorunu giderildi.
  - `#list-view` seçicisine `margin-top: 110px;` eklenerek iki arayüz bloğu arasında dengeli bir boşluk bırakıldı ve sayfa dikey olarak kusursuzca ortalandı.

---

## [2.2.3] - 2026-07-11
### Değişti
- **Saat ve Tarih Konumu (Ücretsiz Oyunlar)**:
  - Saat ve tarih (Hero header), "Liste" görünümünden kaldırılarak kullanıcının talebi üzerine tekrar "Ücretsiz Oyunlar" (Ana/İlk ekran) görünümüne alındı.
- **Sidebar Menü Sıralaması**:
  - Sol menüdeki düğmeler kullanıcının istediği sıraya alındı:
    1. Ücretsiz Oyunlar (1. sıra)
    2. Liste (2. sıra)
    3. Kişisel Disiplin (3. sıra)
    4. Pomodoro (4. sıra)

---

## [2.2.2] - 2026-07-11
### Düzeltildi
- **Kanban & Takvim Genişlik Hatası**:
  - Uzantının React kök düğümü olan `#app` seçicisine genişlik kuralları (`width: 100%; min-height: 100vh;`) eklenerek, flex yapısından ötürü çöken ve Kanban/Takvim bileşenlerini 300px genişliğe sıkıştıran ana arayüz genişleme hatası giderildi.
- **KPSS Hazırlık Sidebar Yazısı**:
  - Sidebar üzerinde KPSS ikonu yanında görünmeyen "KPSS Hazırlık" yazısı geri getirilerek i18n dillerine (`view_kpss`) bağlandı.
- **Detoks Bloke Arayüzü**:
  - Detoks modunda siteler engellendiğinde sayfanın sadece boş beyaz ekran olarak kalmasına neden olan `!important` CSS ön-yükleme stili temizlendi. Artık engellenen sitelere girildiğinde kalan süre sayacı ve rastgele motive edici bir sözün yer aldığı şık glassmorphic kart arayüzü düzgünce yüklenmektedir.

---

## [2.2.1] - 2026-07-11
### Değişti
- **Genişletilmiş Dashboard Arayüzü**:
  - `.container` seçicisinin varsayılan maksimum genişliği `1000px` değerinden `1200px` değerine çıkarıldı.
  - Sıkışık olan Kanban panosunun ekranı daha geniş kaplaması ve esnekçe yayılması sağlandı.
- **Ayarlar Ekranı Okunabilirliği**:
  - Şeffaflık yüzünden arka plandaki yazılarla çakışan Ayarlar paneli (`.settings-content`), `rgba(15, 15, 22, 0.98)` rengiyle opak hale getirilerek okunabilirliği artırıldı.
- **Takvim ve Namaz Vakitleri Ayrımı**:
  - Takvim sayfası içerisindeki Ezan Vakitleri widget'ı kaldırıldı; takvim bileşeni artık tüm ekran genişliğini kaplamaktadır.
- **Saat ve Tarih Konumu**:
  - Saat ve tarih alanı, diğer araçlarda dikkati dağıtmaması için yalnızca "Liste" (ana ekran) görünümünde aktif olacak şekilde sınırlandırıldı.

---

## [2.2.0] - 2026-07-11
### Eklendi
- **Görevler ve Rutinler Tek Sayfa Birleşimi**:
  - Sidebar üzerindeki ayrı "Odağım" ve "Rutinler" bağlantıları kaldırılarak tek bir "Liste" butonu altında birleştirildi.
  - Görev listesi içerisine (ListView) yerleştirilen şık, glassmorphic sekme değiştirici (`.todo-tabs`) ile Odağım (Focus) ve Rutinler (Routines) görevleri arasında tek sayfa içinde butonla geçiş yapılması sağlandı.

### Değişti
- **Notlar Sayfası Arayüz İyileştirmesi**:
  - Notlar ekranındaki yan yana bitişik duran ve aynı renk olan butonlar ayrıştırılarak görsel hiyerarşi kazandırıldı.
  - "Yeni Not" butonu ana eylem olarak dolu mor arka planla (`.primary`), "Yeni Söz" butonu ise ikincil eylem olarak yarı saydam outlinesız buzlu cam tarzıyla (`.secondary`) tasarlandı, aralarındaki mesafe `12px` yapılarak ferahlatıldı.
- **Kişisel Disiplin Konumu**:
  - Sidebar üzerinde en altta duran "Kişisel Disiplin" (Willpower) bağlantısı, kullanıcının talebi üzerine "Pomodoro" sayacının hemen altına taşındı.

### Düzeltildi
- **Boş Kanban Görünümü Bug'ı**:
  - Todo listesinde durumu (status) olmayan eski görevlerin Kanban tahtasında listelenmemesi hatası giderildi. Durumu tanımlanmamış tüm görevler varsayılan olarak "Yapılacak" (todo) kolonuna aktarılarak Kanban tahtasının dolması sağlandı.
- **Takvim Ekranı Hizalama Bozulması**:
  - Namaz vakitlerinin Calendar görünümünde yan tarafta düzgün listelenememesi sebebiyle bozulan ekran yapısı düzeltildi.
  - Takvim sayfası modülü, kendi içinde `.split-view-container` yapısına alınarak sol panele yerel ve daha kompakt olan bir Ezan Vakitleri widget'ı (`<PrayerView compact={true} />`) eklendi.
  - `.calendar-container` sınıfına `flex: 1` ve `min-width: 0` özellikleri eklenerek takvim kartının ekran genişliğini dinamik doldurması sağlandı.

---

## [2.1.0] - 2026-07-11
### Eklendi
- **Modüler CSS Yapısı (Clean Code & Architecture)**:
  - Eski monolitik ve ardışık `part_1.css` - `part_12.css` dosyaları tamamen kaldırılarak bileşen bazlı CSS dosyaları oluşturuldu:
    - `base.css` (Değişkenler, scroll, resetler, modal drawer, animasyonlar)
    - `sidebar.css` (Navigasyon menüsü stilleri)
    - `tasks.css` (Görevler, listeler ve Kanban panosu)
    - `notes.css` (Not defteri kartları ve editör)
    - `pomodoro.css` (SVG halkası, stopwatch, alarm)
    - `willpower.css` (Kişisel disiplin sayacı ve geçmiş rütbeleri)
    - `hifiz.css` (Ezber sayfaları ve Mushaf modalı)
    - `srs.css` (Aralıklı tekrar kelime kartı çevirme animasyonu)
    - `calendar.css` (Aylık takvim gridi ve gün detayları)
    - `prayer.css` (Ezan vakitleri widget'ı)
    - `kpss.css` (Konu listeleri ve grafikler)
    - `free-games.css` (Fırsat kartları ve arama kutusu)
  - `src/newtab.css` dosyası yeni modüler dosyaları çağıracak şekilde güncellendi.
  - `.agents/AGENTS.md` içerisindeki CSS kuralları yeni modüler tasarıma göre güncellendi.

### Düzeltildi
- **Yeni Görev Ekleme Barı Hizalama Hatası**:
  - Görev ekleme barının (`.top-header`) container transform animasyonlarından etkilenerek aşağı kayması ve "Bugünkü odağın nedir?" kartıyla çakışması engellendi.
  - Giriş barı en üst katmana (`App.tsx` seviyesine) taşınarak ekranın en üstündeki sabit yerinde kusursuzca başlaması sağlandı.
  - Sadece görev listesi aktifken render edilmesi sağlandı.
  - `SrsView.tsx` içerisindeki tüm gömülü inline stiller ve `<style>` blokları `srs.css` dosyasına taşınarak arayüz kodları Clean Code standartlarına kavuşturuldu.

---

## [2.0.0] - 2026-07-11
### Değişti
- **Vite + Preact + TypeScript (TSX) Göçü**:
  - Proje, eski HTML + JavaScript yapısından modern, tip güvenli ve performanslı **Vite + Preact + TSX** mimarisine taşındı.
  - Bileşen odaklı yapıya geçilerek tüm ekranlar [src/components/](file:///c:/GitHub/Done/chrome-extension/src/components) altında parçalara bölündü:
    - `App.tsx` (Global durum yönetimi, dil, yedekleme, saat-tarih ve navigasyon)
    - `Sidebar.tsx` (Buzlu cam tasarımlı menü)
    - `ListView.tsx` & `KanbanView.tsx` (Görevler ve rutinlerin listelendiği panolar)
    - `NotesView.tsx` (Notlar ve özlü söz ekleme arayüzü)
    - `PomodoroView.tsx` (Odaklanma sayacı, kronometre ve alarm paneli)
    - `WillpowerView.tsx` (Kişisel disiplin sayacı paneli)
    - `HifizView.tsx` (Ezber takip ve yeterlilik checklisti paneli)
    - `SrsView.tsx` (Aralıklı tekrar kelime kartı paneli)
    - `CalendarView.tsx` (Takvim üzerinde tamamlanan görevler)
    - `PrayerView.tsx` (Konuma göre ezan saatleri)
    - `KpssView.tsx` (KPSS konuları ve Canvas grafiği)
    - `FreeGamesView.tsx` (Ücretsiz oyun takibi ve arama paneli)
  - Derleyici altyapısı olarak Vite entegre edildi (`vite.config.ts` ve `tsconfig.json`).
  - Derleme sonrası manifest ve veri klasörlerini kopyalayan `postbuild.js` yazıldı.

### Silindi
- Kullanımı sona eren tüm eski monolitik yapılar ve DOM manipülasyon dosyaları kaldırıldı:
  - `src/newtab.html`, `src/newtab.ts`, `src/render.ts`, `build.js`
  - `src/ui/` altındaki `dom.ts`, `sidebar.ts`, `hifizRender.ts`, `prayerView.ts`, `srsView.ts`
  - `src/features/` altındaki el ile buton yöneten `willpower.ts`, `hifiz.ts`, `pomodoro.ts` vb. mantıksal event bağlayıcılar.

---

## [1.2.0] - 2026-07-10
### Eklendi
- **Kişisel Disiplin Takipçisi (Willpower Tracker)**:
  - Hassas terimler içermeyen, tamamen profesyonel motivasyonel unvanlara dayalı gizli bir kişisel disiplin/willpower sayacı eklendi.
  - Gün:Saat:Dakika:Saniye bazında gerçek zamanlı çalışan sayaç tasarlandı.
  - Başlangıç tarihi, en iyi derece (Best Streak) verileri ve sıfırlama geçmişi `chrome.storage.sync` ile buluta yedeklenecek şekilde bağlandı.
  - Sayaç gün sayısına göre değişen rütbe kademeleri (Initiate, Control, Warrior, Knight, Master vb.) ve özel rütbe açıklamaları i18n dil dosyalarına eklendi.

---

## [1.1.0] - 2026-07-08
### Eklendi
- **Ücretsiz Oyunlar & Fırsatlar Paneli (Free Games Tracker)**:
  - Steam, Epic Games, GOG, PC vb. platformlardaki aktif ücretsiz oyun ve fırsatları listeleyen yeni bir arayüz entegre edildi.
  - Veriler **GamerPower API** kullanılarak dinamik olarak çekilir.
  - API istek limitlerini aşmamak ve New Tab sayfasının anında yüklenmesini sağlamak için **15 dakikalık yerel önbellekleme (chrome.storage.local)** mekanizması kuruldu. Ağ kesintilerinde eski veriler otomatik yedek plan olarak yüklenir.
  - Platform bazlı (Steam, Epic Games, GOG, PC, Tümü) ve fırsat türü bazlı (Oyun, Loot/DLC, Beta Anahtarları) filtreleme seçenekleri eklendi.
  - Oyun platformlarına özel renklerde badge'ler ve premium hover animasyonları içeren modern kartlar tasarlandı.
- **İzin Güncellemeleri**:
  - API isteklerinin CORS engeline takılmaması için `manifest.json` dosyasına `"host_permissions": ["https://www.gamerpower.com/*"]` eklendi.
- **Yerelleştirme (i18n)**:
  - Oyun fırsatları paneline ait tüm filtre ve metin içerikleri Türkçe ve İngilizce dil dosyalarına eklendi.

---

## [1.0.0] - Ana Kararlı Sürüm (Milestone)
### Eklendi
- **Odaklanma Zamanlayıcısı (Pomodoro)**:
  - Focus, Short Break ve Long Break modları.
  - SVG tabanlı dairesel ilerleme çubuğu.
  - Kronometre (Stopwatch) ve alarm araçları.
- **Görev Yönetimi (To-Do & Kanban)**:
  - Günlük hedefler için "Odağım" listesi.
  - Rutin görevler için "Rutinler" listesi (Günlük, Haftalık, Aylık tekrarlama seçenekleriyle).
  - Kartları sürükle-bırak (Drag-and-Drop) veya sol/sağ butonlarla yönetmeyi sağlayan modern **Kanban Panosu**.
- **KPSS Hazırlık Modülü**:
  - Ders bazlı konu checklistleri (Türkçe, Matematik, Tarih, Coğrafya vb.).
  - Çalışılan soru adetlerini girmeyi ve takip etmeyi sağlayan veri giriş sistemi.
  - Çalışma geçmişini görselleştiren istatistik grafiği (Canvas tabanlı).
- **Hıfız ve Din Görevlisi Yeterlilikleri**:
  - Sure ve dua bazlı ezber seviye takibi (Temel / İleri).
  - Diyanet İmam-Hatip aday yeterlilik checklist'i.
  - Surelerin mushaf sayfalarını eklenti içinden görüntülemek için sayfa değiştiricili **Mushaf Resim Görüntüleyici Modülü**.
- **Notlar ve Motivasyon Sözleri**:
  - Kart şeklinde not alabilme, düzenleme ve renkli kategorize etme.
  - Rastgele ve kullanıcı tarafından özel eklenebilen özlü sözler / motivasyon havuzu.
- **Aralıklı Tekrar (Spaced Repetition - SRS)**:
  - Hatırlanması gereken kavramlar, kelimeler veya notlar için bilimsel aralıklı tekrar algoritması entegrasyonu.
- **Namaz Vakitleri**:
  - İstanbul (veya özel konum) için namaz vakitlerini API'den çekme ve o anki namaz vaktini otomatik vurgulayan dinamik countdown.
- **Takvim Paneli**:
  - Günlük etkinlikleri ve görevleri gün bazında modal ile listeleyen entegre takvim arayüzü.
- **Veri ve Dil Yönetimi**:
  - Tüm verileri tek tıklamayla JSON olarak yedekleme (Backup) ve yedekten yükleme (Restore).
  - Türkçe ve İngilizce dinamik dil desteği (i18n).
