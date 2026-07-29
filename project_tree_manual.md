# Project Directory Layout & File Map

Bu dosya, Chrome Extension kod tabanının **src/** dizinindeki tüm klasör ve dosyaların kısa açıklamalarını içerir.  
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

### 🏛️ `src/App.tsx`
Ana uygulama bileşeni. Sidebar, tüm view'lar (ListView, PomodoroView, KpssView vb.) ve ayarlar drawer'ını koordine eder. Uygulamanın merkezi.

### 📦 `src/index.tsx`
Uygulamanın Preact ile mount edildiği giriş noktası. newtab.html'e bağlanır.

### 📦 `src/popup.tsx`
Tarayıcı ikonuna tıklandığında açılan popup arayüzü. Detox, Pomodoro, Volume ayarlarını içerir.

### 🎨 `src/newtab.css`
Yeni sekme sayfasının global CSS tanımları.

---

## 🧠 `src/application/` — Use Case'ler (Uygulama Senaryoları)

Clean Architecture'ın **application katmanı**. Port'lar (arayüzler) ve use-case'ler içerir. Domain ile infrastructure arasında köprü görevi görür.

### `/ports/`
Soyut arayüzler (port'lar) — infrastructure'ın implemente etmesi gereken kontratlar.
- **IDriveBackupPort.ts** → Google Drive yedekleme için port arayüzü
- **ITodoSyncPort.ts** → Todo senkronizasyonu için port arayüzü

### `/use-cases/todo/`
Todo işlemleri için kullanım senaryoları:
- **AddTodoUseCase.ts** → Yeni todo ekleme
- **DeleteTodoUseCase.ts** → Todo silme
- **ToggleTodoUseCase.ts** → Todo tamamlama/iptal
- **MoveTaskUseCase.ts** → Todo'yu başka listeye taşıma
- **UpdatePrioritiesUseCase.ts** → Todo önceliklerini güncelleme

### `/use-cases/pomodoro/`
Pomodoro zamanlayıcı işlemleri:
- **TimerUseCase.ts** → Pomodoro zamanlayıcı mantığı
- **StopwatchUseCase.ts** → Kronometre işlemleri
- **AlarmUseCase.ts** → Alarm kurma ve yönetme

### `/use-cases/settings/`
- **ExportImportUseCase.ts** → Ayarları dışa/içe aktarma
- **UpdateSettingsUseCase.ts** → Ayarları güncelleme

### `/use-cases/sync/`
Bulut senkronizasyon işlemleri:
- **GoogleAuthUseCase.ts** → Google OAuth kimlik doğrulama
- **SyncGoogleTasksUseCase.ts** → Google Tasks ile senkronizasyon
- **BackupToDriveUseCase.ts** → Google Drive'a yedekleme
- **RestoreFromDriveUseCase.ts** → Google Drive'dan geri yükleme

---

## 🎯 `src/domain/` — Domain Katmanı (İş Mantığı Çekirdeği)

Clean Architecture'ın en iç katmanı. **Hiçbir dış bağımlılığı yoktur.** Saf TypeScript ile yazılmıştır.

### `/entities/`
İş mantığının temel nesneleri:
- **Todo.ts** → Todo entity'si (createTodo, toggleTodo gibi saf fonksiyonlar içerir)

### `/value-objects/`
Değer nesneleri (basit tiplerin tip güvenli hali):
- **Language.ts** → Dil tipi ("tr" | "en")
- **RepeatType.ts** → Tekrar tipi (none, daily, weekly, monthly, yearly)
- **TodoStatus.ts** → Todo durumu (todo, in-progress, done) ve geçiş mantığı

### `/repositories/`
Repository arayüzleri (port'lar) — infrastructure'ın implemente etmesi gerekenler:
- **ITodoRepository.ts** → Todo CRUD operasyonları
- **INoteRepository.ts** → Not CRUD operasyonları
- **ISettingsRepository.ts** → Ayarlar CRUD
- **ISyncRepository.ts** → Senkronizasyon verisi CRUD

### `/services/`
Domain'e ait saf iş mantığı servisleri:
- **TaskService.ts** → Görev yönetimi yardımcı fonksiyonları
- **SrsService.ts** → Space Repetition System (aralıklı tekrar) algoritması
- **KpssCalculatorService.ts** → KPSS net hesaplama ve istatistik
- **detoxMotivationalService.ts** → Detox motivasyon mesajları

### `/constants/`
Domain sabitleri:
- **kpssConstants.ts** → KPSS ders, konu, soru sayısı sabitleri
- **kpssCurriculum.ts** → KPSS müfredat yapısı
- **kpssFlashcards.ts** → KPSS flashcard verileri

### `/data/`
Domain verileri:
- **hifizData.ts** → Hafızlık (Hifiz) sure ve dua listesi

---

## 🔧 `src/infrastructure/` — Altyapı Katmanı

Clean Architecture'ın dış katmanı. Domain'deki port'ları (arayüzleri) somut olarak implemente eder. API, Storage ve servis bağlantılarını içerir.

### `/api/`
Google API istemcileri:
- **GoogleAuthApi.ts** → Google OAuth2 kimlik doğrulama
- **GoogleTasksApi.ts** → Google Tasks API entegrasyonu
- **GoogleCalendarApi.ts** → Google Calendar API entegrasyonu
- **GoogleDriveApi.ts** → Google Drive API entegrasyonu

### `/persistence/`
Chrome Storage tabanlı veri deposu implementasyonları:
- **ChromeStorageTodoRepository.ts** → Todo'ları chrome.storage.sync'te saklar
- **ChromeStorageNoteRepository.ts** → Notları chrome.storage'da saklar
- **ChromeStorageSettingsRepository.ts** → Ayarları chrome.storage'da saklar
- **ChromeStorageStockRepository.ts** → Borsa verilerini chrome.storage'da saklar
- **ChromeStorageSyncRepository.ts** → Senkronizasyon verisini chrome.storage'da saklar
- **ChromeStoragePomoTimerRepository.ts** → Pomodoro zamanlayıcı durumunu saklar
- **ChromeStorageStopwatchRepository.ts** → Kronometre durumunu saklar
- **ChromeStorageAlarmRepository.ts** → Alarmları chrome.storage'da saklar

#### `/persistence/migrations/`
- **LocalToSyncMigration.ts** → Local storage'dan sync storage'a veri taşıma

### `/services/`
Infrastructure servisleri:
- **PomodoroManagerService.ts** → Pomodoro zamanlayıcıyı yöneten servis (chrome.alarms API)

---

## 🎨 `src/presentation/` — Sunum Katmanı

UI state yönetimi. Preact hooks ve ViewModel'ler içerir. Component'lerin kullandığı state mantığı burada bulunur.

### `/hooks/`
React/Preact custom hook'lar:
- **useAppInit.ts** → Uygulama başlangıcında yapılacak işlemler (ilk kurulum, veri yükleme)
- **useTodos.ts** → Todo CRUD işlemleri için hook (ekle, sil, güncelle, sırala)
- **useSettings.ts** → Tema, dil, bildirim ayarlarını yöneten hook
- **useSync.ts** → Google senkronizasyon durumunu yöneten hook
- **useUI.ts** → Sidebar, modal gibi UI durumlarını yöneten hook
- **usePopup.ts** → Popup ekranı state ve clock tick yönetimi

### `/view-models/`
- **TodoViewModel.ts** → Todo listesi için view model (filtreleme, sıralama mantığı)

---

## 🖥️ `src/components/` — UI Bileşenleri

Preact ile yazılmış görsel bileşenler. Her özellik kendi alt klasöründe toplanmıştır.

### Ana View Bileşenleri (sayfalar):
- **ListView.tsx** → Ana Todo listesi görünümü
- **PomodoroView.tsx** → Pomodoro zamanlayıcı sayfası
- **NotesView.tsx** → Notlar sayfası
- **CalendarView.tsx** → Takvim görünümü
- **PrayerView.tsx** → Namaz vakti takibi
- **KpssView.tsx** → KPSS çalışma takip sayfası
- **DetoxView.tsx** → Detoks/odaklanma sayfası
- **WillpowerView.tsx** → İrade gücü takibi
- **HifizView.tsx** → Hafızlık takip sayfası
- **SrsView.tsx** → Space Repetition (aralıklı tekrar) sayfası
- **FreeGamesView.tsx** → Ücretsiz oyunları listeleme sayfası
- **BistView.tsx** → Borsa İstanbul takip sayfası
- **HalkaArzView.tsx** → Halka arz takip sayfası
- **ArcadeView.tsx** → Arcade oyunları sayfası
- **AIChatView.tsx** → AI sohbet arayüzü
- **EisenhowerView.tsx** → Eisenhower Matrisi (önceliklendirme) sayfası
- **KanbanView.tsx** → Kanban board görünümü
- **KpssCountdownBanner.tsx** → KPSS'ye kalan süre banner'ı

### Ortak Bileşenler:
- **Sidebar.tsx** → Sol kenar navigasyon çubuğu
- **SettingsDrawer.tsx** → Ayarlar paneli (sağdan açılan drawer)
- **HeroHeader.tsx** → Üst başlık (karşılama mesajı, tarih)
- **FooterQuote.tsx** → Altbilgi alıntı/günün sözü
- **ConfirmModal.tsx** → Onay modalı
- **DatePicker.tsx** → Tarih seçici
- **GameCard.tsx** → Oyun kart bileşeni
- **HistoryCard.tsx** → Geçmiş/istatistik kartı
- **PomoSidePanel.tsx** → Pomodoro yan paneli
- **AICompanionModal.tsx** → AI asistan modalı

### `/sidebar/`
- **SidebarIcons.tsx** → Sidebar ikonlarını içeren SVG'ler
- **SidebarNavItem.tsx** → Sidebar'daki her bir navigasyon öğesi

### `/popup/`
Popup ekranı sekmeleri:
- **PopupDetoxTab.tsx** → Detox ayarları (site engelleme)
- **PopupPomoTab.tsx** → Pomodoro kısa kontroller
- **PopupVolumeTab.tsx** → Ses seviyesi ayarları

### `/pomodoro/`
Pomodoro alt bileşenleri:
- **PomoTimerCard.tsx** → Zamanlayıcı kartı
- **PomoStopwatchCard.tsx** → Kronometre kartı
- **PomoAlarmsCard.tsx** → Alarm kartı
- **PomoAmbientPlayerCard.tsx** → Ortam sesi çalar
- **PomoZenGardenCard.tsx** → Zen bahçesi (focus görseli)
- **PomoZenHistoryCard.tsx** → Zen geçmişi
- **PomoZenElementSvgs.tsx** → Zen bahçesi SVG elementleri
- **PomoHeaderTabs.tsx** → Pomodoro sekmeleri (Timer/Stopwatch/Alarm)

### `/notes/`
Notlar alt bileşenleri:
- **NoteCard.tsx** → Not kartı
- **NoteEditorModal.tsx** → Not düzenleme modalı
- **NotesFilterBar.tsx** → Not filtreleme çubuğu
- **NotesHeaderBar.tsx** → Not başlık çubuğu
- **QuoteEditorModal.tsx** → Alıntı düzenleme modalı
- **CustomQuotesSection.tsx** → Özel alıntılar bölümü
- **ZettelkastenGraphModal.tsx** → Zettelkasten bağlantı grafiği

### `/kpss/`
KPSS alt bileşenleri (23 dosya — en büyük modül):
- **KpssHeaderBar.tsx** → KPSS başlık çubuğu
- **KpssTopicList.tsx** → Konu listesi
- **KpssTopicDetailModal.tsx** → Konu detay modalı
- **KpssQuestionCanvas.tsx** → Soru çalışma alanı
- **KpssQuestionMap.tsx** → Soru haritası
- **KpssNetEstimationCard.tsx** → Net tahmin kartı
- **KpssDailyStatsCard.tsx** → Günlük istatistik kartı
- **KpssAutoPlannerCard.tsx** → Otomatik çalışma planlayıcı
- **KpssSrsCard.tsx** → Aralıklı tekrar kartı
- **KpssNotesDashboard.tsx** → KPSS notları dashboard'u
- **KpssPastExamsDashboard.tsx** → Geçmiş sınavlar
- **KpssQuizModal.tsx** → Quiz modalı (ana kapsayıcı)
- **KpssQuizIntroStep.tsx** → Quiz başlangıç adımı
- **KpssQuizQuestionsStep.tsx** → Quiz soru adımı
- **KpssQuizResultStep.tsx** → Quiz sonuç adımı
- **KpssQuizInfoModal.tsx** → Quiz bilgi modalı
- **KpssWikiHeader.tsx** → Wiki başlık
- **KpssWikiSidebar.tsx** → Wiki kenar çubuğu
- **KpssWikiEditor.tsx** → Wiki düzenleyici
- **KpssWikiReader.tsx** → Wiki okuyucu
- **MathRenderer.tsx** → Matematik formül renderlayıcı (LaTeX)

### `/settings/`
Ayarlar sekmeleri:
- **GeneralSettingsTab.tsx** → Genel ayarlar (tema, dil)
- **DetoxSettingsTab.tsx** → Detox/odak ayarları
- **SyncSettingsTab.tsx** → Senkronizasyon ayarları
- **AiSettingsTab.tsx** → AI yapılandırma ayarları
- **KpssSettingsTab.tsx** → KPSS özel ayarları

### `/stock/`
Borsa alt bileşenleri:
- **StockCard.tsx** → Hisse senedi kartı
- **StockWatchlistTable.tsx** → İzleme listesi tablosu
- **StockAiAnalysisModal.tsx** → AI analiz modalı
- **StockAiReportTab.tsx** → AI rapor sekmesi
- **StockAlertHistoryModal.tsx** → Alert geçmişi
- **StockKapNewsModal.tsx** → KAP haber modalı
- **AddStockModal.tsx** → Hisse ekleme modalı
- **BistActionBar.tsx** → BIST işlem çubuğu
- **BistKesfetTab.tsx** → Keşfet sekmesi
- **BistSearchBar.tsx** → BIST arama çubuğu
- **CustomStockChart.tsx** → Özel grafik bileşeni
- **PortfolioSummaryCard.tsx** → Portföy özet kartı
- **PortfolioTable.tsx** → Portföy tablosu
- **RuleBuilderModal.tsx** → Kural oluşturma modalı
- **WatchlistSelectorBar.tsx** → İzleme listesi seçici

### `/detox/`
- **DetoxStatusCard.tsx** → Detox durum kartı
- **DetoxUsageCard.tsx** → Kullanım istatistik kartı
- **DetoxMotivationCard.tsx** → Motivasyon kartı

### `/hifiz/`
- **HifizMemorizationCard.tsx** → Ezber kartı
- **HifizMushafModal.tsx** → Mushaf görüntüleme modalı
- **HifizYeterliklerCard.tsx** → Yeterlilikler kartı
- **HifizYeterlikModal.tsx** → Yeterlilik detay modalı

### `/arcade/`
- **AddGameModal.tsx** → Oyun ekleme modalı
- **ArcadeGameCard.tsx** → Oyun kartı
- **ArcadeGameModal.tsx** → Oyun oynama modalı
- **ArcadeHeader.tsx** → Arcade başlık çubuğu

#### `/arcade/builtin/`
Yerleşik oyunlar:
- **SnakeGame.tsx** → Yılan oyunu
- **SpaceShooter.tsx** → Uzay oyunu
- **KnightRunner.tsx** → Koşu oyunu

### `/freegames/`
- **FreeGamesFilterBar.tsx** → Ücretsiz oyun filtreleme
- **WasItFreeSearchTab.tsx** → "Ücretsiz miydi?" sorgulama

### `/eisenhower/`
- **EisenhowerQuadrantCard.tsx** → Eisenhower çeyrek kartı
- **EisenhowerUnclassifiedSidePanel.tsx** → Sınıflandırılmamış görevler

### `/aichat/`
- **AiChatHeaderBar.tsx** → AI sohbet başlık
- **AiChatInputToolbar.tsx** → AI sohbet araç çubuğu
- **AiChatMessageItem.tsx** → AI sohbet mesaj öğesi

---

## ⚙️ `src/services/` — Servis Katmanı

İş mantığı ve üçüncü parti API entegrasyonlarını içeren servisler. Domain ve infrastructure arasında köprü görevi görür.

- **aiChatService.ts** → AI API (Ollama, OpenRouter, Gemini) iletişimi ve sohbet yönetimi
- **aiCompanionService.ts** → AI asistan (companion) servisi
- **agentToolService.ts** → AI ajan araçları (web search, komut çalıştırma)
- **webSearchAgent.ts** → Web arama ajanı (Google Custom Search + AI)
- **ambientAudioService.ts** → Ortam sesleri (yağmur, kahve, doğa vb.) oynatma
- **arcadeService.ts** → Arcade oyun verilerini chrome.storage'da yönetme
- **bistService.ts** → BIST hisse verilerini çekme ve işleme
- **gamesService.ts** → Ücretsiz oyun verilerini toplama (Epic Games, Steam, GOG)
- **ipoService.ts** → Halka arz verilerini toplama
- **kapNewsService.ts** → KAP haberlerini çekme
- **prayerService.ts** → Namaz vakti hesaplama (API + hesaplama)
- **stockAiService.ts** → Hisse senedi AI analiz servisi
- **stockRuleEngine.ts** → Hisse senedi kural motoru (fiyat alarmları)
- **stockPrompts.ts** → Hisse AI prompt şablonları
- **kpssService.ts** → KPSS çalışma verilerini yönetme
- **kpssAiService.ts** → KPSS AI soru üretme ve analiz
- **kpssPrompts.ts** → KPSS AI prompt şablonları
- **kpssQuizService.ts** → KPSS quiz oluşturma ve değerlendirme
- **kpssQuizFlowService.ts** → KPSS quiz akış yönetimi
- **kpssSrsService.ts** → KPSS aralıklı tekrar
- **kpssWikiService.ts** → KPSS Wiki (bilgi bankası) servisi
- **dataIntegrity.ts** → Veri bütünlüğü kontrolü ve onarım
- **vocabularyService.ts** → Kelime/öğrenme kartı servisi
- **zettelkastenEngine.ts** → Zettelkasten bağlantı motoru (notlar arası bağlantı)

### `/vocabulary/`
- **categories.ts** → Kelime kategorileri
- **loader.ts** → Kelime verilerini yükleme
- **personal.ts** → Kişisel kelime listesi

---

## 🕸️ `src/content/` — Content Scripts (Web Sayfasına Enjekte Edilenler)

Chrome extension'ın web sayfalarına enjekte ettiği script'ler. Sayfada DOM manipülasyonu yaparak çeşitli özellikler sağlar.

- **contentMain.ts** → Content script giriş noktası. Tüm alt modülleri başlatır.

### `/agent/`
- **domAgentEngine.ts** → DOM ajan motoru (AI'nin DOM'u okuması ve işlem yapması)

### `/detox/`
- **detoxBlocker.ts** → Zararlı/istenmeyen siteleri engelleme (kırmızı blokaj ekranı)

### `/infobox/`
- **universalInfoBox.tsx** → Sayfada bilgi kutusu gösterimi (seçili metin hakkında bilgi)

### `/volume/`
- **volumeBooster.ts** → Web sayfalarında ses yükseltici (ses seviyesini %500'e kadar artırma)

### `/whatsapp/`
- **whatsappBridge.ts** → WhatsApp Web ile entegrasyon köprüsü

---

## ⚡ `src/background/` — Background Service Worker

Extension'ın arka planda çalışan servis worker'ı. Sayfa açık olmasa bile çalışır.

- **backgroundMain.ts** → Service worker giriş noktası. Tüm handler'ları başlatır.

### `/handlers/`
- **alarmNotificationHandler.ts** → Alarm bildirimlerini yönetir
- **contextMenuHandler.ts** → Sağ tık menüsü öğelerini yönetir
- **mediaAndTabHandler.ts** → Medya oynatma ve ses kontrol mesajlarını yönetir
- **runtimeMessageHandler.ts** → Runtime mesajlarını yönetir (popup, content script ile iletişim)
- **screentimeTracker.ts** → Ekran süresi takibi (hangi sitede ne kadar vakit geçirildiği)

---

## 🎨 `src/css/` — Stil Dosyaları

### `/newtab/`
Yeni sekme sayfasına ait CSS dosyaları:
- **base.css** → Temel stiller
- **sidebar.css** → Sidebar stilleri
- **tasks.css** → Todo listesi stilleri
- **pomodoro.css** → Pomodoro stilleri
- **calendar.css** → Takvim stilleri
- **notes.css** → Notlar stilleri
- **kpss.css** → KPSS stilleri
- **kpss-quiz.css** → KPSS quiz stilleri
- **detox.css** → Detox stilleri
- **stock.css** → Borsa stilleri
- **willpower.css** → İrade gücü stilleri
- **hifiz.css** → Hafızlık stilleri
- **mushaf.css** → Mushaf görüntüleyici stilleri
- **prayer.css** → Namaz vakti stilleri
- **srs.css** → Space Repetition stilleri
- **free-games.css** → Ücretsiz oyun stilleri
- **game-history.css** → Oyun geçmişi stilleri
- **halka-arz.css** → Halka arz stilleri
- **ai-chat.css** → AI sohbet stilleri
- **zen-garden.css** → Zen bahçesi stilleri
- **ambient.css** → Ortam sesi stilleri
- **confirm.css** → Onay modalı stilleri
- **datepicker.css** → Tarih seçici stilleri
- **sidepanel.css** → Yan panel stilleri
- **google-sync.css** → Google senkronizasyon stilleri

#### `/arcade/`
- **arcade-base.css** → Arcade temel stilleri
- **arcade-cards.css** → Oyun kartları stilleri
- **arcade-modal.css** → Arcade modal stilleri
- **arcade-steam.css** → Steam temalı stiller

- **popup.css** → Popup ekranı stilleri (src/css altında)

---

## 📊 `src/data/` — Statik Veri Dosyaları

JSON formatında sabit veriler (KPSS sınav arşivi).

### `/kpss/`
- **kpssDataRegistry.ts** → KPSS veri kaydı (tüm sınavları birleştirir)
- **exam_tarih_arsivi.json** → KPSS tarih sınav arşivi metadata
- **exam2006.json** ile **exam2021.json** arası → 2006-2021 yılları arası KPSS çıkmış sorular (17 JSON dosyası)

---

## 📐 `src/types/` — TypeScript Tip Tanımları

Tüm projede kullanılan ortak tip/interface tanımlamaları.

- **types.ts** → Genel tipler (HifizItem, Note, StockPortfolioItem, KpssProgress, vb.)
- **stock.ts** → Borsa ile ilgili tipler (StockPortfolioItem, StockRule, StockAlertLog)
- **game.ts** → Oyun tipleri (GameEntry, GameProvider)
- **word.ts** → Kelime/öğrenme kartı tipleri
- **css.d.ts** → CSS modülleri için TypeScript deklarasyonları

---

## 🛠️ `src/utils/` — Yardımcı Fonksiyonlar

- **utils.ts** → Genel yardımcı fonksiyonlar (tarih, ID oluşturma, storage işlemleri)
- **i18n.ts** → Çoklu dil desteği (Türkçe/İngilizce çeviri Proxy'si)
- **aiCommandParser.ts** → AI komutlarını parse etme (ör: "add todo: ...")
- **bistMarketHours.ts** → BIST piyasa saatleri hesaplama
- **kpssChartDrawer.ts** → KPSS istatistik grafik çizici (Canvas tabanlı)
- **markdownRenderer.ts** → Markdown renderlayıcı (AI cevaplarını göstermek için)

### `/translations/`
- **tr.ts** → Türkçe çeviri anahtarları
- **en.ts** → İngilizce çeviri anahtarları

---

## 🎵 `src/offscreen/` — Offscreen Document

Chrome extension offscreen document (ses oynatma gibi işlemler için arka plan belgesi):
- **offscreenAudio.ts** → Offscreen ses oynatma (alarm sesleri, ambient sesler)

---

## 📋 `src/sidepanel/` — Side Panel

Chrome Side Panel API ile açılan yan panel:
- **index.tsx** → Side panel mount noktası
- **SidePanelApp.tsx** → Side panel ana uygulama bileşeni

---

## 📁 `public/` — Statik Varlıklar

- **manifest.json** → Chrome Extension manifest dosyası (izinler, ikonlar, background tanımı)
- **/data/** → Çalışma zamanında kullanılan veri dosyaları
- **/icons/** → Extension ikonları (16px, 48px, 128px)
- **/pdf/** → PDF dosyaları

## 📁 `scripts/` — Geliştirme Araçları

- **countLines.js** → Kod satır sayma scripti
- **extract_all_years.py** → KPSS sınav verilerini JSON'dan çıkarma scripti

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

---

## Otomasyon Önerisi

Mevcut `project_tree.md` dosyasını güncel tutmak için iki seçenek var:

1. **Manuel Güncelleme** → Proje küçükken mantıklıydı, ama artık 250+ dosya var, manuel güncelleme unutulmaya mahkum.
2. **Otomasyon Scripti** → `scripts/generateProjectTree.js` adında bir script yazıp her önemli değişiklikten sonra çalıştırabiliriz. Script:
   - `find` ile dosya yapısını tarar
   - Her dosyanın ilk satırındaki JSDoc yorumunu (`/** ... */`) okur
   - Eğer JSDoc yoksa dosya adından anlamlı bir açıklama üretir
   - `project_tree.md`'yi otomatik günceller
   - `package.json`'a `"generate:tree": "node scripts/generateProjectTree.js"` komutu eklenir

**Önerim:** Şimdilik manuel olarak bu kapsamlı dokümanı oluşturdum. Ama ileride güncel kalması için bir otomasyon scripti yazmak iyi olur. Script'i de yazmamı ister misin?