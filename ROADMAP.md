# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

This document tracks the upcoming features, architectural improvements, and experimental integrations planned for the **Life OS - Personal Dashboard** Chrome Extension.

---

## 🗺️ Upcoming Features (Yaklaşan Özellikler)

### 1. 🤖 Local AI Assistant & Page Summarizer (9Router & OpenAI Uyumlu Yerel Yapay Zeka)
Bring private, offline Artificial Intelligence to the browser sidebar using local LLMs.
- [x] **Local API Bridge**: Established secure connection to local 9Router instance (`http://localhost:20128/v1`) with host permissions configured.
- [x] **UI Sidebar / Panel**: Introduced AI Assistant chat panel inside the extension dashboard for summaries, translation, and task creation.
- [x] **Offline-Friendly**: Custom JSON cleaning filters to strip markdown code blocks and remove strict response_format parameters for maximum local proxy compatibility.
- [ ] **Context Fetcher**: Read active tab DOM layout text to pipe clean contents into prompt contexts.

### 2. 📊 Daily Habit Tracker & Analytics (Alışkanlık Takibi ve Analiz)
Visualize daily consistency and habits with glassmorphic stats.
- [ ] **Consistency Grid**: A GitHub-style contribution grid to track completed routines and habits.
- [ ] **Focus Charts**: Monthly/weekly Pomodoro session distribution graphs using Canvas.

### 3. 🔒 Active Focus Mode Site Blocker (Odak Bloke Sistemi)
Minimize distractions while studying or during Pomodoro sessions.
- [ ] **Dynamic Ruleset**: Block pre-selected social media sites dynamically only when a Pomodoro timer is actively running.
- [ ] **Lock Screen**: Show a motivational quote lock page when attempting to access blocked sites.

### 4. 🎵 Ambient Noise & Lo-Fi Player (Odak Müzikleri)
Integrated audio player directly within the sidebar for study sessions.
- [ ] **Built-in Soundscapes**: Rain, café chatter, forest wind, and white noise generator.
- [ ] **Lo-Fi Stream**: Streaming internet radio widget for instrumental focus beats.

### 5. 📚 KPSS Aralıklı Tekrar (SRS) Kart Veritabanı Entegrasyonu
KPSS Flashcards aralıklı tekrar sistemi için geniş bilgi kartı veritabanının eklentiye entegre edilmesi.
- [x] **SRS Kart Altyapısı**: Spaced Repetition (SM2) algoritmaları ve görsel kart çevirme animasyonu KPSS panelinde aktif edildi.
- [ ] **Kart Veritabanı**: Tarih, Coğrafya ve Vatandaşlık dersleri için kapsamlı bilgi kartı havuzunun (100+ kart) veritabanına yüklenmesi.

### 6. 📁 Projects & Nested Checklist (Alt Görevler ve Etiketler)
Expand task management capabilities for larger workflows.
- [ ] **Nested Steps**: Create checklists/sub-tasks inside single main tasks.
- [ ] **Tagging**: Add custom labels, colors, and priority badges to Kanban cards.

---

## 📈 Long-Term Backlog (Uzun Vadeli Planlar)
- [ ] **Visual Theme Engine**: Custom wallpaper uploads and glassmorphic blur opacity sliders.
- [ ] **Cloud Sync Adapters**: WebDAV or Google Drive remote sync options in addition to `chrome.storage.sync`.
