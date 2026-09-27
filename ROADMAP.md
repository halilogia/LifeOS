# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin gelecekteki sürümlerinde hayata geçirilmesi planlanan yenilikçi özellikleri, mimari geliştirmeleri ve vizyoner modül önerilerini listeler.

> **Not:** Bu dosya yalnızca **henüz yapılmamış** işleri içerir. Tamamlanan maddeler kaldırılmıştır (git geçmişinden izlenebilir). Kısmen yapılmış özellikler yalnızca **kalan** işleriyle listelenir.

---

## 🧊 Kapsam Dondurma Kararı (Aktif)

Bu depo, feature-creep riski en yüksek projelerden biri olarak işaretlendi. **Aktif geliştirme yalnızca aşağıdaki iki özelliğe açıktır:**

1. **AI Smart Goal Breakdown** (§1)
2. **Offline Multi-Device P2P WebRTC Sync** (§2)

Bu kararın bağlayıcı kuralları:

- **Yeni modül/ekran eklenmeyecek.** Mevcut ekranlara eklenen küçük alanlar bu kararın kapsamı dışındadır.
- **Dondurulmuş özellikler (§3) listeden silinmez, "Beklemede" başlığı altına taşınır.** Yeni bir özellik bu listeye eklenirse, aynı anda hangi maddeden çıkarılacağı yazılmalıdır.
- **Ölü kod biriktirilmez.** Kullanılmayan tip, fonksiyon, çeviri anahtarı veya CSS kuralı eklendiği anda `tsc`/lint uyarısı olarak değil, kod incelemesinde reddedilir. (Bkz. `scripts/findDeadFiles.mjs` ve `scripts/i18nHealthCheck.mjs`.)
- **Yeni bağımlılık eklenmez.** Mevcut `dependencies` kümesi dondurulmuştur.

Bu kararı geri almak, ancak §1 ve §2'nin ikisi de tamamlandıktan sonra gündeme gelir.

---

## 🗺️ Aktif Özellikler (Açık)

### 1. ⚡ AI Smart Goal Breakdown (Yapay Zeka Destekli Hedef & Alt Görev Parçalayıcı)
Büyük ve karmaşık hedefleri tek tıkla uygulanabilir mikro adımlara bölen akıllı görev asistanı.
- [ ] **Akıllı Parçalama Butonu**: Görev oluştururken `✨ AI ile Parçala` butonuna basıldığında büyük bir hedefi (örn. *"Godot ile 2D Platformer Yap"* veya *"KPSS Tarih İnkılapları Bitir"*) 4-6 somut alt göreve dönüştürme.
- [ ] **Zaman Tahmini & Önceliklendirme**: Her alt göreve otomatik tahmini süre ve Eisenhower matrisi öncelik seviyesi (Acil/Önemli) atama.
- [ ] **Tek Tıkla Listeye Ekleme**: Üretilen alt görevleri doğrudan yapılacaklar veya rutinler listesine aktarma.

### 2. 🌐 Offline Multi-Device P2P WebRTC Sync (Sunucusuz Cihazlar Arası Eşitleme)
Harici üçüncü taraf sunucu veya bulut kullanmadan, iki bilgisayar arasında yerel ağ üzerinden şifreli doğrudan veri aktarımı.
- [ ] **QR Kod / Peer Eşleşme**: Evdeki laptop ve masaüstü bilgisayar arasında WebRTC DataChannel ile tek tıkla P2P eşitleme.
- [ ] **Uçtan Uca Şifreleme (E2EE)**: AES-GCM 256-bit şifreleme ile görev, not ve borsa verilerinin sıfır bilgi prensibiyle aktarımı.

---

## ⏸️ Beklemede (Donduruldu — Aktif Kapsam Dışı)

> Aşağıdakiler **silinmemiştir**, çünkü fikir değerlidir; ancak gerçekleştirilmeyecek veya iptal edilene kadar yeni kod yazılmayacaktır. Bir özellik ancak §1 ve §2 kapandıktan sonra geri alınabilir.

### 3. 🎙️ Voice Memo to Structured Note (Sesli Not Kaydedici & AI Cornell Özetleyici)
Tarayıcı mikrofonu ile hızlı sesli düşünce kaydı ve otomatik yapılandırılmış not çıkarma.

> **Mevcut durum:** Side Panel'de Web Speech API ile sesli giriş zaten var (`src/sidepanel/sidePanelSpeech.ts`, `useVoiceInput.ts`). Aşağıdaki maddeler bu altyapının **Notlar ekranına** taşınması ve Cornell formatlayıcının **sıfırdan yazılması** işleridir. Cornell *not tipi* zaten mevcut (`cornell-mini-grid`), ancak ses → Cornell dönüşümü yoktur.

- [ ] **Notes Ekranında Ses Kaydı**: Notlar ekranında tek tıkla ses kaydı başlatma (`🎙️ Sesli Not`) — mevcut yalnızca Side Panel'de.
- [ ] **Web Audio API Ses Kaydı**: Ham ses kaydını (MediaRecorder) saklama; şu an yalnızca canlı konuşma→metin var, ses dosyası tutulmuyor.
- [ ] **AI Cornell Formatlayıcı**: Ham ses transkriptini otomatik olarak *"Anahtar Kavramlar"*, *"Özet"* ve *"Aksiyon Maddeleri"* şeklinde Cornell ders notu kartına dönüştürme.

### 4. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard (Göz ve Duruş Dinlendirme)
Uzun ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 20 feet (6 metre) uzağa bakmayı hatırlatan zarif mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında basit omuz, boyun ve sırt esneme egzersizi animasyonları sunma.
- [ ] **Akıllı Seans İstatistiği**: Günlük kaç mikro mola verildiğini ve ekran dinlenme süresini takip etme.

### 5. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi (Dividend Tracker)
Borsa portföyündeki şirketlerin nakit temettü ve bedelsiz pay dağıtım tarihlerini takip eden finansal takvim.

> **Mevcut durum:** Yalnızca kullanıcının kendi oluşturduğu metin isimli takip listeleri var (örn. "Temettü" adlı liste). Otomatik temettü verisi/takvimi yoktur.

- [ ] **Otomatik Hakediş Takvimi**: Portföyünüzdeki ve izleme listenizdeki şirketlerin kesinleşen temettü ödeme tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Sahip olunan lot sayısına göre tahmini yıllık net temettü getirisini TL olarak hesaplama.
- [ ] **Bedelsiz Sermaye Bildirimi**: Portföydeki hisselerin bedelsiz bölünme günlerini ve yeni oluşacak tahmini lot adedini özetleme.

### 6. 🎵 Multi-Channel Ambient Soundscapes Mixer (Çok Kanallı Ambiyans)
Çevrimdışı Web Audio API sentezleyicilerini çok kanallı bir ses mikserinde birleştirme.

> **Mevcut durum:** Prosedürel sentezleyici katmanlı olarak yeniden yazıldı (`src/services/ambientAudio/`): saf DSP (`noiseSynthesis.ts`), ses grafikleri (`voices.ts`) ve yaşam döngüsü (`ambientAudioEngine.ts`) ayrı katmanlarda. `play(type, volume)` tek giriş noktasıdır ve ses türü→üretici eşlemesi `VOICE_FACTORIES` tablosunda yaşar. **Ancak motor hâlâ tek ses kaynağıdır** (`play()` önceki sesi susturur). Kalan iş:
- [ ] **Eşzamanlı Ses Katmanlama**: Birden fazla ses kaynağını aynı anda çalıştırma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*). `VoiceHandle` zaten teardown için gerekli tüm kaynakları topladığı için bu, motor katmanında çoklu slot yönetimi eklemekle sınırlıdır.
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Kanal başına seviye (mevcut `VoiceHandle.masterGain` bunun için ayrılmıştır).
- [ ] **Hazır Profiller (Presets)**.

### 7. 📊 Teknik İndikatör & Sinyal Motoru — Kullanıcı Arayüzü (RSI, EMA 20/50, MACD)
BIST hisselerinde teknik analiz göstergelerini hesaplayıp yapay zeka analizine besleyen kurallar motoru.

> **Mevcut durum:** Hesaplama katmanı kısmen hazır — `computeStockTelemetry()` (`src/services/stock/stockPrompts.ts`) **RSI(14)**, **SMA-20** ve **hacim oranı** hesaplayıp AI prompt'una besliyor (`stockAiService.ts`). `evaluateStockRules()` yalnızca kural motorunda uygulanan 7 koşulu değerlendirir; `RSI_OVERBOUGHT` gibi uygulanmayan bir kural tipi **tanımlı değildir** (ölü kod olarak kaldırıldı). Kalan iş:
- [ ] **RSI Sinyal Arayüzü**: RSI 30 altı / 70 üstü durumunu UI'da *"Aşırı Satım"* / *"Aşırı Alım"* rozeti olarak gösterme. Yeni bir kural tipi **eklenirse** `evaluateStockRules()` içinde karşılığı olan bir `case` ile birlikte gelmelidir.
- [ ] **EMA 20/50 & Golden Cross / Death Cross**: Mevcut yalnızca **basit** 20 günlük ortalama (SMA-20) var; EMA ve kesişim tespiti yok.
- [ ] **MACD Göstergesi**: Momentum göstergesi hiç hesaplanmıyor.
- [ ] **Hacim Sıçraması Uyarısı**: Hacim oranı hesaplanıyor ama 3x eşiğinde uyarı üreten bir tetik yok.
- [ ] **Gösterge Panosu (Chart Overlay)**: Fiyat grafiği üzerine RSI / ortalama çizgilerinin bindirilmesi.

### 8. 🎮 Game Jam Countdown & Asset Pack Bundler (Game Jam & Proje Başlatıcı)
Indie oyun geliştiricileri için yaklaşan Game Jam'leri takip etme ve hızlı başlangıç şablonu oluşturma.

> **Mevcut durum:** Ücretsiz oyun **asset** toplayıcısı zaten var (`gameAssetsService.ts` → Itch.io, Kenney.nl, OpenGameArt, GamerPower). Ancak Game Jam takvimi, tema beyin fırtınası ve toplu indirme **yoktur**.

- [ ] **Itch.io Game Jam Takvimi**: Popüler game jam'lerin başlangıç ve bitiş tarihlerini listeleyen canlı sayaç — **hiç yok**, mevcut yalnızca asset listeleme.
- [ ] **Tema Beyin Fırtınası**: Jam teması açıklandığında AI ile 3 farklı oyun mekaniği ve prototip fikri türetme.
- [ ] **Seçili Asset Paketi İndirici**: Seçilen paketleri tek tıkla zip listesi haline getirme — mevcut servis yalnızca listeler, **toplu indirme/zip paketleme yok**.

### 9. 📑 Akıllı Sekme Gruplama & RAM Tasarrufu (Smart Tab Suspender)
Tarayıcıda biriken sekmeleri yapay zeka ile organize edip inaktif sekmeleri uyutma.

> **Mevcut durum:** `runtimeMessageHandler.ts` içinde `chrome.tabs.group()` ile **yalnızca Life OS Agent'ın açtığı sekmeler** tek grup halinde toplanıyor. Kullanıcının genel sekmelerini organize eden veya bellek boşaltan bir mantık **yoktur**.

- [ ] **AI Kategori Gruplama**: Açık 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* sekmelerine otomatik gruplama.
- [ ] **Bellek Uyutucu**: 30 dakikadan uzun süre kullanılmayan sekmeleri dondurarak Chrome bellek ve CPU kullanımını azaltma (`chrome.tabs.discard` / `autoDiscardable` entegrasyonu).
