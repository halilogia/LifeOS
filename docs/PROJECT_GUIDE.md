# Chrome Extension — Dizin ve Dosya Rehberi

Bu belge, LifeOS projesinin kök dizinindeki tüm dosya ve klasörlerin ne işe yaradığını açıklar.
Güncel mimari harita için bkz. [ARCHITECTURE.md](../ARCHITECTURE.md) ve
[project_tree.md](../project_tree.md) (otomatik üretilir). Kalıcı alan bilgisi için
[KNOWLEDGE.md](KNOWLEDGE.md).

---

## Kök Dizin Dosyaları

| Dosya | Açıklama |
|---|---|
| `newtab.html` | Yeni sekme sayfası girişi. `src/index.tsx`'i yükler (ana uygulama). |
| `popup.html` | Araç çubuğu popup girişi. `src/popup.tsx`'i yükler. |
| `sidepanel.html` | Kenar paneli girişi (Companion AI). `src/sidepanel` girişini yükler. |
| `offscreen.html` | Arka planda kesintisiz ortam sesi çalması için boş offscreen sayfa (Chrome API gereksinimi). |
| `package.json` | npm proje tanımı: bağımlılıklar, script'ler (`dev`, `build`, `test`, `lint`, `count-lines`, `generate:tree`, `benchmark`). |
| `package-lock.json` | Bağımlılıkların kilitli sürümleri (otomatik üretilir, elle düzenlenmez). |
| `tsconfig.json` | TypeScript derleyici yapılandırması (`@/*` yol takma adı burada tanımlı). |
| `vite.config.ts` | Vite build yapılandırması: 4 giriş noktası (newtab/popup/sidepanel/offscreen) + `build-extension-scripts` eklentisi (background.js ve content.js'i ayrı `iife` olarak üretir). |
| `vitest.config.ts` | Test yapılandırması (`tests/**/*.test.ts`, `environment: "node"`). |
| `eslint.config.js` | ESLint kuralları + yerel kurallar (`local/no-turkish-literals` vb.). |
| `README.md` | Proje tanıtımı, ekran listesi ve kurulum talimatları. |
| `CHANGELOG.md` | Sürüm değişiklik geçmişi. |
| `ROADMAP.md` | Aktif kapsam (A1/A2/A3) + donmuş özellikler (F1-F7). Tamamlanan iş buradan çıkarılıp `CHANGELOG.md`'ye taşınır. |
| `ARCHITECTURE.md` | Elle yazılmış mimari açıklama. |
| `ARCHITECTURE_AUTO_GENERATED.md` | Tarama script'inin ürettiği mimari ağaç (üretici scripti depoda **yok**; elle güncellenir). |
| `project_tree.md` | `npm run generate:tree` ile üretilen proje ağacı. |
| `LICENSE` | Lisans metni (GPL-3.0). |
| `zentodo_private_key.pem` | Chrome Web Store yükleme anahtarı (**gizli**, `.gitignore:24`). |

---

## Kök Dizin Klasörleri

### `src/` — Kaynak Kod (asıl uygulama)
Tüm TypeScript/Preact kaynakları. Detaylı açıklamalar aşağıda.

### `public/` — Statik Varlıklar
| Dosya/Klasör | Açıklama |
|---|---|
| `manifest.json` | Chrome eklentisi manifest'i (izinler, MV3 service worker, içerik script'leri, ikonlar). Sürüm: `1.0.0`. |
| `icons/` | Eklenti ikonları: `icon-16/48/128.png`, `AI.png` (AI chat), `mindvault.png` (KPSS not stüdyosu). |
| `data/` | Statik veri dosyaları (KPSS yılları, sözlük JSON'ları vb.). |
| `pdf/` | PDF kaynakları. |
| `sandbox.html` / `sandbox.js` | Güvenli sandbox sayfası (karmaşık işlemler izole ortamda çalışır). |

### `dist/` — Build Çıktısı
`npm run build` sonucu. Chrome'a bu klasör yüklenir (geliştirici modu). `.gitignore:15` — otomatik üretilir, elle düzenlenmez.

### `docs/` — Dokümantasyon
Bu rehber, `KNOWLEDGE.md` (kalıcı alan bilgisi), `geography_summary.md`, `history_summary.md`,
`verileriniznasilkaydedilir.md` (veri yedekleme rehberi).

### `scripts/` — Yardımcı Script'ler
`findDeadFiles.mjs` (ölü dosya / boş klasör / referanssız asset), `i18nHealthCheck.mjs` (eksik çeviri
anahtarı), `automated_project_tree.cjs` (`project_tree.md` üretici), `countLines.js`,
`benchmark.mjs`, `analyzers/` + `runAnalyzers.mjs`, veri birleştirme script'leri.

### `archives/` — Arşiv
Eski/artık kullanılmayan projeler. Silme, taşıma yalnızca açık talimatla.

### `tests/` — Testler
`vitest run` ile çalışır, 24 dosya / 155 test. Ortam `node`; Web Audio gibi tarayıcı
API'lerine bağlı kodun **saf mantığı** (`ambientAudio/noiseSynthesis.ts` gibi) tarayıcısız
test edilebilir şekilde ayrılır.

### Ayar / Araç Dizinleri
| Dizin | Açıklama |
|---|---|
| `.agents/` | `AGENTS.md` — kod yazım kuralları (Clean Architecture, i18n, sıfır `any`, dosya boyut limiti). |
| `.kilo/` | Kilo IDE yapılandırması. |
| `.vscode/` | Editör yapılandırması. |
| `.gravityguard/`, `.hermes/`, `.commandcode/` | Harici araç yapılandırmaları. |
| `brain/` | Proje hafızası (AI için). **Git takibinde değildir** (bkz. `docs/KNOWLEDGE.md`). |

### `node_modules/` — npm Bağımlılıkları
Otomatik kurulur (`npm install`), `.gitignore`'da.

---

## `src/` Detaylı Klasör Haritası

| Klasör | Sorumluluk | İçerik |
|---|---|---|
| `src/App.tsx` | Ana uygulama: global state, aktif görünüm yönlendirme, `view=kpss-notes` özel dalı. | — |
| `src/index.tsx` | Giriş noktası: `<App />`'i `#app`'e bağlar. | — |
| `src/components/` | Yalnızca UI. 34 kök dosya (23 view + paylaşılan parça) + feature klasörleri. | Aşağıda detaylı |
| `src/services/` | Dış dünya iletişimi: network fetch, chrome.storage erişimi, AI servisleri. 17 kök dosya + `aichat/`, `arcade/`, `kpss/`, `stock/`, `vocabulary/`, `ambientAudio/` | — |
| `src/presentation/` | State yönetimi: `store/` (zustand) + `hooks/` (28 hook). | `uiStore`, `mediaStore`, `networkStore`, `kpssQuizStore` vb. |
| `src/domain/` | Saf iş mantığı: entities, value-objects, constants, services, repository **arayüzleri**. | `KpssCalculatorService`, `TodoStatus`, `sidebarConstants` vb. |
| `src/application/` | Use-case'ler ve port arayüzleri (Clean Architecture). | `use-cases/`, `ports/` |
| `src/infrastructure/` | Dış dünya adaptörleri: 23 `ChromeStorage*` repo, Google API client'ları, content script'ler. | `persistence/`, `api/`, `adapters/`, `content/` |
| `src/content/` | Content script'ler (sayfa içine enjekte edilir). | `infobox/`, `detox/`, `whatsapp/`, `telegram/`, `agent/`, `quiz/`, `volume/` |
| `src/background/` | MV3 service worker: mesaj handler'ları, alarm'lar. | `backgroundMain.ts`, `handlers/` |
| `src/background/handlers/` | Alan bazlı handler'lar. | `screentimeTracker.ts`, `alarmNotificationHandler.ts`, `contextMenuHandler.ts`, `mediaAndTabHandler.ts`, `rssSyncHandler.ts`, `runtimeMessageHandler.ts`, **`tabSuspendHandler.ts`** (Bellek Uyutucu) |
| `src/offscreen/` | Offscreen sayfa mantığı (ortam sesi). | `offscreenAudio.ts` |
| `src/sidepanel/` | Kenar paneli mantığı (Companion AI). | `useSidePanelChat`, `SidePanelInputBar` vb. |
| `src/css/` | Stiller. `newtab/` altında feature bazlı CSS + `popup.css`. | `base.css` (tema token'ları), `ai-chat.css`, `kpss.css` vb. |
| `src/types/` | Tip tanimleri ve global `window` genişletmeleri (`dom.d.ts`). | `types.ts`, `kpss.ts`, `stock.ts`, `media.ts`, `bist.ts` vb. |
| `src/utils/` | Genel yardımcılar. | `i18n.ts`, `logger.ts`, `translations/` (tr/ + en/ ayrı klasörler), `markdownRenderer.ts`, `cloudBackup.ts` |

### `src/components/` — View'lar (kök, `ViewRouter.tsx` yönlendirir)
| Bileşen | Açıklama |
|---|---|
| `ViewRouter.tsx` | Aktif görünümü yönlendirir (23 `case`). `kanban` → `EisenhowerView`, `halka-arz` sidebar'da yok. |
| `Sidebar.tsx` | Glassmorphic navigasyon menüsü (sürükle-bırak sıralama, gizleme, kullanım bazlı otomatik sıralama). |
| `ListView.tsx` | Görev listesi (Odak / Rutin sekmeleri). |
| `EisenhowerView.tsx` | Öncelik matrisi + Kanban sekmesi. |
| `PomodoroView.tsx` | Pomodoro zamanlayıcı + stopwatch + alarm + ortam sesi. |
| `WillpowerView.tsx` | Disiplin takip zamanlayıcısı. |
| `NotesView.tsx` | Zettelkasten notlar. |
| `HifizView.tsx` | Ezber ilerleme. |
| `SrsView.tsx` | Kelime kartları (spaced repetition). |
| `CalendarView.tsx` | Tamamlanan görev takvimi. |
| `PrayerView.tsx` | Şehir namaz vakitleri. |
| `RssView.tsx` | RSS feed takip ve okuyucu. |
| `KpssView.tsx` | KPSS ana paneli (konu dağılımı, quiz, notlar, harita). |
| `BistView.tsx` | BIST portföy / takip listesi / keşfet / alarmlar. |
| `HalkaArzView.tsx` | Halka arz takvimi. |
| `FreeGamesView.tsx` | Ücretsiz oyun fırsatları. |
| `GameAssetsView.tsx` | Ücretsiz oyun varlıkları. |
| `CityPulseView.tsx` | Şehir kültür/etkinlik portalı. |
| `GovJobsView.tsx` | Kamu ilanları & Kariyer Kapısı. |
| `NetworkView.tsx` | Ağ teşhisi (5 sekme). |
| `MediaView.tsx` | Media Vault (kütüphane). |
| `ArcadeView.tsx` | Arcade oyunları. |
| `DetoxView.tsx` | Dijital detoks. |
| `AIChatView.tsx` | AI sohbet paneli. |
| `SettingsDrawer.tsx` | Ayarlar çekmecesi. |
| `ConfirmModal.tsx` | Onay modalı (native `confirm()` yasak). |
| `DatePicker.tsx` | Tarih seçici. |
| `KpssCountdownBanner.tsx` / `HeroHeader.tsx` / `FooterQuote.tsx` | Sunum parçaları. |

### `src/components/` — Alt Klasörler
| Klasör | İçerik |
|---|---|
| `aichat/` | `AiChatMessageItem.tsx`, `AiChatHeaderBar.tsx`, `AiChatInputToolbar.tsx`, `useAiChatMessages.ts` |
| `kpss/` | `KpssProgressSection.tsx`, `KpssTopicList.tsx`, `KpssTopicDetailModal.tsx`, `KpssHeaderBar.tsx`, `KpssPastExamsDashboard.tsx` |
| `kpss/wiki/` | Not stüdyosu: `KpssNotesDashboard.tsx` (tuval), `useKpssNotes.ts` (hook), `KpssNotesHeader/Toolbar/HelpModal.tsx`, `KpssWikiSidebar/Reader/Editor.tsx` |
| `kpss/quiz/` | Quiz motoru bileşenleri. |
| `kpss/map/` | `TurkeyMapView.tsx` (Türkiye haritası drag-seek). |
| `kpss/srs/` | `KpssSrsCard.tsx` |
| `notes/` | `ZettelkastenGraphModal.tsx` (bilgi grafiği). |
| `stock/` | `BistPortfolioTab`, `watchlist/`, `analysis/`, `portfolio/` vb. |
| `media/` | `MediaToolbar`, `MediaGrid`, `MediaCard`, `MediaStatsOverview`, `MediaDetailModal`, `MediaQuotesModal` |
| `network/` | `NetworkOverviewCard`, `ProtocolHealthCard`, `ServiceRadarGrid`, `SpeedometerCard`, `DnsSecurityCard`, `DiagnosticHistoryCard` |
| `govjobs/` | `GovJobsHeader`, `GovJobsFilterBar`, `GovJobCard` (`daysLeft` rozeti). |
| `pomodoro/`, `prayer/`, `hifiz/`, `arcade/`, `freegames/`, `gameassets/`, `detox/`, `eisenhower/`, `settings/`, `sidebar/`, `popup/` | Feature'a özel parçalar. `settings/` altında `TabSuspendSettings.tsx` (Bellek Uyutucu arayüzü) bulunur. |

### Bellek Uyutucu (Sekme Boşaltma) Katmanları
| Dosya | Katman | Sorumluluk |
|---|---|---|
| `src/domain/services/tabSuspendPolicy.ts` | Saf politika | Hangi sekmenin boşaltılacağına karar verir. **`chrome.*` çağrısı yoktur** → `tests/tabSuspendPolicy.test.ts` tarayıcısız doğrular. 9 güvenlik kuralı + gerekçe sırası + `policyFromConfig` (depo doğrulaması). |
| `src/background/handlers/tabSuspendHandler.ts` | Orkestrasyon | `chrome.alarms` 5 dk periyod, son erişim takibi (`onActivated`/`onUpdated`/`onRemoved`), `chrome.tabs.discard()` çağrısı, ayar değişimine tepki, `tab_suspend_*` mesajları. |
| `src/presentation/store/tabSuspendStore.ts` | UI durumu | Zustand; `tab_suspend_config` anahtarını okur/yazar. Servis worker ayrı JS bağlamı olduğu için aynı anahtarı doğrudan okur. |
| `src/components/settings/TabSuspendSettings.tsx` | Arayüz | Aç/kapa, eşik seçimi, son tarama özeti, "Şimdi Tara". |

Depolama anahtarları (`chrome.storage.local`): `tab_suspend_config`, `tab_suspend_last_access`, `tab_suspend_last_sweep`.

### `src/services/ambientAudio/` — Katmanlı Ortam Sesi Modülü
Beş katman, yukarıdan aşağıya bağımlılık:

| Dosya | Katman | Sorumluluk |
|---|---|---|
| `ambientAudioTypes.ts` | 1 — Sözleşmeler | `AmbientSoundType`, `AmbientAudioEngine`, legacy `"brown"`/`"hairdryer"` alias normalizasyonu. Bağımlılığı yok. |
| `noiseSynthesis.ts` | 2 — Saf DSP | Kahverengi/pembe gürültü, yağmur damlası, vinyl cıyaklaması üretimi. `AudioContext` bağımsız → node'da test edilebilir. |
| `voices.ts` | 3 — Ses grafikleri | Ses başına düğüm zinciri kurar; `VoiceHandle` teardown için kaynakları toplar; `VOICE_FACTORIES` tür→üretici tablosu. |
| `ambientAudioEngine.ts` | 4 — Yaşam döngüsü | Tek `AudioContext`, seviye uygulama, generation jetonu, teardown. |
| `index.ts` | 5 — Barrel | Tek giriş noktası: `@/services/ambientAudio/index.js`. |

Genel API: `play(soundType, volume)` / `setVolume(volume)` / `stopAllSounds()`.

---

## Veri Akışı (Katman Kuralı)

```
domain/ (saf)  ←  application/ (use-case)  ←  infrastructure/ (adapter)
                                                  ↑
services/  →  presentation/ (store + hooks)  →  components/ (UI)
```

- `components/` ASLA `chrome.storage.*` veya `fetch()` çağırmaz — `services/` veya `presentation/` üzerinden gider.
- `src/domain/` saf mantık içerir (UI/storage bağımsız).
- `src/services/` dış dünya ile iletişim kurar (storage, network, AI).

---

## Build ve Çalıştırma

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Eklenti build → `dist/` |
| `npm test` | Vitest paketi (24 dosya / 155 test) |
| `npm run lint` | ESLint (`--quiet` ile yalnızca hatalar) |
| `npm run count-lines` | Satır sayımı |
| `npm run generate:tree` | `project_tree.md` dosyasını yeniden üretir |
| `npm run benchmark` | Performans ölçümü |
| `npx tsc --noEmit` | Tip kontrolü (script'i yok, doğrudan çağrılır) |
| `node scripts/findDeadFiles.mjs` | Ölü dosya / boş klasör / referanssız asset kontrolü |
| `node scripts/i18nHealthCheck.mjs` | Eksik çeviri anahtarı kontrolü |
