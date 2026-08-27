# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

Bu belge, **Life OS - Personal Dashboard** eklentisinin gelecekteki sürümlerinde hayata geçirilmesi planlanan yenilikçi özellikleri, mimari geliştirmeleri ve vizyoner modül önerilerini listeler.

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
- [ ] **Web Audio API Ses Kaydı**: Notlar ekranında tek tıkla ses kaydı başlatma (`🎙️ Sesli Not`).
- [ ] **Konuşmadan Metne (Speech-to-Text)**: Tarayıcının yerleşik Web Speech API'si ile sıfır harici kota tüketerek sesi metne dökme.
- [ ] **AI Cornell Formatlayıcı**: Ham ses transkriptini otomatik olarak *"Anahtar Kavramlar"*, *"Özet"* ve *"Aksiyon Maddeleri"* şeklinde Cornell ders notu kartına dönüştürme.

---

### 3. 🕸️ Interactive Knowledge Graph Visualizer (Zettelkasten Bilgi Grafı)
Obsidian tarzı, notlar ve KPSS konuları arasındaki `[[Wikilink]]` bağlantılarını gösteren 2D/3D interaktif ağ görselleştiricisi.
- [ ] **D3.js / Force-Directed Graph**: Notlar ve konular arasındaki çapraz referansları nodlar ve çizgiler halinde interaktif tuvalde çizme.
- [ ] **Kategori & Renk Gruplama**: Coğrafya, Tarih, Yazılım, Finans ve Kişisel notları farklı renk halkalarıyla gruplama.
- [ ] **Odak & Filtreleme**: Bir nota tıklandığında yalnızca o notla bağlantılı olan birinci ve ikinci derece komşuları aydınlatma.

---

### 4. 🧘 Mindful Micro-Breaks & 20-20-20 Eye Guard (Göz ve Duruş Dinlendirme)
Uzun ekran başı seanslarında göz yorgunluğunu ve duruş bozukluğunu engelleyen ergonomik asistan.
- [ ] **20-20-20 Kuralı Zamanlayıcısı**: Her 20 dakikada bir 20 saniye boyunca 20 feet (6 metre) uzağa bakmayı hatırlatan zarif mikro bildirim.
- [ ] **Esneme & Duruş Hatırlatıcıları**: Pomodoro uzun molalarında basit omuz, boyun ve sırt esneme egzersizi animasyonları sunma.
- [ ] **Akıllı Seans İstatistiği**: Günlük kaç mikro mola verildiğini ve ekran dinlenme süresini takip etme.

---

### 5. 💰 BİST Temettü & Bedelsiz Sermaye Artırımı Takvimi (Dividend Tracker)
Borsa portföyündeki şirketlerin nakit temettü ve bedelsiz pay dağıtım tarihlerini takip eden finansal takvim.
- [ ] **Otomatik Hakediş Takvimi**: Portföyünüzdeki ve izleme listenizdeki şirketlerin kesinleşen temettü ödeme tarihlerini takvime işleme.
- [ ] **Yıllık Pasif Gelir Projeksiyonu**: Sahip olunan lot sayısına göre tahmini yıllık net temettü getirisini TL olarak hesaplama.
- [ ] **Bedelsiz Sermaye Bildirimi**: Portföydeki hisselerin bedelsiz bölünme günlerini ve yeni oluşacak tahmini lot adedini özetleme.

---

### 6. 🎵 Multi-Channel Ambient Soundscapes Mixer (Özel Ambiyans Sentezleyici)
Çevrimdışı Web Audio API sentezleyicilerini çok kanallı bir ses mikserinde birleştirme.
- [ ] **Eşzamanlı Ses Katmanlama**: Yağmur, Rüzgar, Lo-Fi Piyano Akorları ve Beyaz Gürültüyü aynı anda çalarak özel ambiyans oluşturma (*"Fırtınalı Kütüphane"*, *"Kış Gecesi"*).
- [ ] **Bağımsız Kanal Ses Düğmeleri**: Her bir ses kaynağının desibel ve frekans seviyesini bağımsız dairesel slider'lar ile ayarlama.
- [ ] **Önceden Kayıtlı Hazır Profiller (Presets)**: Hızlı odaklanma modları arasında tek tıkla geçiş yapabilme.

---

### 7. 📊 Teknik İndikatör & Sinyal Motoru (RSI, EMA 20/50, MACD)
BIST hisselerinde teknik analiz göstergelerini hesaplayıp yapay zeka analizine besleyen kurallar motoru.
- [ ] **RSI 14 Aşırı Alım/Satım Dedektörü**: RSI değeri 30 altına indiğinde *"Aşırı Satım / Olası Dip"*, 70 üstüne çıktığında *"Aşırı Alım / Kâr Al"* göstergesi.
- [ ] **EMA Golden Cross / Death Cross Tespiti**: 20 günlük ortalamanın 50 günlüğü yukarı veya aşağı kesmesini otomatik yakalama.
- [ ] **Hacim Sıçraması Uyarısı**: Günlük işlem hacmi 30 günlük ortalamanın 3 katına çıktığında balina girişi ikazı.

---

### 8. 🌐 Offline Multi-Device P2P WebRTC Sync (Sunucusuz Cihazlar Arası Eşitleme)
Harici üçüncü taraf sunucu veya bulut kullanmadan, iki bilgisayar arasında yerel ağ üzerinden şifreli doğrudan veri aktarımı.
- [ ] **QR Kod / Peer Eşleşme**: Evdeki laptop ve masaüstü bilgisayar arasında WebRTC DataChannel ile tek tıkla P2P eşitleme.
- [ ] **Uçtan Uca Şifreleme (E2EE)**: AES-GCM 256-bit şifreleme ile görev, not ve borsa verilerinin sıfır bilgi prensibiyle aktarımı.

---

### 9. 🎮 Game Jam Countdown & Asset Pack Bundler (Game Jam & Proje Başlatıcı)
Indie oyun geliştiricileri için yaklaşan Game Jam'leri takip etme ve hızlı başlangıç şablonu oluşturma.
- [ ] **Itch.io Game Jam Takvimi**: Popüler game jam'lerin başlangıç ve bitiş tarihlerini listeleyen canlı sayaç.
- [ ] **Tema Beyin Fırtınası**: Jam teması açıklandığında AI ile 3 farklı oyun mekaniği ve prototip fikri türetme.
- [ ] **Seçili Asset Paketi İndirici**: Ücretsiz oyun assetleri sayfasından seçilen paketleri tek tıkla zip listesi haline getirme.

---

### 10. 📑 Akıllı Sekme Gruplama & RAM Tasarrufu (Smart Tab Suspender)
Tarayıcıda biriken sekmeleri yapay zeka ile organize edip inaktif sekmeleri uyutma.
- [ ] **AI Kategori Gruplama**: Açık 30+ sekmeyi *"Borsa & Finans"*, *"KPSS & Çalışma"*, *"Oyun Geliştirme"* sekmelerine otomatik gruplama.
- [ ] **Bellek Uyutucu**: 30 dakikadan uzun süre kullanılmayan sekmeleri dondurarak Chrome bellek ve CPU kullanımını %60 azaltma.
