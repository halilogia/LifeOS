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
    - **createCalendarPort.ts** → createCalendarPort.ts
    - **createSyncPort.ts** → createSyncPort.ts
    - **ICalendarSyncPort.ts** → ICalendarSyncPort Interface
    - **IDriveBackupPort.ts** → IDriveBackupPort Interface
    - **IErrorReportPort.ts** → IErrorReportPort.ts
    - **ITodoSyncPort.ts** → ITodoSyncPort Interface
  **use-cases/**
    **settings/** → Ayarlar ile ilgili kullanım senaryoları.
      - **UpdateSettingsUseCase.ts** → UpdateSettingsUseCase
    **sync/** → Bulut senkronizasyon işlemleri.
      - **BackupToDriveUseCase.ts** → BackupToDriveUseCase
      - **GoogleAuthUseCase.ts** → GoogleAuthUseCase
      - **RestoreFromDriveUseCase.ts** → RestoreFromDriveUseCase
      - **SyncGoogleCalendarUseCase.ts** → SyncGoogleCalendarUseCase
      - **SyncGoogleTasksUseCase.ts** → SyncGoogleTasksUseCase
    **todo/** → Todo işlemleri için kullanım senaryoları.
      - **AddTodoUseCase.ts** → AddTodoUseCase
      - **DeleteTodoUseCase.ts** → DeleteTodoUseCase
      - **MoveTaskUseCase.ts** → MoveTaskUseCase
      - **ResetRepeatingTodosUseCase.ts** → ResetRepeatingTodosUseCase
      - **ToggleTodoUseCase.ts** → ToggleTodoUseCase
      - **UpdatePrioritiesUseCase.ts** → UpdatePrioritiesUseCase

---

## 🎯 `src/domain/ — İş Mantığı Çekirdeği (Hiç dış bağımlılığı yok!)`

**domain/**
  **constants/** → Domain sabitleri (KPSS ders, müfredat, flashcard).
    **geography/**
      - **agriculture.ts** → agriculture
      - **climateRain.ts** → climate Rain
      - **coasts.ts** → coasts
      - **developmentProjects.ts** → development Projects
      - **energy.ts** → energy
      - **index.ts** → geography/index.ts
      - **karst.ts** → karst
      - **kirikMountains.ts** → kirik Mountains
      - **kivrimMountains.ts** → kivrim Mountains
      - **livestock.ts** → Borsa: livestock
      - **mines.ts** → mines
      - **population.ts** → population
      - **transportBorders.ts** → transport Borders
      - **turkeyGates.ts** → turkey Gates
      - **turkeyGulfs.ts** → turkey Gulfs
      - **turkeyLakes.ts** → turkey Lakes
      - **turkeyPasses.ts** → turkey Passes
      - **turkeyPlains.ts** → turkey Plains
      - **turkeyPlateaus.ts** → turkey Plateaus
      - **turkeyRivers.ts** → turkey Rivers
      - **types.ts** → types.ts
      - **unesco.ts** → TURKEY_UNESCO — Birleştirilmiş, zenginleştirilmiş UNESCO Dünya Mirası veri seti.
      - **volcanicMountains.ts** → volcanic Mountains
    **history/**
      - **beyliklerUnit.ts** → beylikler Unit
      - **ekonomiKulturUnit.ts** → ekonomi Kultur Unit
      - **ilkDonemBeyliklerUnit.ts** → ilk Donem Beylikler Unit
      - **index.ts** → history/index.ts
      - **kurtulusSavasiUnit.ts** → kurtulus Savasi Unit
      - **osmanliDagilmaUnit.ts** → osmanli Dagilma Unit
      - **osmanliDuraklamaUnit.ts** → osmanli Duraklama Unit
      - **osmanliGerilemeUnit.ts** → osmanli Gerileme Unit
      - **osmanliKurulusUnit.ts** → osmanli Kurulus Unit
      - **osmanliTeskilatUnit.ts** → osmanli Teskilat Unit
      - **osmanliYukselmeUnit.ts** → osmanli Yukselme Unit
      - **selcukluUnit.ts** → selcuklu Unit
      - **types.ts** → types.ts
      - **worldCountryFeaturesData.ts** → worldCountryFeaturesData.ts
      - **WorldMapGeoService.ts** → WorldMapGeoService.ts
      - **WorldProvincePaths.ts** → WorldProvincePaths.ts
    - **kpssConstants.ts** → kpssConstants.ts
    - **kpssCurriculum.ts** → kpssCurriculum.ts
    - **kpssSrsDefaultCards.ts** → Fallback kartları: AI yapılandırması yokken / AI çağrısı başarısız olunca
    - **memoryConstants.ts** → memory Constants
    - **prayerConstants.ts** → Prayer feature constants — safe data, UI-independent (AGENTS.md 6.3: domain/).
    - **quoteConstants.ts** → quoteConstants.ts
    - **sidebarConstants.ts** → sidebar Constants
    - **TurkeyGeographyData.ts** → TurkeyGeographyData.ts
    - **TurkeyHistoryData.ts** → TurkeyHistoryData.ts
    - **TurkeyProvincePaths.ts** → Turkey Province Paths
  **data/** → Domain verileri (Hifiz sure/dua listesi).
    - **hifizData.ts** → hifiz Data
  **entities/** → İş mantığının temel nesneleri (Entity).
    - **Todo.ts** → Todo Entity
  **repositories/** → Repository arayüzleri (port'lar) — infrastructure'ın implementasyon kontratları.
    - **IAiConfigRepository.ts** → IAiConfigRepository Interface
    - **IArcadeRepository.ts** → IArcadeRepository Interface
    - **IBistCacheRepository.ts** → IBistCacheRepository Interface
    - **ICityPulseCacheRepository.ts** → ICityPulseCacheRepository Interface
    - **IGameAssetsCacheRepository.ts** → IGameAssetsCacheRepository Interface
    - **IGamesCacheRepository.ts** → IGamesCacheRepository Interface
    - **IKapNewsCacheRepository.ts** → IKapNewsCacheRepository Interface
    - **IKpssRepository.ts** → IKpssRepository Interface
    - **IMemoryRepository.ts** → IMemoryRepository Interface
    - **INoteRepository.ts** → INoteRepository Interface
    - **IPrayerCacheRepository.ts** → IPrayerCacheRepository Interface
    - **IQuestionBankRepository.ts** → IQuestionBankRepository.ts
    - **IRssRepository.ts** → IRssRepository.ts
    - **ISettingsRepository.ts** → ISettingsRepository Interface
    - **ISrsProgressRepository.ts** → ISrsProgressRepository Interface
    - **IStockRepository.ts** → IStockRepository Interface
    - **ISyncRepository.ts** → ISyncRepository Interface
    - **ITodoRepository.ts** → ITodoRepository Interface
    - **IUserSyncProfileRepository.ts** → IUserSyncProfileRepository Interface
    - **IWikiNoteRepository.ts** → IWikiNoteRepository Interface
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
  **adapters/**
    - **ChromeErrorReportAdapter.ts** → ChromeErrorReportAdapter.ts
  **api/** → Google API istemcileri (Auth, Tasks, Calendar, Drive).
    - **GoogleAuthApi.ts** → GoogleAuthApi
    - **GoogleCalendarApi.ts** → GoogleCalendarApi
    - **GoogleDriveApi.ts** → GoogleDriveApi
    - **GoogleTasksApi.ts** → GoogleTasksApi
  **persistence/** → Chrome Storage tabanlı veri deposu implementasyonları.
    - **ChromeStorageRssRepository.ts** → ChromeStorageRssRepository.ts
    **repositories/**
      - **ChromeStorageAiConfigRepository.ts** → ChromeStorageAiConfigRepository
      - **ChromeStorageArcadeRepository.ts** → ChromeStorageArcadeRepository
      - **ChromeStorageBistCacheRepository.ts** → ChromeStorageBistCacheRepository
      - **ChromeStorageCityPulseCacheRepository.ts** → ChromeStorageCityPulseCacheRepository
      - **ChromeStorageGameAssetsRepository.ts** → ChromeStorageGameAssetsRepository
      - **ChromeStorageGamesCacheRepository.ts** → ChromeStorageGamesCacheRepository
      - **ChromeStorageKapNewsCacheRepository.ts** → ChromeStorageKapNewsCacheRepository
      - **ChromeStorageKpssRepository.ts** → ChromeStorageKpssRepository
      - **ChromeStorageMemoryRepository.ts** → ChromeStorageMemoryRepository
      - **ChromeStorageNoteRepository.ts** → ChromeStorageNoteRepository
      - **ChromeStoragePrayerCacheRepository.ts** → ChromeStoragePrayerCacheRepository
      - **ChromeStorageQuestionBankRepository.ts** → ChromeStorageQuestionBankRepository.ts
      - **ChromeStorageSettingsRepository.ts** → ChromeStorageSettingsRepository
      - **ChromeStorageSrsProgressRepository.ts** → ChromeStorageSrsProgressRepository
      - **ChromeStorageStockRepository.ts** → ChromeStorageStockRepository.ts
      - **ChromeStorageSyncRepository.ts** → ChromeStorageSyncRepository
      - **ChromeStorageTodoRepository.ts** → ChromeStorageTodoRepository
      - **ChromeStorageUserSyncProfileRepository.ts** → ChromeStorageUserSyncProfileRepository
      - **ChromeStorageWikiNoteRepository.ts** → ChromeStorageWikiNoteRepository
  **services/** → Infrastructure servisleri (PomodoroManager gibi).
    - **PomodoroManagerService.ts** → Pomodoro: Pomodoro Manager
  **storage/**
    - **keys.ts** → keys.ts

---

## 🎨 `src/presentation/ — Sunum Katmanı (Hooks, ViewModels)`

**presentation/**
  **hooks/** → React/Preact custom hook'lar (state yönetimi).
    **bist/**
      - **useBistQuotes.ts** → useBistQuotes.ts
      - **usePortfolio.ts** → usePortfolio.ts
      - **useStockRules.ts** → useStockRules.ts
      - **useStockTrading.ts** → useStockTrading.ts
      - **useWatchlists.ts** → useWatchlists.ts
    - **useAiUserMemory.ts** → useAiUserMemory — facade over the Zustand singleton store.
    - **useBist.ts** → BIST borsa dashboard — kompozisyon tuvali.
    - **useCalendar.ts** → Takvim state + Google Calendar sync (AGENTS.md 6.3: presentation/hooks/).
    - **useCityPulse.ts** → City Pulse state + fetch + filter logic (AGENTS.md 6.3: presentation/hooks/).
    - **useDetox.ts** → Facade over useDetoxState — all state + storage lives in the store.
    - **useEisenhower.ts** → Eisenhower matris state + drag-drop + quadrant bölme mantığı.
    - **useFreeGames.ts** → Free games state + fetch + filtre mantığı (AGENTS.md 6.3: presentation/hooks/).
    - **useGameAssets.ts** → useGameAssets.ts
    - **useHifiz.ts** → Facade over useHifizState — all state + storage lives in the store.
    - **useKpssChartMetric.ts** → useKpssChartMetric — facade over the Zustand singleton store.
    - **useKpssChartSettings.ts** → useKpssChartSettings — facade over the Zustand singleton store.
    - **useKpssQuiz.ts** → useKpssQuiz — facade over the Zustand singleton store.
    - **useKpssSortSettings.ts** → useKpssSortSettings — facade over the Zustand singleton store.
    - **useKpssWikiSidebar.ts** → useKpssWikiSidebar — facade over the Zustand singleton store.
    - **useNotes.ts** → Facade over useNotesState — all state + storage + auto-save lives in the store.
    - **usePomodoro.ts** → Facade over usePomodoroState — all state + subscriptions + timers live in the store.
    - **usePopup.ts** → Facade over usePopupState — all state + subscriptions + timers live in the store.
    - **usePrayer.ts** → Facade over usePrayerState — all state + storage + fetch lives in the store.
    - **useSidebarOrder.ts** → Facade over uiStore.sidebarOrder — UI-only state, no chrome.storage here.
    - **useSrs.ts** → Facade over useSrsState — all state + storage lives in the store.
    - **useTabVolume.ts** → useTabVolume — facade over the Zustand singleton store.
    - **useWillpower.ts** → Facade over useWillpowerState — all state + timer + storage lives in the store.
  **store/**
    - **aiUserMemoryStore.ts** → useAiUserMemory store
    - **detoxStore.ts** → useDetox store
    - **hifizStore.ts** → useHifiz store
    - **kpssChartMetricStore.ts** → useKpssChartMetric store
    - **kpssChartSettingsStore.ts** → useKpssChartSettings store
    - **kpssQuizStore.ts** → useKpssQuiz store
    - **kpssSortSettingsStore.ts** → kpssSortSettingsStore
    - **kpssWikiSidebarStore.ts** → useKpssWikiSidebar store
    - **notesStore.ts** → useNotes store
    **pomodoro/**
      - **alarmSlice.ts** → alarm Slice
      - **pomodoroNotify.ts** → pomodoroNotify.ts
      - **stopwatchSlice.ts** → stopwatch Slice
      - **timerSlice.ts** → Pomodoro: timer Slice
      - **zenSlice.ts** → zen Slice
    - **pomodoroStore.ts** → pomodoroStore.ts
    - **popupStore.ts** → usePopup store
    - **prayerStore.ts** → usePrayer store
    - **settingsStore.ts** → useSettings store
    - **sidebarUsageStore.ts** → sidebarUsageStore.ts
    - **srsStore.ts** → useSrs store
    - **syncStore.ts** → useSync store
    - **tabVolumeStore.ts** → useTabVolume store
    - **todosStore.ts** → useTodos store
    - **uiStore.ts** → useUI store
    - **willpowerStore.ts** → useWillpower store

---

## 🖥️ `src/components/ — UI Bileşenleri (Preact)`

**components/**
  **aichat/** → AI sohbet alt bileşenleri.
    - **AiChatHeaderBar.tsx** → AiChatHeaderBar.tsx
    - **aiChatIcons.tsx** → ai Chat Icons
    - **AiChatInputToolbar.tsx** → AiChatInputToolbar.tsx
    - **AiChatMessageItem.tsx** → AiChatMessageItem.tsx
    - **AiMessageFooter.tsx** → Ai Message Footer
    - **AiMessageSources.tsx** → Ai Message Sources
    - **AiThinkingCard.tsx** → Ai Thinking
    - **localReplyBuilder.ts** → localReplyBuilder.ts
    - **useAiChatMessages.ts** → useAiChatMessages.ts
  - **AIChatView.tsx** → AIChatView.tsx
  - **AppTopHeader.tsx** → App Top Header
  **arcade/** → Arcade oyunları alt bileşenleri.
    - **ArcadeDevTab.tsx** → Arcade Dev
    - **ArcadeGameCard.tsx** → Arcade Game
    - **ArcadeGameModal.tsx** → Arcade Game
    - **ArcadeHeader.tsx** → Arcade Header
    - **ArcadeModalHeader.tsx** → Arcade Modal Header
    - **ArcadePlayTab.tsx** → Arcade Play
  - **ArcadeView.tsx** → Arcade
  - **BistView.tsx** → BistView.tsx
  - **CalendarView.tsx** → Calendar
  **citypulse/**
    - **CityEventCard.tsx** → CityEventCard.tsx
    - **CityPulseFilterBar.tsx** → CityPulseFilterBar.tsx
  - **CityPulseView.tsx** → CityPulseView.tsx
  - **ConfirmModal.tsx** → Confirm
  - **DatePicker.tsx** → Date Picker
  **detox/** → Detox/odak alt bileşenleri.
    - **DetoxDistractionCard.tsx** → Detox Distraction
    - **DetoxMotivationCard.tsx** → DetoxMotivationCard.tsx
    - **DetoxPlatformSection.tsx** → Detox Platform Section
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
  **gameassets/**
    - **AssetHubsBar.tsx** → AssetHubsBar.tsx
    - **GameAssetCard.tsx** → GameAssetCard.tsx
    - **GameAssetsFilterBar.tsx** → GameAssetsFilterBar.tsx
  - **GameAssetsView.tsx** → GameAssetsView.tsx
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
    **daily/**
      - **KpssChartToolbar.tsx** → KPSS: Kpss Chart Toolbar
      - **KpssDailyStatsCard.tsx** → KPSS: Kpss Daily Stats
      - **KpssSavedLogChips.tsx** → KPSS: Kpss Saved Log Chips
      - **KpssStatsInputForm.tsx** → KPSS: Kpss Stats Input Form
    **exams/**
      - **KpssPastExamsDashboard.tsx** → KPSS: Kpss Past Exams Dashboard
      - **KpssQuestionMap.tsx** → KPSS: Kpss Question Map
    - **ICONS.md** → ICONS
    - **kpssIcons.tsx** → kpssIcons.tsx
    **map/**
      - **HaritaBlockView.tsx** → HaritaBlockView.tsx
      - **HistoryMapCanvas.tsx** → HistoryMapCanvas.tsx
      - **HistoryMapView.tsx** → HistoryMapView.tsx
      - **HistoryTopicSidebar.tsx** → HistoryTopicSidebar.tsx
      - **mapAudioUtils.ts** → mapAudioUtils.ts
      - **MapBuilder.tsx** → MapBuilder.tsx
      - **MapCanvas.tsx** → Map Canvas
      - **MapControls.tsx** → Map Controls
      - **mapPinUtils.ts** → mapPinUtils.ts
      - **MapQuizCanvas.tsx** → MapQuizCanvas.tsx
      - **MapQuizResultModal.tsx** → MapQuizResultModal.tsx
      - **MapQuizTargetBar.tsx** → MapQuizTargetBar.tsx
      - **MapTopicSidebar.tsx** → Map Topic Sidebar
      - **SchemaBuilder.tsx** → SchemaBuilder.tsx
      - **StateStructureOutline.ts** → StateStructureOutline.ts
      - **TurkeyMapView.tsx** → TurkeyMapView.tsx
      - **useMapPlayback.ts** → useMapPlayback.ts
      - **useMapQuiz.ts** → useMapQuiz.ts
      - **WorldHistoryMapCanvas.tsx** → WorldHistoryMapCanvas.tsx
    **planner/**
      - **KpssAutoPlannerCard.tsx** → KPSS: Kpss Auto Planner
      - **KpssPlannerHeader.tsx** → KPSS: Kpss Planner Header
      - **KpssPlannerInfoModal.tsx** → KPSS: Kpss Planner Info
      - **KpssTodayTopicsList.tsx** → KPSS: Kpss Today Topics List
    **quiz/**
      - **KpssExternalQuizLauncher.tsx** → KpssExternalQuizLauncher.tsx
      - **KpssExternalResultModal.tsx** → KpssExternalResultModal.tsx
      - **KpssQuestionStem.tsx** → KpssQuestionStem.tsx
      - **KpssQuizIntroStep.tsx** → KpssQuizIntroStep.tsx
      - **KpssQuizModal.tsx** → KpssQuizModal.tsx
      - **KpssQuizQuestionsStep.tsx** → KpssQuizQuestionsStep.tsx
      - **KpssQuizResultStep.tsx** → KpssQuizResultStep.tsx
      - **KpssQuizReviewModal.tsx** → KpssQuizReviewModal.tsx
      - **KpssQuizTimer.tsx** → KpssQuizTimer.tsx
      - **MathRenderer.tsx** → Split a string into math-aware segments and render to Preact nodes.
      - **QuizResultActions.tsx** → Quiz Result Actions
      - **QuizResultHero.tsx** → QuizResultHero.tsx
      - **QuizReviewList.tsx** → Quiz Review List
    **srs/**
      - **KpssSrsCard.tsx** → KPSS: Kpss Srs
    **topics/**
      - **kpssCanvasDrawers.ts** → kpssCanvasDrawers.ts
      - **KpssHeaderBar.tsx** → KpssHeaderBar.tsx
      - **KpssNetEstimationCard.tsx** → KPSS: Kpss Net Estimation
      - **KpssProgressSection.tsx** → KPSS: Kpss Progress Section
      - **KpssQuestionCanvas.tsx** → KPSS: Kpss Question Canvas
      - **KpssSrsTab.tsx** → KPSS: Kpss Srs
      - **KpssSubjectNetCard.tsx** → KPSS: Kpss Subject Net
      - **KpssTopicDetailModal.tsx** → KpssTopicDetailModal.tsx
      - **KpssTopicList.tsx** → KPSS: Kpss Topic List
    **wiki/**
      - **KpssHelpModal.tsx** → KpssHelpModal.tsx
      - **KpssNotesDashboard.tsx** → KpssNotesDashboard.tsx
      - **KpssNotesHeader.tsx** → KpssNotesHeader.tsx
      - **KpssNotesToolbar.tsx** → KpssNotesToolbar.tsx
      - **KpssWikiEditor.tsx** → KpssWikiEditor.tsx
      - **KpssWikiReader.tsx** → KpssWikiReader.tsx
      - **KpssWikiSidebar.tsx** → KpssWikiSidebar.tsx
      - **useKpssNotes.ts** → useKpssNotes.ts
      - **WikiArticleBody.tsx** → Wiki Article Body
      - **WikiInfobox.tsx** → Wiki Infobox
      - **WikiNoteTree.tsx** → Not: Wiki Note Tree
      - **WikiSearchFilterBar.tsx** → Wiki Search Filter Bar
      - **WikiTitleHeader.tsx** → WikiTitleHeader.tsx
  - **KpssCountdownBanner.tsx** → KPSS: Kpss Countdown Banner
  - **KpssView.tsx** → KPSS: Kpss
  - **ListView.tsx** → List
  **notes/** → Notlar alt bileşenleri.
    - **CustomQuotesSection.tsx** → CustomQuotesSection.tsx
    - **GraphLegend.tsx** → Graph Legend
    - **GraphSvgCanvas.tsx** → Graph Svg Canvas
    - **NoteBacklinksPanel.tsx** → Not: Note Backlinks Panel
    - **NoteCard.tsx** → Not: Note
    - **NoteCardInlineEditor.tsx** → Not: Note Card Inline Editor
    - **NoteEditorBody.tsx** → Not: Note Editor Body
    - **NoteEditorHeader.tsx** → Not: Note Editor Header
    - **NoteEditorModal.tsx** → Not: Note Editor
    - **NotesDayScorePanel.tsx** → NotesDayScorePanel.tsx
    - **NotesFilterBar.tsx** → NotesFilterBar.tsx
    - **NotesHeaderBar.tsx** → NotesHeaderBar.tsx
    - **QuoteEditorModal.tsx** → QuoteEditorModal.tsx
    - **WikiAutocomplete.tsx** → Wiki Autocomplete
    - **ZettelkastenGraphModal.tsx** → ZettelkastenGraphModal.tsx
  - **NotesView.tsx** → Not: Notes
  **pomodoro/** → Pomodoro alt bileşenleri (Timer, Stopwatch, Alarm, Zen).
    - **PomoAlarmsCard.tsx** → PomoAlarmsCard.tsx
    - **PomoAmbientPlayerCard.tsx** → PomoAmbientPlayerCard.tsx
    - **PomodoroControls.tsx** → Pomodoro: Pomodoro Controls
    - **PomodoroDurationEditor.tsx** → Pomodoro: Pomodoro Duration Editor
    - **PomodoroRing.tsx** → Pomodoro: Pomodoro Ring
    - **PomoHeaderTabs.tsx** → PomoHeaderTabs.tsx
    - **PomoStopwatchCard.tsx** → PomoStopwatchCard.tsx
    - **PomoTimerCard.tsx** → Pomodoro: Pomo Timer
    - **PomoZenElementSvgs.tsx** → PomoZenElementSvgs.tsx
    - **PomoZenGardenCard.tsx** → Pomodoro: Pomo Zen Garden
    - **PomoZenHistoryCard.tsx** → Pomodoro: Pomo Zen History
  - **PomodoroView.tsx** → Pomodoro: Pomodoro
  - **PomoSidePanel.tsx** → PomoSidePanel.tsx
  **popup/** → Popup ekranı sekmeleri (Detox, Pomo, Volume).
    - **DetoxPlatformGrid.tsx** → Detox Platform Grid
    - **detoxPlatforms.tsx** → detox Platforms
    **pomo/**
      - **PomoAlarmsPanel.tsx** → Pomodoro: Pomo Alarms Panel
      - **PomoStopwatchPanel.tsx** → Pomodoro: Pomo Stopwatch Panel
      - **PomoTimerPanel.tsx** → Pomodoro: Pomo Timer Panel
    - **PopupDetoxTab.tsx** → Popup Detox
    - **PopupPomoTab.tsx** → Pomodoro: Popup Pomo
    - **PopupVolumeTab.tsx** → Popup Volume
  **prayer/**
    - **PrayerCityForm.tsx** → City selector form — ortak bileşen (AGENTS.md 5.2: presentational).
  - **PrayerView.tsx** → Prayer
  **rss/**
    - **RssFeedList.tsx** → RssFeedList.tsx
    - **RssItemList.tsx** → RssItemList.tsx
  - **RssView.tsx** → RssView.tsx
  **settings/** → Ayarlar sekmeleri (General, Detox, Sync, AI, KPSS).
    **ai/**
      - **AiConfigForm.tsx** → Ai Config Form
      - **AiMemoryEditor.tsx** → Ai Memory Editor
      - **AiThinkingToggle.tsx** → Ai Thinking Toggle
    - **AiSettingsTab.tsx** → Ayarlar: Ai Settings
    - **AppHotkeySelect.tsx** → App Hotkey Select
    - **AppSettingsGroup.tsx** → AppSettingsGroup.tsx
    - **AppShortcutRow.tsx** → App Shortcut Row
    - **AppToggleRow.tsx** → App Toggle Row
    - **BridgeToggles.tsx** → BridgeToggles.tsx
    - **DetoxSettingsTab.tsx** → Ayarlar: Detox Settings
    - **ErrorReportSettingsTab.tsx** → Ayarlar: Error Report Settings
    - **GeneralSettingsTab.tsx** → GeneralSettingsTab.tsx
    - **KpssAutoTitleToggle.tsx** → KPSS: Kpss Auto Title Toggle
    - **KpssResetSection.tsx** → KPSS: Kpss Reset Section
    - **KpssSettingsTab.tsx** → KPSS: Kpss Settings
    - **KpssTargetSettingsGroup.tsx** → KPSS: Kpss Target Settings Group
    - **SettingsSection.tsx** → SettingsSection.tsx
    - **SyncSettingsTab.tsx** → SyncSettingsTab.tsx
  - **SettingsDrawer.tsx** → Ayarlar: Settings Drawer
  **sidebar/** → Sidebar navigasyon bileşenleri.
    - **SidebarIcons.tsx** → SidebarIcons.tsx
    - **SidebarNavItem.tsx** → SidebarNavItem.tsx
  - **Sidebar.tsx** → Sidebar
  - **SrsView.tsx** → Srs
  **stock/** → Borsa alt bileşenleri.
    **analysis/**
      - **RuleBuilderModal.tsx** → RuleBuilderModal.tsx
      - **StockAiAnalysisModal.tsx** → StockAiAnalysisModal.tsx
      - **StockAlertHistoryModal.tsx** → StockAlertHistoryModal.tsx
    **chart/**
      - **ChartHoverBar.tsx** → Chart Hover Bar
      - **ChartRangeSelector.tsx** → Chart Range Selector
      - **CustomStockChart.tsx** → Borsa: Custom Stock Chart
      - **stockChartDrawer.ts** → stockChartDrawer.ts
    **common/**
      - **BistActionBar.tsx** → BistActionBar.tsx
      - **IpoCard.tsx** → Ipo
    **explore/**
      - **BistExploreTab.tsx** → BistExploreTab.tsx
      - **ExploreFeaturedCard.tsx** → Explore Featured
      - **exploreIcons.tsx** → explore Icons
      - **ExploreTickerCard.tsx** → Explore Ticker
      - **ExploreWatchlistModal.tsx** → Explore Watchlist
    **news/**
      - **kapNewsIcons.tsx** → kap News Icons
      - **KapNewsListItem.tsx** → Kap News List Item
      - **StockKapNewsModal.tsx** → StockKapNewsModal.tsx
    **portfolio/**
      - **AddStockModal.tsx** → AddStockModal.tsx
      - **BistPortfolioTab.tsx** → BistPortfolioTab.tsx
      - **CashBalanceModal.tsx** → Cash Balance
      - **portfolioIcons.tsx** → portfolio Icons
      - **PortfolioRow.tsx** → Portfolio Row
      - **PortfolioSummaryCard.tsx** → PortfolioSummaryCard.tsx
      - **PortfolioTable.tsx** → PortfolioTable.tsx
      - **SellStockModal.tsx** → Borsa: Sell Stock
      - **StockTradeHistoryModal.tsx** → Borsa: Stock Trade History
      - **WealthDistributionModal.tsx** → Wealth Distribution
    **search/**
      - **BistSearchBar.tsx** → BistSearchBar.tsx
      - **NoResultCard.tsx** → No Result
      - **searchIcons.tsx** → search Icons
      - **SearchResultCard.tsx** → Search Result
    **watchlist/**
      - **StockWatchlistTable.tsx** → StockWatchlistTable.tsx
      - **WatchlistHeader.tsx** → Watchlist Header
      - **WatchlistRow.tsx** → Watchlist Row
      - **WatchlistSelectorBar.tsx** → WatchlistSelectorBar.tsx
  - **TodoListItem.tsx** → Tek bir todo satırı (focus + routines listeleri ortak kullanır).
  - **ViewRouter.tsx** → ViewRouter
  - **WillpowerView.tsx** → Willpower

---

## ⚙️ `src/services/ — Servis Katmanı`

**services/**
  - **agentToolService.ts** → agentToolService.ts
  **aichat/**
    - **actionExecutor.ts** → Automatically execute structured AI actions (create tasks, add notes, update memory).
    - **index.ts** → aichat/index.ts
    - **modelFetcher.ts** → model Fetcher
    **prompts/**
      - **system-prompt.md** → system prompt
    - **providers.ts** → providers
    - **systemPrompt.ts** → Builds the system prompt with web search context and user memory.
    - **types.ts** → types
  - **ambientAudioService.ts** → ambientAudioService.ts
  **arcade/**
    - **arcadeFileSystem.ts** → arcade File System
    - **arcadeGameLauncher.ts** → Resolves a game's entry HTML into a self-contained data-URL document.
    - **arcadeHtmlRewriter.ts** → arcade Html Rewriter
    - **arcadeService.ts** → arcade
    - **index.ts** → index
    - **types.ts** → types
  - **bistService.ts** → bistService.ts
  - **cityPulseService.ts** → cityPulseService
  - **cloudDataInspector.ts** → cloudDataInspector.ts
  - **errorReportService.ts** → errorReportService.ts
  - **gameAssetsService.ts** → gameAssetsService
  - **gamesService.ts** → gamesService
  - **ipoService.ts** → ipoService.ts
  - **kapNewsService.ts** → kapNewsService.ts
  **kpss/**
    **data/**
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
      - **exam2022.json** → exam2022
      - **exam2023.json** → exam2023
      - **exam2024.json** → exam2024
      - **exam2025.json** → exam2025
      - **kpssDataRegistry.ts** → kpssDataRegistry.ts
      - **osymHistoryQuestions.json** → osym History Questions
      - **osymHistoryQuestions54.json** → osym History Questions54
    - **kpssAiService.ts** → KPSS: kpss Ai
    - **kpssExternalQuizService.ts** → kpssExternalQuizService.ts
    - **kpssPrompts.ts** → KPSS: kpss Prompts
    - **kpssQuestionBankService.ts** → kpssQuestionBankService.ts
    - **kpssQuizFlowService.ts** → kpssQuizFlowService.ts
    - **kpssQuizService.ts** → Aggregates questions for a specific topic across yearly exam archives.
    - **kpssService.ts** → kpssService
    - **kpssSrsService.ts** → kpssSrsService.ts
    - **kpssWikiService.ts** → kpssWikiService.ts
    **prompts/**
      - **base-rules.md** → base rules
      - **srs-card.md** → srs card
      - **subject-cografya.md** → subject cografya
      - **subject-matematik.md** → subject matematik
      - **subject-tarih.md** → subject tarih
      - **subject-turkce.md** → subject turkce
      - **subject-vatandaslik.md** → subject vatandaslik
  - **prayerService.ts** → prayerService.ts
  - **rssService.ts** → rssService.ts
  **stock/**
    **prompts/**
      - **kap-news.md** → kap news
      - **premarket-watchlist.md** → premarket watchlist
      - **single-stock.md** → Borsa: single stock
    - **stockAiService.ts** → stockAiService.ts
    - **stockPrompts.ts** → Tekil hisse senedi teknik ve temel analiz sistem prompt'u.
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
    - **actionExecutor.ts** → actionExecutor.ts
    - **domAgentEngine.ts** → domAgentEngine.ts
    - **elementScanner.ts** → elementScanner.ts
    - **pageContextExtractor.ts** → pageContextExtractor.ts
  - **contentLogger.ts** → contentLogger.ts
  - **contentMain.ts** → contentMain.ts
  **detox/** → Zararlı/istenmeyen siteleri engelleme.
    - **BlockerUI.ts** → BlockerUI.ts
    **cleaners/**
      - **detoxQuoteBanners.ts** → detoxQuoteBanners.ts
      - **detoxTypes.ts** → detoxTypes.ts
      - **facebookCleaner.ts** → facebookCleaner.ts
      - **tiktokCleaner.ts** → tiktokCleaner.ts
      - **twitterCleaner.ts** → twitterCleaner.ts
    - **detoxBlocker.ts** → detoxBlocker.ts
    - **distractionCleaner.ts** → distractionCleaner.ts
    - **SiteMatcher.ts** → SiteMatcher.ts
  **infobox/** → Sayfada bilgi kutusu gösterimi.
    - **universalInfoBox.ts** → universalInfoBox.ts
  **quiz/**
    - **quizPanel.ts** → quizPanel.ts
    - **QuizParser.ts** → QuizParser.ts
    - **QuizRenderer.ts** → QuizRenderer.ts
    - **QuizStorage.ts** → QuizStorage.ts
  - **rssFeedDiscovery.ts** → rssFeedDiscovery.ts
  **telegram/**
    - **telegramBridge.ts** → telegramBridge.ts
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
    - **rssSyncHandler.ts** → rssSyncHandler.ts
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
    - **base.css** → ═══════════════════════════════════════════════════════════════
    - **calendar.css** → calendar
    - **city-pulse.css** → city-pulse.css
    - **confirm.css** → confirm
    - **datepicker.css** → datepicker
    - **detox.css** → detox
    - **eisenhower.css** → eisenhower
    - **free-games.css** → free games
    - **game-assets.css** → game assets
    - **game-history.css** → game history
    - **google-sync.css** → google sync
    - **halka-arz.css** → halka arz
    - **hifiz.css** → hifiz
    - **kpss-external-quiz.css** → KPSS: kpss external quiz
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

## 📐 `src/types/ — TypeScript Tip Tanımları`

**types/** → Tüm projede kullanılan ortak tip/interface tanımlamaları.
  - **bist.ts** → bist.ts
  - **cityPulse.ts** → cityPulse.ts
  - **css.d.ts** → css.d
  - **dom.d.ts** → dom.d.ts
  - **game.ts** → game
  - **gameAssets.ts** → Types for Free Game Assets module.
  - **games.ts** → Types for free-games features (GamerPower API, Epic history, exclusions).
  - **kap.ts** → kap.ts
  - **kpss.ts** → kpss.ts
  - **prayer.ts** → prayer.ts
  - **stock.ts** → stock.ts
  - **types.ts** → types
  - **word.ts** → word

---

## 🛠️ `src/utils/ — Yardımcı Fonksiyonlar`

**utils/**
  - **aiCommandParser.ts** → aiCommandParser.ts
  - **cloudBackup.ts** → cloudBackup.ts
  - **dateUtils.ts** → "YYYY-MM-DD" string'ini yerel tarih formatına çevirir.
  - **i18n.ts** → i18n
  - **kpssChartCalculations.ts** → kpssChartCalculations.ts
  - **kpssChartDrawer.ts** → kpssChartDrawer.ts
  - **kpssChartRenderBar.ts** → kpssChartRenderBar.ts
  - **kpssChartRenderLine.ts** → kpssChartRenderLine.ts
  - **logger.ts** → logger.ts
  - **markdownRenderer.ts** → markdownRenderer.ts
  - **sanitize.ts** → sanitize.ts
  **translations/** → Çeviri anahtarları (Türkçe/İngilizce).
    **en/**
      - **agent.ts** → agent
      - **aichat.ts** → aichat
      - **arcade.ts** → arcade
      - **city.ts** → city
      - **core.ts** → core
      - **detox.ts** → detox
      - **free.ts** → free
      - **google.ts** → google
      - **hifiz.ts** → hifiz
      - **index.ts** → en translations — aggregated from per-module files.
      - **ipo.ts** → ipo
      - **kpss.ts** → KPSS: kpss
      - **notes.ts** → Not: notes
      - **pomo.ts** → Pomodoro: pomo
      - **rss.ts** → rss
      - **settings.ts** → Ayarlar: settings
      - **srs.ts** → srs
      - **stock.ts** → Borsa: stock
      - **uib.ts** → uib
      - **willpower.ts** → willpower
      - **zen.ts** → zen
    **tr/**
      - **agent.ts** → agent
      - **aichat.ts** → aichat
      - **arcade.ts** → arcade
      - **city.ts** → city
      - **core.ts** → core
      - **detox.ts** → detox
      - **free.ts** → free
      - **google.ts** → google
      - **hifiz.ts** → hifiz
      - **index.ts** → tr translations — aggregated from per-module files.
      - **ipo.ts** → ipo
      - **kpss.ts** → KPSS: kpss
      - **notes.ts** → Not: notes
      - **pomo.ts** → Pomodoro: pomo
      - **rss.ts** → rss
      - **settings.ts** → Ayarlar: settings
      - **srs.ts** → srs
      - **stock.ts** → Borsa: stock
      - **uib.ts** → uib
      - **willpower.ts** → willpower
      - **zen.ts** → zen

---

## 🎵 `src/offscreen/ — Offscreen Document`

**offscreen/**
  - **offscreenAudio.ts** → offscreenAudio.ts

---

## 📋 `src/sidepanel/ — Side Panel`

**sidepanel/**
  - **ChatMessage.ts** → Chat Message
  - **index.tsx** → index
  - **SidePanelApp.tsx** → SidePanelApp.tsx
  - **SidePanelChips.tsx** → Robustly detects whether the active page contains personal registration/application form fields.
  - **SidePanelHeader.tsx** → Side Panel Header
  - **SidePanelInputBar.tsx** → Side Panel Input Bar
  - **SidePanelMessages.tsx** → Side Panel Messages
  - **sidePanelSpeech.ts** → sidePanelSpeech.ts
  - **sidePanelStorage.ts** → sidePanelStorage.ts
  - **SidePanelTabBar.tsx** → Side Panel Tab Bar
  - **useAgentBridge.ts** → useAgentBridge.ts
  - **useChatSession.ts** → useChatSession.ts
  - **useSidePanelChat.ts** → useSidePanelChat.ts
  - **useVoiceInput.ts** → useVoiceInput.ts

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
