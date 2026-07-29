# Project Directory Layout & File Map (Auto-generated)

> ⚡ Bu dosya `npm run generate:tree` komutu ile otomatik oluşturulmuştur.
> Yeni bir dosya/klasör eklendiğinde bu scripti tekrar çalıştırarak güncelleyebilirsin.

Proje **Clean Architecture** (Temiz Mimari) prensiplerine göre yapılandırılmıştır:

- **domain/** → İş mantığının çekirdeği (hiçbir dış bağımlılığı yoktur)
- **application/** → Uygulama senaryoları (use-case'ler)
- **infrastructure/** → Dış dünya ile iletişim (API, Storage)
- **presentation/** → Kullanıcı arayüzü durum yönetimi
- **components/** → Görsel Preact/React bileşenleri
- **services/** → Servis katmanı (üçüncü parti API, iş mantığı)
- **content/** → Web sayfalarına enjekte edilen scriptler
- **background/** → Servis worker'ı (extension arka plan işlemleri)

---

## 📁 `src/` — Ana Kaynak Kodu

- **App.tsx** → Ana uygulama bileşeni. Sidebar, view'lar ve ayarlar drawer'ını koordine eder.
- **index.tsx** → Uygulamanın Preact ile mount edildiği giriş noktası (newtab.html).
- **popup.tsx** → Tarayıcı ikonuna tıklandığında açılan popup arayüzü.
- **newtab.css** → Yeni sekme sayfasının global CSS tanımları.

---

## 🧠 `src/application/ — Use Case'ler (Uygulama Senaryoları)`

**application/**
  **ports/** → Soyut arayüzler (port'lar) — infrastructure'ın implemente etmesi gereken kontratlar.
    - **IDriveBackupPort.ts** → IDriveBackupPort Interface
    - **ITodoSyncPort.ts** → ITodoSyncPort Interface
  **use-cases/**
    **pomodoro/** → Pomodoro zamanlayıcı işlemleri.
      - **AlarmUseCase.ts** → AlarmUseCase
      - **StopwatchUseCase.ts** → StopwatchUseCase
      - **TimerUseCase.ts** → TimerUseCase
    **settings/** → Ayarlar ile ilgili kullanım senaryoları.
      - **ExportImportUseCase.ts** → ExportImportUseCase
      - **UpdateSettingsUseCase.ts** → UpdateSettingsUseCase
    **sync/** → Bulut senkronizasyon işlemleri.
      - **BackupToDriveUseCase.ts** → BackupToDriveUseCase
      - **GoogleAuthUseCase.ts** → GoogleAuthUseCase
      - **RestoreFromDriveUseCase.ts** → RestoreFromDriveUseCase
      - **SyncGoogleTasksUseCase.ts** → SyncGoogleTasksUseCase
    **todo/** → Todo işlemleri için kullanım senaryoları.
      - **AddTodoUseCase.ts** → AddTodoUseCase
      - **DeleteTodoUseCase.ts** → DeleteTodoUseCase
      - **MoveTaskUseCase.ts** → MoveTaskUseCase
      - **ToggleTodoUseCase.ts** → ToggleTodoUseCase
      - **UpdatePrioritiesUseCase.ts** → UpdatePrioritiesUseCase

---

## 🎯 `src/domain/ — İş Mantığı Çekirdeği (Hiç dış bağımlılığı yok!)`

**domain/**
  **constants/** → Domain sabitleri (KPSS ders, müfredat, flashcard).
    - **kpssConstants.ts** → kpssConstants.ts
    - **kpssCurriculum.ts** → kpssCurriculum.ts
    - **kpssFlashcards.ts** → kpssFlashcards.ts
  **data/** → Domain verileri (Hifiz sure/dua listesi).
    - **hifizData.ts** → hifiz Data
  **entities/** → İş mantığının temel nesneleri (Entity).
    - **Todo.ts** → Todo Entity
  **repositories/** → Repository arayüzleri (port'lar) — infrastructure'ın implementasyon kontratları.
    - **INoteRepository.ts** → INoteRepository Interface
    - **ISettingsRepository.ts** → ISettingsRepository Interface
    - **ISyncRepository.ts** → ISyncRepository Interface
    - **ITodoRepository.ts** → ITodoRepository Interface
  **services/** → Domain'e ait saf iş mantığı servisleri.
    - **detoxMotivationalService.ts** → detoxMotivationalService.ts
    - **KpssCalculatorService.ts** → KpssCalculatorService
    - **SrsService.ts** → SrsService
    - **TaskService.ts** → TaskService
  **value-objects/** → Değer nesneleri (basit tiplerin tip güvenli hali).
    - **Language.ts** → Language Value Object
    - **RepeatType.ts** → RepeatType Value Object
    - **TodoStatus.ts** → TodoStatus Value Object

---

## 🔧 `src/infrastructure/ — Altyapı Katmanı (Storage, API)`

**infrastructure/**
  **api/** → Google API istemcileri (Auth, Tasks, Calendar, Drive).
    - **GoogleAuthApi.ts** → GoogleAuthApi
    - **GoogleCalendarApi.ts** → GoogleCalendarApi
    - **GoogleDriveApi.ts** → GoogleDriveApi
    - **GoogleTasksApi.ts** → GoogleTasksApi
  **persistence/** → Chrome Storage tabanlı veri deposu implementasyonları.
    - **ChromeStorageAlarmRepository.ts** → ChromeStorageAlarmRepository
    - **ChromeStorageNoteRepository.ts** → ChromeStorageNoteRepository
    - **ChromeStoragePomoTimerRepository.ts** → ChromeStoragePomoTimerRepository
    - **ChromeStorageSettingsRepository.ts** → ChromeStorageSettingsRepository
    - **ChromeStorageStockRepository.ts** → ChromeStorageStockRepository.ts
    - **ChromeStorageStopwatchRepository.ts** → ChromeStorageStopwatchRepository
    - **ChromeStorageSyncRepository.ts** → ChromeStorageSyncRepository
    - **ChromeStorageTodoRepository.ts** → ChromeStorageTodoRepository
    **migrations/** → Storage migrasyonları (local → sync).
      - **LocalToSyncMigration.ts** → LocalToSyncMigration
  **services/** → Infrastructure servisleri (PomodoroManager gibi).
    - **PomodoroManagerService.ts** → Pomodoro: Pomodoro Manager

---

## 🎨 `src/presentation/ — Sunum Katmanı (Hooks, ViewModels)`

**presentation/**
  **hooks/** → React/Preact custom hook'lar (state yönetimi).
    - **useAppInit.ts** → useAppInit Hook
    - **usePopup.ts** → Popup
    - **useSettings.ts** → useSettings Hook
    - **useSync.ts** → useSync Hook
    - **useTodos.ts** → useTodos - Todo CRUD operations hook
    - **useUI.ts** → useUI Hook
  **view-models/** → ViewModel'ler (filtreleme, sıralama mantığı).
    - **TodoViewModel.ts** → TodoViewModel

---

## 🖥️ `src/components/ — UI Bileşenleri (Preact)`

**components/**
  **aichat/** → AI sohbet alt bileşenleri.
    - **AiChatHeaderBar.tsx** → AiChatHeaderBar.tsx
    - **AiChatInputToolbar.tsx** → AiChatInputToolbar.tsx
    - **AiChatMessageItem.tsx** → AiChatMessageItem.tsx
  - **AIChatView.tsx** → AI Chat
  - **AICompanionModal.tsx** → AI Companion
  **arcade/** → Arcade oyunları alt bileşenleri.
    - **AddGameModal.tsx** → Add Game
    - **ArcadeGameCard.tsx** → Arcade Game
    - **ArcadeGameModal.tsx** → Arcade Game
    - **ArcadeHeader.tsx** → Arcade Header
    **builtin/** → Yerleşik oyunlar (Snake, SpaceShooter, KnightRunner).
      - **KnightRunner.tsx** → Knight Runner
      - **SnakeGame.tsx** → Snake Game
      - **SpaceShooter.tsx** → Space Shooter
  - **ArcadeView.tsx** → Arcade
  - **BistView.tsx** → BistView.tsx
  - **CalendarView.tsx** → Calendar
  - **ConfirmModal.tsx** → Confirm
  - **DatePicker.tsx** → Date Picker
  **detox/** → Detox/odak alt bileşenleri.
    - **DetoxMotivationCard.tsx** → DetoxMotivationCard.tsx
    - **DetoxStatusCard.tsx** → Detox Status
    - **DetoxUsageCard.tsx** → Detox Usage
  - **DetoxView.tsx** → Detox
  **eisenhower/** → Eisenhower Matrisi alt bileşenleri.
    - **EisenhowerQuadrantCard.tsx** → EisenhowerQuadrantCard.tsx
    - **EisenhowerUnclassifiedSidePanel.tsx** → EisenhowerUnclassifiedSidePanel.tsx
  - **EisenhowerView.tsx** → EisenhowerView.tsx
  - **FooterQuote.tsx** → Footer Quote
  **freegames/** → Ücretsiz oyun alt bileşenleri.
    - **FreeGamesFilterBar.tsx** → FreeGamesFilterBar.tsx
    - **WasItFreeSearchTab.tsx** → WasItFreeSearchTab.tsx
  - **FreeGamesView.tsx** → FreeGamesView.tsx
  - **GameCard.tsx** → Game
  - **HalkaArzView.tsx** → HalkaArzView.tsx
  - **HeroHeader.tsx** → Hero Header
  **hifiz/** → Hafızlık (Hifiz) alt bileşenleri.
    - **HifizMemorizationCard.tsx** → Hifiz Memorization
    - **HifizMushafModal.tsx** → Hifiz Mushaf
    - **HifizYeterliklerCard.tsx** → Hifiz Yeterlikler
    - **HifizYeterlikModal.tsx** → Hifiz Yeterlik
  - **HifizView.tsx** → Hifiz
  - **HistoryCard.tsx** → History
  - **KanbanView.tsx** → Kanban
  **kpss/** → KPSS alt bileşenleri (23 dosya — en büyük modül).
    - **KpssAutoPlannerCard.tsx** → KPSS: Kpss Auto Planner
    - **KpssDailyStatsCard.tsx** → KPSS: Kpss Daily Stats
    - **KpssHeaderBar.tsx** → KpssHeaderBar.tsx
    - **KpssNetEstimationCard.tsx** → KPSS: Kpss Net Estimation
    - **KpssNotesDashboard.tsx** → KpssNotesDashboard.tsx
    - **KpssPastExamsDashboard.tsx** → KPSS: Kpss Past Exams Dashboard
    - **KpssQuestionCanvas.tsx** → KPSS: Kpss Question Canvas
    - **KpssQuestionMap.tsx** → KPSS: Kpss Question Map
    - **KpssQuizInfoModal.tsx** → KpssQuizInfoModal.tsx
    - **KpssQuizIntroStep.tsx** → KpssQuizIntroStep.tsx
    - **KpssQuizModal.tsx** → KpssQuizModal.tsx
    - **KpssQuizQuestionsStep.tsx** → KpssQuizQuestionsStep.tsx
    - **KpssQuizResultStep.tsx** → KpssQuizResultStep.tsx
    - **KpssSrsCard.tsx** → KPSS: Kpss Srs
    - **KpssTopicDetailModal.tsx** → KpssTopicDetailModal.tsx
    - **KpssTopicList.tsx** → KPSS: Kpss Topic List
    - **KpssWikiEditor.tsx** → KpssWikiEditor.tsx
    - **KpssWikiHeader.tsx** → KpssWikiHeader.tsx
    - **KpssWikiReader.tsx** → KpssWikiReader.tsx
    - **KpssWikiSidebar.tsx** → KpssWikiSidebar.tsx
    - **MathRenderer.tsx** → Math Renderer
  - **KpssCountdownBanner.tsx** → KPSS: Kpss Countdown Banner
  - **KpssView.tsx** → KPSS: Kpss
  - **ListView.tsx** → List
  **notes/** → Notlar alt bileşenleri.
    - **CustomQuotesSection.tsx** → CustomQuotesSection.tsx
    - **NoteCard.tsx** → Not: Note
    - **NoteEditorModal.tsx** → Not: Note Editor
    - **NotesFilterBar.tsx** → NotesFilterBar.tsx
    - **NotesHeaderBar.tsx** → NotesHeaderBar.tsx
    - **QuoteEditorModal.tsx** → QuoteEditorModal.tsx
    - **ZettelkastenGraphModal.tsx** → ZettelkastenGraphModal.tsx
  - **NotesView.tsx** → Not: Notes
  **pomodoro/** → Pomodoro alt bileşenleri (Timer, Stopwatch, Alarm, Zen).
    - **PomoAlarmsCard.tsx** → PomoAlarmsCard.tsx
    - **PomoAmbientPlayerCard.tsx** → PomoAmbientPlayerCard.tsx
    - **PomoHeaderTabs.tsx** → PomoHeaderTabs.tsx
    - **PomoStopwatchCard.tsx** → PomoStopwatchCard.tsx
    - **PomoTimerCard.tsx** → Pomodoro: Pomo Timer
    - **PomoZenElementSvgs.tsx** → PomoZenElementSvgs.tsx
    - **PomoZenGardenCard.tsx** → Pomodoro: Pomo Zen Garden
    - **PomoZenHistoryCard.tsx** → Pomodoro: Pomo Zen History
  - **PomodoroView.tsx** → Pomodoro: Pomodoro
  - **PomoSidePanel.tsx** → PomoSidePanel.tsx
  **popup/** → Popup ekranı sekmeleri (Detox, Pomo, Volume).
    - **PopupDetoxTab.tsx** → Popup Detox
    - **PopupPomoTab.tsx** → Pomodoro: Popup Pomo
    - **PopupVolumeTab.tsx** → Popup Volume
  - **PrayerView.tsx** → Prayer
  **settings/** → Ayarlar sekmeleri (General, Detox, Sync, AI, KPSS).
    - **AiSettingsTab.tsx** → Ayarlar: Ai Settings
    - **DetoxSettingsTab.tsx** → Ayarlar: Detox Settings
    - **GeneralSettingsTab.tsx** → Ayarlar: General Settings
    - **KpssSettingsTab.tsx** → KPSS: Kpss Settings
    - **SyncSettingsTab.tsx** → Ayarlar: Sync Settings
  - **SettingsDrawer.tsx** → Ayarlar: Settings Drawer
  **sidebar/** → Sidebar navigasyon bileşenleri.
    - **SidebarIcons.tsx** → SidebarIcons.tsx
    - **SidebarNavItem.tsx** → SidebarNavItem.tsx
  - **Sidebar.tsx** → Sidebar
  - **SrsView.tsx** → Srs
  **stock/** → Borsa alt bileşenleri.
    - **AddStockModal.tsx** → AddStockModal.tsx
    - **BistActionBar.tsx** → BistActionBar.tsx
    - **BistKesfetTab.tsx** → BistKesfetTab.tsx
    - **BistSearchBar.tsx** → BistSearchBar.tsx
    - **CustomStockChart.tsx** → Borsa: Custom Stock Chart
    - **IpoCard.tsx** → Ipo
    - **PortfolioSummaryCard.tsx** → PortfolioSummaryCard.tsx
    - **PortfolioTable.tsx** → PortfolioTable.tsx
    - **RuleBuilderModal.tsx** → RuleBuilderModal.tsx
    - **StockAiAnalysisModal.tsx** → StockAiAnalysisModal.tsx
    - **StockAiReportTab.tsx** → StockAiReportTab.tsx
    - **StockAlertHistoryModal.tsx** → StockAlertHistoryModal.tsx
    - **StockCard.tsx** → Borsa: Stock
    - **StockKapNewsModal.tsx** → StockKapNewsModal.tsx
    - **StockWatchlistTable.tsx** → StockWatchlistTable.tsx
    - **WatchlistSelectorBar.tsx** → WatchlistSelectorBar.tsx
  - **WillpowerView.tsx** → Willpower

---

## ⚙️ `src/services/ — Servis Katmanı`

**services/**
  - **agentToolService.ts** → agentToolService.ts
  - **aiChatService.ts** → aiChatService.ts
  - **aiCompanionService.ts** → aiCompanionService.ts
  - **ambientAudioService.ts** → ambientAudioService.ts
  - **arcadeService.ts** → Load games from chrome storage or default list
  - **bistService.ts** → bistService.ts
  - **dataIntegrity.ts** → data Integrity
  - **gamesService.ts** → Fetches active giveaways from GamerPower API, utilizing local cache.
  - **ipoService.ts** → ipoService.ts
  - **kapNewsService.ts** → kapNewsService.ts
  - **kpssAiService.ts** → KPSS: kpss Ai
  - **kpssPrompts.ts** → KPSS: kpss Prompts
  - **kpssQuizFlowService.ts** → kpssQuizFlowService.ts
  - **kpssQuizService.ts** → kpssQuizService.ts
  - **kpssService.ts** → kpssService
  - **kpssSrsService.ts** → kpssSrsService.ts
  - **kpssWikiService.ts** → kpssWikiService.ts
  - **prayerService.ts** → prayerService.ts
  - **stockAiService.ts** → stockAiService.ts
  - **stockPrompts.ts** → stockPrompts.ts
  - **stockRuleEngine.ts** → stockRuleEngine.ts
  **vocabulary/** → Kelime/öğrenme kartı servis alt modülü.
    - **categories.ts** → categories
    - **loader.ts** → loader
    - **personal.ts** → personal
  - **vocabularyService.ts** → vocabulary
  - **webSearchAgent.ts** → webSearchAgent.ts
  - **zettelkastenEngine.ts** → zettelkastenEngine.ts

---

## 🕸️ `src/content/ — Content Scripts (Web sayfasına enjekte)`

**content/**
  **agent/** → DOM ajan motoru (AI'nin DOM'u okuması).
    - **domAgentEngine.ts** → domAgentEngine.ts
  - **contentMain.ts** → contentMain.ts
  **detox/** → Zararlı/istenmeyen siteleri engelleme.
    - **detoxBlocker.ts** → detoxBlocker.ts
  **infobox/** → Sayfada bilgi kutusu gösterimi.
    - **universalInfoBox.ts** → universalInfoBox.ts
  **volume/** → Web sayfalarında ses yükseltici.
    - **volumeBooster.ts** → volumeBooster.ts
  **whatsapp/** → WhatsApp Web ile entegrasyon köprüsü.
    - **whatsappBridge.ts** → whatsappBridge.ts

---

## ⚡ `src/background/ — Service Worker`

**background/**
  - **backgroundMain.ts** → backgroundMain.ts
  **handlers/** → Background handler'ları (alarm, context menu, runtime mesaj).
    - **alarmNotificationHandler.ts** → alarmNotificationHandler.ts
    - **contextMenuHandler.ts** → contextMenuHandler.ts
    - **mediaAndTabHandler.ts** → mediaAndTabHandler.ts
    - **runtimeMessageHandler.ts** → runtimeMessageHandler.ts
    - **screentimeTracker.ts** → screentimeTracker.ts

---

## 🎨 `src/css/ — Stil Dosyaları`

**css/**
  **newtab/** → Yeni sekme sayfası CSS dosyaları.
    - **ai-chat.css** → ai chat
    - **ambient.css** → ambient
    **arcade/** → Arcade CSS stilleri.
      - **arcade-base.css** → arcade base
      - **arcade-cards.css** → arcade cards
      - **arcade-modal.css** → arcade modal
      - **arcade-steam.css** → arcade steam
    - **arcade.css** → arcade
    - **base.css** → base
    - **calendar.css** → calendar
    - **confirm.css** → confirm
    - **datepicker.css** → datepicker
    - **detox.css** → detox
    - **free-games.css** → free games
    - **game-history.css** → game history
    - **google-sync.css** → google sync
    - **halka-arz.css** → halka arz
    - **hifiz.css** → hifiz
    - **kpss-quiz.css** → KPSS: kpss quiz
    - **kpss.css** → KPSS: kpss
    - **mushaf.css** → mushaf
    - **notes.css** → Not: notes
    - **pomodoro.css** → Pomodoro: pomodoro
    - **prayer.css** → prayer
    - **sidebar.css** → sidebar
    - **sidepanel.css** → sidepanel
    - **srs.css** → srs
    - **stock.css** → Borsa: stock
    - **tasks.css** → tasks
    - **willpower.css** → willpower
    - **zen-garden.css** → zen garden
  - **popup.css** → popup

---

## 📊 `src/data/ — Statik Veri Dosyaları (JSON)`

**data/**
  **kpss/** → KPSS sınav arşivi JSON verileri (2006-2021).
    - **exam2006.json** → exam2006
    - **exam2007.json** → exam2007
    - **exam2008.json** → exam2008
    - **exam2009.json** → exam2009
    - **exam2010.json** → exam2010
    - **exam2011.json** → exam2011
    - **exam2012.json** → exam2012
    - **exam2013.json** → exam2013
    - **exam2014.json** → exam2014
    - **exam2015.json** → exam2015
    - **exam2016.json** → exam2016
    - **exam2017.json** → exam2017
    - **exam2018.json** → exam2018
    - **exam2019.json** → exam2019
    - **exam2020.json** → exam2020
    - **exam2021.json** → exam2021
    - **kpssDataRegistry.ts** → KPSS: kpss Data Registry

---

## 📐 `src/types/ — TypeScript Tip Tanımları`

**types/** → Tüm projede kullanılan ortak tip/interface tanımlamaları.
  - **css.d.ts** → css.d
  - **game.ts** → game
  - **stock.ts** → stock.ts
  - **types.ts** → types
  - **word.ts** → word

---

## 🛠️ `src/utils/ — Yardımcı Fonksiyonlar`

**utils/**
  - **aiCommandParser.ts** → aiCommandParser.ts
  - **bistMarketHours.ts** → bistMarketHours.ts
  - **i18n.ts** → i18n
  - **kpssChartDrawer.ts** → kpssChartDrawer.ts
  - **markdownRenderer.ts** → markdownRenderer.ts
  **translations/** → Çeviri anahtarları (Türkçe/İngilizce).
    - **en.ts** → en
    - **tr.ts** → tr
  - **utils.ts** → utils

---

## 🎵 `src/offscreen/ — Offscreen Document`

**offscreen/**
  - **offscreenAudio.ts** → offscreenAudio.ts

---

## 📋 `src/sidepanel/ — Side Panel`

**sidepanel/**
  - **index.tsx** → index
  - **SidePanelApp.tsx** → Robustly detects whether the active page contains personal registration/application form fields.

---

## 📁 `public/` — Statik Varlıklar

- **manifest.json** → Chrome Extension manifest dosyası
- **/data/** → Çalışma zamanında kullanılan veri dosyaları
- **/icons/** → Extension ikonları (16px, 48px, 128px)
- **/pdf/** → PDF dosyaları

## 📁 `scripts/` — Geliştirme Araçları

- **countLines.js** → Kod satır sayma
- **extract_all_years.py** → KPSS sınav verilerini JSON'dan çıkarma
- **automated_project_tree.js** → Bu dosyayı oluşturan otomasyon scripti

---

## Mimari Özet (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    components/ (UI)                         │
│   Preact bileşenleri — kullanıcının gördüğü arayüz          │
├─────────────────────────────────────────────────────────────┤
│                    presentation/ (Hooks)                    │
│   useState, useEffect mantığı — state yönetimi             │
├─────────────────────────────────────────────────────────────┤
│                    services/ (Servis Katmanı)               │
│   API çağrıları, iş mantığı, üçüncü parti entegrasyon      │
├─────────────────────────────────────────────────────────────┤
│                    application/ (Use Cases)                 │
│   Uygulama senaryoları — Port'lar (arayüzler)              │
├─────────────────────────────────────────────────────────────┤
│                    domain/ (Core)                           │
│   Entity'ler, Value Object'ler, Repository arayüzleri       │
│   ⚠️ Hiçbir dış bağımlılığı yok!                           │
├─────────────────────────────────────────────────────────────┤
│                    infrastructure/ (Altyapı)                │
│   Chrome Storage, Google API, Repository implementasyonları│
│   ⚠️ Domain'deki arayüzleri somutlaştırır                  │
├─────────────────────────────────────────────────────────────┤
│   content/  │  background/  │  offscreen/  │  sidepanel/   │
│   (sayfa içi)│  (arka plan) │  (arka ses)  │  (yan panel)  │
└─────────────────────────────────────────────────────────────┘
```
