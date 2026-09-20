# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin gelecekteki sürümlerinde hayata geçirilmesi planlanan yenilikçi özellikleri, mimari geliştirmeleri ve vizyoner modül önerilerini listeler.

> **Not:** Bu dosya yalnızca **henüz yapılmamış** işleri içerir. Tamamlanan maddeler kaldırılmıştır (git geçmişinden izlenebilir). Kısmen yapılmış özellikler yalnızca **kalan** işleriyle listelenir.

---

## 🗺️ Yaklaşan & Planlanan Özellikler (Upcoming Roadmap)

### 1. ⚡ AI Smart Goal Breakdown (Yapay Zeka Destekli Hedef & Alt Görev Parçalayıcı)
Büyük ve karmaşık hedefleri tek tıkla uygulanabilir mikro adımlara bölen akıllı görev asistanı.
- [ ] **Akıllı Parçalama Butonu**: Görev oluştururken `✨ AI ile Parçala` butonuna basıldığında büyük bir hedefi (örn. *"Godot ile 2D Platformer Yap"* veya *"KPSS Tarih İnkılapları Bitir"*) 4-6 somut alt göreve dönüştürme.
- [ ] **Zaman Tahmini & Önceliklendirme**: Her alt göreve otomatik tahmini süre ve Eisenhower matrisi öncelik seviyesi (Acil/Önemli) atama.
- [ ] **Tek Tıkla Listeye Ekleme**: Üretilen alt görevleri doğrudan yapılacaklar veya rutinler listesine aktarma.

---

### 2. 🎙️ Voice Memo to Structured Note (Sesli Not Kaydedici & AI Cornell Özetleyici)
Tarayıcı mikrofonu ile hızlı sesli düşünce kaydı ve otomatik yapılandırılmış not çıkarma.

> **Mevcut durum:** Side Panel'de Web Speech API ile sesli giriş zaten var (`src/sidepanel/sidePanelSpeech.ts`, `useVoiceInput.ts`). Aşağıdaki maddeler bu altyapının **Notlar ekranına** taşınması ve Cornell formatlayıcının **sıfırdan yazılması** işleridir. Cornell *not tipi* zaten mevcut (`cornell-mini-grid`), ancak ses → Cornell dönüşümü yoktur.

- [ ] **Notes Ekranında Ses Kaydı**: Notlar ekranında tek tıkla ses kaydı başlatma (`🎙️ Sesli Not`) — mevcut yalnızca Side Panel'de.
- [ ] **Web Audio API Ses Kaydı**: Ham ses kaydını (MediaRecorder) saklama; şu an yalnızca canlı konuşma→metin var, ses dosyası tutulmuyor.
- [ ] **AI Cornell Formatlayıcı**: Ham ses transkriptini otomatik olarak *"Anahtar Kavramlar"*, *"Özet"* ve *"Aksiyon Maddeleri"* şeklinde Cornell ders notu kartına dönüştürme.

---

### 3. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard (Göz ve Duruş Dinlendirme)
Uzun ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 20 feet (6 metre) uzağa bakmayı hatırlatan zarif mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında basit omuz, boyun ve sırt esneme egzersizi animasyonları sunma.
- [ ] **Akıllı Seans İstatistiği**: Günlük kaç mikro mola verildiğini ve ekran dinlenme süresini takip etme.

---

### 4. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi (Dividend Tracker)
Borsa portföyündeki şirketlerin nakit temettü ve bedelsiz pay dağıtım tarihlerini takip eden finansal takvim.

> **Mevcut durum:** Yalnızca kullanıcının kendi oluşturduğu metin isimli takip listeleri var (örn. "Temettü" adlı liste). Otomatik temettü verisi/takvimi yoktur.

- [ ] **Otomatik Hakediş Takvimi**: Portföyünüzdeki ve izleme listenizdeki şirketlerin kesinleşen temettü ödeme tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Sahip olunan lot sayısına göre tahmini yıllık net temettü getirisini TL olarak hesaplama.
- [ ] **Bedelsiz Sermaye Bildirimi**: Portföydeki hisselerin bedelsiz bölünme günlerini ve yeni oluşacak tahmini lot adedini özetleme.

---

### 5. 🎵 Multi-Channel Ambient Soundscapes Mixer (Özel Ambiyans Sentezleyici)
Çevrimdışı Web Audio API sentezleyicilerini çok kanallı bir ses mikserinde birleştirme.

> **Mevcut durum:** Tek kanallı prosedürel sentezleyici mevcut (`ambientAudioService.ts`: yağmur, rüzgar, fön, LoFi). Ancak her `play*` çağrısı `stopAllSounds()` ile öncekini durdurur → **eşzamanlı katmanlama yoktur**. Kalan iş aşağıdadır.

- [ ] **Eşzamanlı Ses Katmanlama**: Yağmur, Rüzgar, Lo-Fi Piyano Akorları ve Beyaz Gürültüyü aynı anda çalarak özel ambiyans oluşturma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*) — mevcut motor `stopAllSounds()` nedeniyle tek kaynaklıdır.
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Her bir ses kaynağının desibel ve frekans seviyesini bağımsız dairesel slider'lar ile ayarlama (şu an tek global `volume` var).
- [ ] **Önceden Kayıtlı Hazır Profiller (Presets)**: Hızlı odaklanma modları arasında tek tıkla geçiş yapabilme.

---

### 6. 📊 Teknik İndikatör & Sinyal Motoru — Kullanıcı Arayüzü (RSI, EMA 20/50, MACD)
BIST hisselerinde teknik analiz göstergelerini hesaplayıp yapay zeka analizine besleyen kurallar motoru.

> **Mevcut durum:** Hesaplama katmanı kısmen hazır — `computeStockTelemetry()` (`src/services/stock/stockPrompts.ts`) **RSI(14)**, **SMA-20** ve **hacim oranı** hesaplayıp AI prompt'una besliyor (`stockAiService.ts`). Ancak **kullanıcıya gösterilen bir sinyal arayüzü yok**, `RSI_OVERBOUGHT` kural tipi tanımlı olmasına rağmen hiçbir yerde kullanılmıyor, EMA/MACD hiç yok. Kalan iş aşağıdadır.

- [ ] **RSI Sinyal Arayüzü**: RSI 30 altı / 70 üstü durumunu UI'da *"Aşırı Satım"* / *"Aşırı Alım"* rozeti olarak gösterme. `RSI_OVERBOUGHT` kural tipini gerçekten çalıştırma (şu an tanımlı ama ölü).
- [ ] **EMA 20/50 & Golden Cross / Death Cross**: Mevcut yalnızca **basit** 20 günlük ortalama (SMA-20) var; EMA ve kesişim tespiti yok.
- [ ] **MACD Göstergesi**: Momentum göstergesi hiç hesaplanmıyor.
- [ ] **Hacim Sıçraması Uyarısı**: Hacim oranı hesaplanıyor ama 3x eşiğinde uyarı üreten bir tetik yok.
- [ ] **Gösterge Panosu (Chart Overlay)**: Fiyat grafiği üzerine RSI / ortalama çizgilerinin bindirilmesi.

---

### 7. 🌐 Offline Multi-Device P2P WebRTC Sync (Sunucusuz Cihazlar Arası Eşitleme)
Harici üçüncü taraf sunucu veya bulut kullanmadan, iki bilgisayar arasında yerel ağ üzerinden şifreli doğrudan veri aktarımı.
- [ ] **QR Kod / Peer Eşleşme**: Evdeki laptop ve masaüstü bilgisayar arasında WebRTC DataChannel ile tek tıkla P2P eşitleme.
- [ ] **Uçtan Uca Şifreleme (E2EE)**: AES-GCM 256-bit şifreleme ile görev, not ve borsa verilerinin sıfır bilgi prensibiyle aktarımı.

---

### 8. 🎮 Game Jam Countdown & Asset Pack Bundler (Game Jam & Proje Başlatıcı)
Indie oyun geliştiricileri için yaklaşan Game Jam'leri takip etme ve hızlı başlangıç şablonu oluşturma.

> **Mevcut durum:** Ücretsiz oyun **asset** toplayıcısı zaten var (`gameAssetsService.ts` → Itch.io, Kenney.nl, OpenGameArt, GamerPower). Ancak Game Jam takvimi, tema beyin fırtınası ve toplu indirme **yoktur**.

- [ ] **Itch.io Game Jam Takvimi**: Popüler game jam'lerin başlangıç ve bitiş tarihlerini listeleyen canlı sayaç — **hiç yok**, mevcut yalnızca asset listeleme.
- [ ] **Tema Beyin Fırtınası**: Jam teması açıklandığında AI ile 3 farklı oyun mekaniği ve prototip fikri türetme.
- [ ] **Seçili Asset Paketi İndirici**: Ücretsiz oyun assetleri sayfasından seçilen paketleri tek tıkla zip listesi haline getirme — mevcut servis yalnızca listeler, **toplu indirme/zip paketleme yok**.

---

### 9. 📑 Akıllı Sekme Gruplama & RAM Tasarrufu (Smart Tab Suspender)
Tarayıcıda biriken sekmeleri yapay zeka ile organize edip inaktif sekmeleri uyutma.

> **Mevcut durum:** `runtimeMessageHandler.ts` içinde `chrome.tabs.group()` ile **yalnızca Life OS Agent'ın açtığı sekmeler** tek grup halinde toplanıyor. Kullanıcının genel sekmelerini organize eden veya bellek boşaltan bir mantık **yoktur**.

- [ ] **AI Kategori Gruplama**: Açık 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* sekmelerine otomatik gruplama.
- [ ] **Bellek Uyutucu**: 30 dakikadan uzun süre kullanılmayan sekmeleri dondurarak Chrome bellek ve CPU kullanımını azaltma (`chrome.tabs.discard` / `autoDiscardable` entegrasyonu).
