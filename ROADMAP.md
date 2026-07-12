# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

This document tracks the upcoming features, architectural improvements, and experimental integrations planned for the **Life OS - Personal Dashboard** Chrome Extension.

---

## 🗺️ Upcoming Features (Yaklaşan Özellikler)

### 1. 🤖 Local AI Assistant & Page Summarizer (Ollama Entegrasyonu)
Bring private, offline Artificial Intelligence to the browser sidebar using local LLMs.
- [ ] **Local API Bridge**: Establish secure connection to local Ollama instance (`http://127.0.0.1:11434`).
- [ ] **Context Fetcher**: Read active tab DOM layout text to pipe clean contents into prompt contexts.
- [ ] **UI Sidebar / Panel**: Introduce a chat panel inside the extension dashboard for summaries, translations, and context Q&A.
- [ ] **Offline Guard**: Zero remote network requests to protect 100% user privacy.

### 2. 🛡️ Advanced Ad Blocker Module (Reklam Engelleyici)
Eliminate tracking scripts and advertising frames natively using Manifest V3 standards.
- [ ] **Declarative Ruleset**: Register JSON filter rules via `chrome.declarativeNetRequest` to intercept advertising domains (EasyList subsets).
- [ ] **Cosmetic Filtering**: Inject content scripts to apply strict stylesheet collapses (`display: none !important`) on ad placeholders.
- [ ] **Anti-Adblock Bypass**: Dynamic updates to block detection scripts.
- [ ] **Exclusion Settings**: Allow users to whitelist trusted domains from the options drawer.

### 3. 🍪 Smart Cookie Consent Auto-Rejector (Çerez Reddedici)
Automate privacy preferences by automatically declining cookie consent dialogs.
- [ ] **DOM Clicker Engine**: Inject background content scripts to locate "Reject All", "Declined", or "Essential Only" buttons on page load.
- [ ] **Provider Blockers**: Intercept Consent Management script bundles (OneTrust, Cookiebot) from loading using declarative network requests.
- [ ] **Scroll Locker Bypass**: Automatically unlock browser scroll states locked by banner overlays.

### 4. 🌐 Universal Info Box & Inline Translator (Sayfa İçi Premium Çeviri Balonu)
Integrate the premium text translation bubble directly into browser webpages, inspired by `Universal_Info_Box_Standalone`.
- [x] **Selection Listener**: Content scripts to monitor mouse selections on any webpage.
- [x] **Premium Glassmorphic Bubble**: A custom hover bubble (with "AI TRANSLATE" header, "✕" close button, fade-in animations, and blur styling) appearing dynamically next to the user's cursor.
- [x] **Translation & AI Queries**: Pipe highlighted text into Google Translate or local Ollama instances for quick definitions/translations.
- [x] **Configuration Settings**: Toggles in Settings to enable/disable the bubble, change font sizes, or require a hotkey trigger (e.g. holding Alt).

---

## 📈 Long-Term Backlog (Uzun Vadeli Planlar)
- [ ] **Visual Theme Engine**: Custom wallpaper uploads and glassmorphic blur opacity sliders.
- [ ] **Pomodoro Analytics**: Interactive historical calendars and heatmaps charting daily focus sessions.
- [ ] **Cloud Sync Adapters**: WebDAV or Google Drive remote sync options in addition to `chrome.storage.sync`.
