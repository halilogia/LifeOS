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

### 6. 📈 Dynamic KPSS Score Predictor & Smart Analytics (Yapay Zeka Destekli KPSS Puan Tahmincisi)
Leverage placement quiz history to project real-world exam targets.
- [ ] **Score Projection**: AI-driven statistical modeling of quiz scores to estimate potential KPSS scores.
- [ ] **Weakness Analysis**: Automatically highlights topics with scores below 60% and suggests optimized study lists.

---

## 🎯 BIST Borsa İstanbul Odaklı Yaklaşan Özellikler (Stock Roadmap)

### 1. 🔔 KAP Haber Taraması & AI Duygu Analizi (KAP News & AI Sentiment)
Takipteki BIST hisselerinin Kamuyu Aydınlatma Platformu (KAP) duyurularını anlık tarama ve yapay zeka ile analiz etme.
- [ ] **KAP Canlı Akış Servisi**: Takip edilen hisselerin yeni KAP bildirimi düştüğünde arkaplanda masaüstü uyarısı verme.
- [ ] **AI Haber Puanlaması**: AI'ın KAP haberini okuyup (Örn: Yeni İş Anlaşması, Bedelsiz Sermaye Artırımı) haber için "Olumlu (+2)", "Nötr" veya "Olumsuz (-2)" puan çıkarması.

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

## ✅ Completed Features Archive (Tamamlanan Özellikler Arşivi)
- **BIST Automated Stock Management & Strategy Engine**: Full BIST & IPO portfolio monitoring, red candle alerts, tavan break rules, stop-loss, take-profit, trailing stop, background chrome alarms, desktop notifications, and Ollama/OpenRouter AI market advisor.
- **Universal Extension-wide Localization**: Full translation dictionary support for English and Turkish across all sub-panels, charts, and settings.
- **Extensible Fallback Proxy Localization**: Automatic fallback to English dictionary translation keys using ES6 Proxy architecture.
- **Clean Architecture & Layout Assembly Refactoring for Popup Module**: Isolated presentation layouts from logic via `usePopup.ts` hooks and split popup views into dedicated sub-components (`PopupPomoTab.tsx` and `PopupDetoxTab.tsx`).
- **Zero compile and lint error tolerance hardening**: Fixed all TypeScript and ESLint problems to ensure the codebase runs with absolute 0 compiler errors and 0 linter violations.
- **ÖSYM KPSS Past Exams & Practice Room**: Integrated actual 2009-2021 KPSS exams for practice with dynamic count calculation.
- **KPSS Soru Sistemi Değişim Milatları (Evolution Guide)**: Localized timeline info button overlay showing critical ÖSYM reform milestones.
- **Custom Glassmorphic Date Picker**: Replaced the native browser calendar input with a dark glass popover dropdown (`DatePicker.tsx`).
- **Web Audio API Ambient Sound Synthesis**: Implemented offline wind LFO sweeps, rain droplet pitter-patter click synthesis, and Rhodes lofi piano chords.
- **KPSS Subject Auto-Scheduling Planner**: Dividing topics into calendars dynamically based on exam date and completion status.
- **Lock Screen & Soft Alert Social Detox Limits**: Custom warning alerts on active tabs and lock redirection redirects.
- **Rich Markdown Support for Notes & Cornell Notes**: Double-click note cards inline editors and safe Markdown formatting parser.
- **Local AI Assistant & Page Summarizer**: Connects to local 9Router API with host permissions and offline JSON filters.
- **Active Focus Mode Site Blocker (Detox Blocker)**: Blocks social media channels during focus sessions with deep MutationObserver blockers and local storage sync.
- **KPSS Spaced Repetition (SRS)**: Spaced Repetition (SM2) flashcard algorithms and card flipping layout.
- **Unified Eisenhower Matrix & Kanban Board view**: Merged Kanban board and Eisenhower matrix under a unified sidebar menu button.
- **KPSS Target Tuning & Goal Types**: Settings page integration of score/net targets.
- **Daily Screen Time Tracker & Capping**: Track domain spent times and filter out sleep/lock hours.
