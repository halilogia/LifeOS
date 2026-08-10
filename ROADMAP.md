# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

This document tracks the upcoming features, architectural improvements, and experimental integrations planned for the **Life OS - Personal Dashboard** Chrome Extension.

---

## 🗺️ Upcoming Features (Yaklaşan Özellikler)

### 1. 📊 Daily Routine Heatmap Streak (Alışkanlık Zinciri Takvim Izgarası)
Visualize your routine completion consistency with an interactive calendar widget.
- [ ] **Contribution Grid**: A GitHub-style yearly/monthly contribution grid showing green intensity based on the percentage of routines ticked off each day.
- [ ] **Streak Counters**: Live counts of consecutive days routines were fully completed, with fire particle micro-animations on hit milestones.

### 2. 🧠 SRS Custom Flashcards Deck Builder (Özel Aralıklı Tekrar Kart Oluşturucu)
Allow users to write and structure their own spaced repetition vocabulary learning decks.
- [ ] **Deck Creator**: Forms to add front/back content cards, choose custom deck categories (e.g. English, KPSS history, programming).
- [ ] **Deck Importer**: Import csv/json format flashcard sheets easily.

### 3. 🎵 AI-Enhanced Ambient Sound Mixer (Yapay Zeka Destekli Odak Sesleri Mikseri)
Design and mix your own focus soundscapes.
- [ ] **Multi-Voice Mixer**: Play synthesized Wind, Rain, Hairdryer, and Lo-Fi chords simultaneously to create custom soundscapes (e.g. "Rainy Cafe", "Winter Cabin").
- [ ] **Individual Volume Sliders**: Control each synthesized sound's level independently to fine-tune the ambient background.

### 4. 🎯 Interactive Daily Willpower & Mood Analytics (Günlük İrade ve Disiplin Analitiği)
Visualize and track self-discipline metrics.
- [ ] **Mood Check-ins**: Daily logs to record mood and focus levels.
- [ ] **Willpower Streaks**: Track routine compliance, Pomodoro sessions, and detox successes in a unified productivity score graph.

### 5. 🌐 Interactive Smart Web Clipboard & Universal Info Box (Akıllı Web Not Panosu)
A lightweight widget to capture content across the web.
- [ ] **Floating Widget**: Keyboard-triggered floating glassmorphic popup that overlays on any website.
- [ ] **Quick Capture**: Instantly save highlighted webpage text directly to notes or add tasks to the dashboard without opening the New Tab page.

### 7. 🕹️ Life OS Arcade & Indie Dev Game Hub (Oyun Kütüphanesi & Dev Hub)

Unified indie game showcase, HTML5 arcade player, and Steam-style developer laboratory.
- [x] **YouTube Playables & Steam Hybrid Hub**: Glassmorphic visual gallery cards, embedded canvas games (Snake, Knight Runner, Space Shooter), and dev logs (v4.0.0).
- [ ] **Game Achievement Engine (Başarım Sistemi)**: Custom unlockable achievement badges for built-in and local indie games.
- [ ] **Local Dev Server Ping Detector**: Automatically pinging `http://localhost:5173`, `3000`, `8080` ports to display a live "Dev Server Ready" indicator.

---


## 🎯 BIST Borsa İstanbul Odaklı Yaklaşan Özellikler (Stock Roadmap)

### 1. 💰 Nakit & Toplam Varlık Takibi (Mal Varlığım) — ✅ TAMAMLANDI (v4.1.0)
- [x] **Nakit Bakiyesi**: Manuel ekleme, hisse alımında otomatik düşme, satışında otomatik eklenme (sync'te).
- [x] **Toplam Varlık**: Nakit + hisse değeri kırılımı özet kartı.
- [x] **Varlık Dağılımı Pasta Grafiği**: Cyberpunk SVG grafik — Toplam Varlık kartından açılır.
- [x] **Satış Geçmişi**: Gerçekleşen K/Z + tarih kaydı + toplam özet.
- [ ] **Döviz & Kripto Desteği**: Nakit gibi USD/EUR/BTC bakiyesi ekleme (Toplam Varlık'a dahil).

### 2. 📊 Teknik İndikatör Sinyal Motoru (RSI, EMA 20/50, MACD)
Gelişmiş teknik indikatör kuralları tanımlama.
- [ ] **RSI Aşırı Alım/Satım Alarmları**: RSI 14 periyodu 30 altına inince "Aşırı Satım (Alım Fırsatı)", 70 üstüne çıkınca "Aşırı Alım (Kar Al)" uyarısı.
- [ ] **Golden Cross / Death Cross Sinyalleri**: EMA 20 hareketli ortalamanın EMA 50 ortalamasını yukarı kesmesi durumunda yükseliş sinyali üretme.

### 3. 📈 Hacim Sıçraması ve Ani Volatilite Tespiti (Volume & Spike Detector)
- [ ] **Hacim Sıçraması:** Dakikalık hacim ortalamanın 3 katına çıktığında balina hareketi uyarısı atma.
- [ ] **Sektörel Portföy Gruplama:** Hisseleri "Halka Arzlar", "Temettü Hisseleri", "Teknoloji" şeklinde kategorilere ayırma.

---

## 📈 Long-Term Backlog (Uzun Vadeli Planlar)
- [ ] **Visual Theme Engine**: Custom wallpaper uploads and glassmorphic blur opacity sliders.
- [ ] **Cloud Sync Adapters**: WebDAV or Google Drive remote sync options in addition to `chrome.storage.sync`.

---

## 🔮 Gelecek Yol Haritası & Planlanan Özellikler (Roadmap)

1. **🔮 Wikipedia Tarzı Popover Önizleme Kartları (Hover Cards)**: Fareyle `[[Wikilink]]` bağlantısı üzerine gelindiğinde tıklamadan o notun görselini ve ilk 2 cümlesini gösteren minik önizleme penceresi.
2. **🤖 Nota Özel AI Soru & Flashcard Üretici (`✨ AI Soru Üret`)**: Ders notunu okurken tek tıkla o nottan 3 KPSS test sorusu veya Spaced Repetition (SRS) bilgi kartı ürettirme.
3. **💡 KPSS Akrostiş & Şifre Kutusu (Mnemonics Box)**: Infobox içerisine konunun meşhur KPSS hafıza kodlamalarını (Örn. *ZADEM*) gösteren özel mor renkli akrostiş kutusu.
4. **🕸️ Gelişmiş Konu İlişki Haritası (Graph View)**: Notların kategorilerine göre (Coğrafya, Tarih vb.) otomatik renk gruplaması ve görsel Obsidian Zettelkasten ilişki ağı.
5. **🔥 ÖSYM Çıkma Sıklığı Rozeti (Exam Relevance Score)**: Infobox'ın en üstüne konunun ÖSYM sınavlarında çıkma ağırlığını gösteren derlenmiş gösterge (`🔥🔥🔥 ÖSYM Favorisi`).
6. **🎧 Sesli Not Dinleme (Text-to-Speech Reader)**: Web Speech API altyapısıyla ders notlarını yolda/otobüste sesli dinleme butonu (`▶️ Dinle`).

---
---
**📝 Merged from suggestion.md**
# 🚀 ZenTodo / Life OS - Gelecek Geliştirme & İnovasyon Önerileri (`SUGGESTION.md`)

Bu doküman, **ZenTodo / Life OS Chrome Extension** projesinin gelecekteki sürümlerinde eklentiyi sıradan bir eklentiden **"Dünyanın En Gelişmiş Yapay Zeka Destekli Kişisel Yaşam & Finans İşletim Sistemine"** dönüştürecek vizyoner fikirleri ve teknik önerileri içerir.

---

## 📌 İçindekiler
1. 🏛️ [BİST & Halka Arz OS (Yeni Nesil AI Borsa İnovasyonları)](#1-bist--halka-arz-os-yeni-nesil-ai-borsa-inovasyonları)
2. 🤖 [9Router & Yerel AI Güçlendirmeleri (Local LLM Power Tools)](#2-9router--yerel-ai-güçlendirmeleri-local-llm-power-tools)
3. ⚡ [Yaşam OS & Üretkenlik İnovasyonları](#3-yaşam-os--üretkenlik-inovasyonları)
4. 🛠️ [Önceliklendirme & Yol Haritası Önerisi](#4-önceliklendirme--yol-haritası-önerisi)

---

## 🏛️ 1. BİST & Halka Arz OS (Yeni Nesil AI Borsa İnovasyonları)

### 1.1 📈 RSI / MACD / MA Teknik Gösterge Veri Motoru (Technical Indicators Engine)
* **Fikir**: 30 günlük mum verilerinden RSI (Relative Strength Index), MACD osilatörü ve 20/50 günlük Hareketli Ortalamaları (MA) otomatik hesaplayarak AI promptuna besleme.
* **Katma Değer**: Yapay zekanın "RSI 72 seviyesinde aşırı alım bölgesinde, 20 günlük MA üzerinde seyrediyor" şeklinde profesyonel teknik analiz üretmesini sağlar.

### 1.2 🌅 Sabah BİST Açılış AI Strateji Raporu (Morning Market Brief)
* **Fikir**: Her sabah saat 09:45'te (BİST açılışından 15 dakika önce) takip listenizdeki hisseler ve gece yayınlanan KAP haberlerine göre kişiselleştirilmiş 3 maddelik **Sabah Açılış Stratejisi**.
* **Katma Değer**: Güne başlamadan seansın olası yönünü ve riskli bölgeleri saniyeler içinde özetler.

### 1.3 💰 Temettü & Bedelsiz Sermaye Artırımı Takvimi (Dividend & Corporate Action Tracker)
* **Fikir**: Takip ettiğiniz şirketlerin nakit kâr payı (temettü) dağıtım tarihlerini, hisse başına ödeme tutarlarını ve bedelsiz sermaye artırımı tarihlerini gösteren akıllı takvim.
* **Katma Değer**: Portföyünüzün yıllık **Pasif Gelir Projeksiyonunu** (Örn: *Yıllık Tahmini Temettü: 12.450 ₺*) hesaplar.

### 1.4 📊 BİST Sektörel Isı Haritası & Korelasyon Matrisi (Sector Treemap)
* **Fikir**: Portföyünüzü ve BİST'i sektörel dağılımına (Havacılık, Bankacılık, Gayrimenkul, Teknoloji) göre renkli kutucuklar halinde görselleştirme.
* **Katma Değer**: Hangi sektöre para girişi olduğunu ve tek bir sektöre aşırı yüklenip yüklenmediğinizi görsel ikaz eder.

### 1.5 📢 Telegram Bot & Webhook Akıllı Alarmları
* **Fikir**: Tarayıcı kapalıyken bile fiyat alarmlarınız (Stop-Loss, Kar-Al veya Hedef Fiyat) tetiklendiğinde **Telegram Botunuza** anında bildirim ve AI analiz özeti gönderme.

---

## 🤖 2. 9Router & Yerel AI Güçlendirmeleri (Local LLM Power Tools)

### 2.1 🎙️ Sesli AI Asistan & Komut Motoru (Voice Commands)
* **Fikir**: Eklenti içinde mikrofona basarak "THYAO alarmlarımı göster", "KPSS Matematik timer'ımı 25 dakika başlat" gibi Türkçe sesli komutlarla eklentiyi yönetme.
* **Teknik Yaklaşım**: Web Speech API + 9Router Intent Parser.

### 2.2 📓 AI Gece Değerlendirme Raporu (Evening AI Debrief)
* **Fikir**: Her akşam saat 22:00'de gün içinde tamamladığınız görevleri, disiplin sürenizi ve borsa portföy hareketlerinizi özetleyen kişiselleştirilmiş 3 maddelik **AI Gece Raporu**.

### 2.3 👁️ Görsel RAG & Ekran Okuma (Vision AI Integration)
* **Fikir**: 9Router / Gemini Vision modellerini kullanarak ekrandaki karmaşık borsa grafiklerini veya KPSS soru görsellerini taratıp anında adım adım çözüm/yorum alma.

---

## ⚡ 3. Yaşam OS & Üretkenlik İnovasyonları

### 3.1 🏆 Oyunlaştırma & Seviye Sistemi (Life OS Gamification & Badges)
* **Fikir**: Tamamlanan her görev, korunan disiplin süresi ve çözülen KPSS soruları için XP kazanarak seviye atlama (`Level 1 Acemi` ➔ `Level 50 Usta`).

### 3.2 📑 Akıllı Sekme Gruplama & RAM Tasarrufu (Smart Tab Grouping & Suspender)
* **Fikir**: Tarayıcınızda biriken 50+ sekmeyi AI ile konularına göre (Borsa, KPSS, Haberler) otomatik gruplama ve inaktif sekmeleri uyutarak RAM tasarrufu sağlama.

### 3.4 📚 KPSS Wiki Notlarından Otomatik AI Flashcard & Test Üretimi
* **Fikir**: Vikipedi formatındaki ders notlarınızdan tek tıkla yapay zeka ile **KPSS Bilgi Kartı (SRS)** veya **Test Sorusu** türetme.
* **Katma Değer**: `Maki` veya `Çorum` ders notunu okurken "Kart Üret" butonuna basarak nottaki en kritik 5 soruyu otomatik SRS kart kutunuza ekler.

---
* **Fikir**: Eklentideki görevlerinizi ve hatırlatıcılarınızı doğrudan kişisel Google Takviminize işleme.

---

## 🛠️ 4. Önceliklendirme & Yol Haritası Önerisi

| Özellik | Zorluk / Süre | Etki / Değer | Önerilen Sürüm |
| :--- | :---: | :---: | :---: |
| **RSI / MACD / MA Teknik Gösterge Motoru** | Orta (2 Gün) | ⭐⭐⭐⭐⭐ | v1.3.0 |
| **Sabah BİST Açılış AI Raporu** | Kolay (1 Gün) | ⭐⭐⭐⭐⭐ | v1.3.0 |
| **Telegram Alarm Bildirim Botu** | Kolay (1-2 Gün) | ⭐⭐⭐⭐⭐ | v1.3.0 |
| **Temettü & Bedelsiz Takvimi** | Orta (2 Gün) | ⭐⭐⭐⭐ | v1.4.0 |
| **Portföy Sektör Isı Haritası** | Kolay (1 Gün) | ⭐⭐⭐⭐ | v1.4.0 |
| **Oyunlaştırma & Seviye Sistemi (XP)** | Orta (3 Gün) | ⭐⭐⭐⭐⭐ | v1.5.0 |
| **Sesli Komut Motoru (Voice OS)** | İleri (4 Gün) | ⭐⭐⭐⭐ | v2.0.0 |

---

## 🕹️ 5. Life OS Arcade & Oyun Geliştirme Laboratuvarı İnovasyonları


### 5.1 📡 Otomatik Yerel Dev Sunucu Tespiti (Port Auto-Scanner)
* **Fikir**: Eklenti açıkken arkaplanda `http://localhost:5173`, `3000`, `8080`, `5174` gibi popüler Vite / Next.js / React portlarını periyodik tarayarak yayında olan yerel oyunu otomatik tespit etme.
* **Katma Değer**: `C:\Users\emre_\Desktop\GitHub\In Progress` altında `npm run dev` yaptığınızda oyun kartında otomatik olarak yeşil canlı **"Dev Sunucusu Aktif 🟢"** ikazı belirir ve tek tıkla canlı teste geçilir.

### 5.2 🏆 Genel Başarım Engine & Rozet Sistemi (Game Achievements)
* **Fikir**: Gömülü oyunlarda ve yerel oyun projelerinizde elde edilen skorlara/tamamlanan to-do maddelerine göre eklenti genelinde kilit açan Steam tarzı koleksiyon rozetleri.
* **Katma Değer**: "Yılan Ustası", "Şövalye Katili", "Indie Dev Master" rozetleri ile oyun geliştirme motivasyonunu üst seviyeye taşır.

### 5.3 📸 Oyun İçi GIF & Ekran Görüntüsü Kaydedici (Game Screenshot & Clip Tool)
* **Fikir**: Modal oyuncuda oyun oynarken veya geliştirirken tek tıkla HTML5 Canvas ekran görüntüsü veya 5 saniyelik GIF klip alabilme.
* **Katma Değer**: Oyun projelerinizin sosyal medya ve devlog paylaşımları için anında görsel içerik üretmenizi sağlar.

---

*Bu doküman ZenTodo / Life OS projesi geliştirme sürecinde ilham kaynağı ve vizyon belgesi olarak güncel tutulmaktadır.* 🚀

