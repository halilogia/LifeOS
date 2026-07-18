# Project Roadmap & Future Plans (Yol Haritası ve Gelecek Planları)

This document tracks the upcoming features, architectural improvements, and experimental integrations planned for the **Life OS - Personal Dashboard** Chrome Extension.

---

## 🗺️ Upcoming Features (Yaklaşan Özellikler)

### 1. 📊 Daily Routine Heatmap Streak (Alışkanlık Zinciri Takvim Izgarası)
Visualize your routine completion consistency with an interactive calendar widget.
- [ ] **Contribution Grid**: A GitHub-style yearly/monthly contribution grid showing green intensity based on the percentage of routines ticked off each day.
- [ ] **Streak Counters**: Live counts of consecutive days routines were fully completed, with fire particle micro-animations on hit milestones.

### 2. 📝 Rich Markdown Editor for Cornell & Notes ( Cornell ve Notlar İçin Markdown Desteği)
Upgrade the color-card notes module to a powerful markup editor.
- [ ] **Rich Formatting**: Support headings, bold, lists, and inline code blocks rendering beautifully on notes cards.
- [ ] **Inline Editor**: Double-click notes cards to swap dynamically into editing textarea mode with real-time preview side.

### 3. 🗺️ KPSS Subject Auto-Scheduling Planner ( KPSS Konu Planlayıcı Sınav Takvimi)
Automate subject preparation tracking by dividing topics into daily calendars.
- [ ] **Auto-Planner**: Distribute selected KPSS topics across remaining days dynamically based on difficulty and exam date.
- [ ] **Today's Topic checklist**: Render a clean card in the dashboard listing the target topics scheduled to be reviewed today.

### 4. 🔒 Screen Time Soft Alert Limits ( Sosyal Medya Günlük Limit ve Uyarı Sistemi)
Configure warning alerts when reaching preset domain active times.
- [ ] **Alert Banner**: Inject a subtle, premium glassmorphic toast notification in active tabs when approaching 80% of daily site limits.
- [ ] **Soft Lock**: Automatically transition domain pages to focus quotes lock view once daily limits are exceeded.

### 5. 🧠 SRS Custom Flashcards Deck Builder (Özel Aralıklı Tekrar Kart Oluşturucu)
Allow users to write and structure their own spaced repetition vocabulary learning decks.
- [ ] **Deck Creator**: Forms to add front/back content cards, choose custom deck categories (e.g. English, KPSS history, programming).
- [ ] **Deck Importer**: Import csv format flashcard sheets easily.

---

## 📈 Long-Term Backlog (Uzun Vadeli Planlar)
- [ ] **Visual Theme Engine**: Custom wallpaper uploads and glassmorphic blur opacity sliders.
- [ ] **Cloud Sync Adapters**: WebDAV or Google Drive remote sync options in addition to `chrome.storage.sync`.

---

## ✅ Completed Features Archive (Tamamlanan Özellikler Arşivi)
- **Local AI Assistant & Page Summarizer**: Connects to local 9Router API with host permissions and offline JSON filters.
- **Active Focus Mode Site Blocker (Detox Blocker)**: Blocks social media channels during focus sessions with deep MutationObserver blockers and local storage sync.
- **Ambient Noise & Lo-Fi Player**: Real-time Web Audio API offline sound synthesis (Hairdryer Brown Noise) in Pomodoro.
- **KPSS Spaced Repetition (SRS)**: Spaced Repetition (SM2) flashcard algorithms and card flipping layout.
- **Unified Eisenhower Matrix & Kanban Board view**: Merged Kanban board and Eisenhower matrix under a unified sidebar menu button.
- **KPSS Target Tuning & Goal Types**: Settings page integration of score/net targets.
- **Daily Screen Time Tracker & Capping**: Track domain spent times and filter out sleep/lock hours.
