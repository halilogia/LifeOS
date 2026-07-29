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

### 6. 📚 Wikipedia-Style KPSS Knowledge Studio & Wikilink Graph
Modular study note archiving with cross-note Wikilinks, Backlinks, and dynamic Infobox.
- [ ] **In-Article Search & Keyword Highlight**: Real-time `Ctrl+F` text search bar inside long study notes.

---

## 🎯 BIST Borsa İstanbul Odaklı Yaklaşan Özellikler (Stock Roadmap)

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