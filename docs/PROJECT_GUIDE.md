# Chrome Extension — Dizin ve Dosya Rehberi

Bu belge, `chrome-extension/` projesinin kök dizinindeki tüm dosya ve klasörlerin ne işe yaradığını açıklar. Güncel mimari harita için bkz. [src/ARCHITECTURE.md](../src/ARCHITECTURE.md).

---

## Kök Dizin Dosyaları

| Dosya | Açıklama |
|---|---|
| `newtab.html` | Yeni sekme sayfası girişi. `/src/index.tsx`'i yükler (ana uygulama). |
| `popup.html` | Araç çubuğu popup girişi. `/src/popup.tsx`'i yükler. |
| `sidepanel.html` | Kenar paneli girişi. `/src/sidepanel`'i yükler. |
| `offscreen.html` | Arka plan ses/medya işlemleri için boş offscreen sayfa (Chrome API gereksinimi). |
| `package.json` | npm proje tanımı: bağımlılıklar, script'ler (`dev`, `build`, `desktop:build` vb.). |
| `package-lock.json` | Bağımlılıkların kilitli sürümleri (otomatik üretilir, elle düzenlenmez). |
| `tsconfig.json` | TypeScript derleyici yapılandırması (`@/` yol takma adı burada tanımlı). |
| `vite.config.ts` | Vite build yapılandırması: giriş noktaları, `iife-inline-plugin` (content/background script'leri inline eder). |
| `eslint.config.js` | ESLint kuralları (strict: sıfır `any`, sıfır ham `console.*` vb.). |
| `README.md` | Proje tanıtımı ve kurulum talimatı. |
| `CHANGELOG.md` | Sürüm değişiklik geçmişi. |
| `ROADMAP.md` | Gelecek planları. |
| `SUGGESTION.md` | Öneriler. |
| `LICENSE` | Lisans metni. |
| `project_tree.md` / `project_tree_manual.md` | Proje ağacı dökümleri (referans). |
| `zentodo_private_key.pem` | Chrome Web Store yükleme anahtarı (gizli, gitignore'da). |

---

## Kök Dizin Klasörleri

### `src/` — Kaynak Kod (asıl uygulama)
Tüm TypeScript/Preact kaynakları. Detaylı açıklamalar aşağıda.

### `public/` — Statik Varlıklar
| Dosya/Klasör | Açıklama |
|---|---|
| `manifest.json` | Chrome eklentisi manifest'i (izinler, arka plan, içerik script'leri, ikonlar). |
| `icons/` | Eklenti ikonları: `icon-16/48/128.png`, `AI.png` (AI chat avatarları), `mindvault.png` (KPSS not stüdyosu). |
| `data/` | Statik veri dosyaları (KPSS eski sınavlar vb.). |
| `pdf/` | PDF kaynakları. |
| `sandbox.html` / `sandbox.js` | Güvenli sandbox sayfası (karmaşık işlemler izole ortamda çalışır). |

### `desktop/` — Electron Masaüstü Sarmalayıcı (MindVault.exe)
| Dosya | Açıklama |
|---|---|
| `main.js` | Electron ana süreci: pencere oluşturma, `view=kpss-notes` ile KPSS not stüdyosunu yükler, JSON senkronizasyon IPC handler'ları. |
| `preload.js` | Preload: `chrome.*` API mock'u (storage → localStorage), `window.mindvaultSync` senkronizasyon API'si. |
| `build.js` | Build script: `dist/` → `web/` kopyalar, `/assets/` → `./assets/` yol düzeltir, electron-builder çalıştırır. |
| `package.json` | Electron + electron-builder bağımlılıkları, `portable` hedef. |
| `icon.png` | Windows exe ikonu. |
| `web/` | Build çıktısı (gitignore'da, dist'ten kopyalanır). |
| `dist/` | Exe çıktısı: `MindVault.exe` (portable, 86MB). |
| `*.log` | Hata ayıklama logları (gitignore'da değilse temizlenebilir). |

### `dist/` — Build Çıktısı
`npm run build` sonucu. Chrome'a bu klasör yüklenir (geliştirici modu). Otomatik üretilir, elle düzenlenmez.

### `docs/` — Dokümantasyon
Bu rehber ve diğer belgeler.

### `scripts/` — Yardımcı Script'ler
Örn: `findDeadFiles.mjs` (kullanılmayan dosyaları tespit eder).

### `archives/` — Arşiv
Eski/artık kullanılmayan projeler (Flutter sürümü, eski MindVault Electron uygulaması vb.). Silme, taşıma yalnızca açık talimatla.

### `brain/` — Proje Hafızası (AI için)
- `knowledge.md` — kalıcı bağlam
- `task.md` — görev takibi
- `plans/` — sıralı planlar (`plan-NN-YYYY-MM-DD.md`)

### `.agents/` — AI Kuralları
`AGENTS.md` — kod yazım kuralları (Clean Architecture, i18n, sıfır `any`, dosya boyut limitleri vb.).

### `.vscode/` — VS Code Ayarları
Editör yapılandırması (formatlama, lint entegrasyonu).

### `.git/` — Git Deposu
Sürüm kontrolü veritabanı.

### `node_modules/` — npm Bağımlılıkları
Otomatik kurulur (`npm install`), gitignore'da.

---

## `src/` Detaylı Klasör Haritası

| Klasör | Sorumluluk | İçerik |
|---|---|---|
| `src/App.tsx` | Ana uygulama: global state, aktif görünüm yönlendirme, `view=kpss-notes` özel dalı. | — |
| `src/index.tsx` | Giriş noktası: `<App />`'i `#app`'e bağlar. | — |
| `src/components/` | Sadece UI. View'lar + alt bileşenler. | Aşağıda detaylı |
| `src/services/` | Dış dünya iletişimi: network fetch, chrome.storage erişimi, AI servisleri. | `aiChatService.ts`, `kpss/`, `stock/`, `zettelkastenEngine.ts` vb. |
| `src/presentation/hooks/` | State yönetimi hook'ları. | `useSettings`, `useTodos` vb. |
| `src/domain/` | Saf iş mantığı: entities, value-objects, constants, services, repositories (interface). | `kpssConstants`, `KpssCalculatorService` vb. |
| `src/application/` | Use-case'ler ve port arayüzleri (Clean Architecture). | `use-cases/`, `ports/` |
| `src/infrastructure/` | Dış dünya adaptörleri: Chrome storage repo'ları, Google API client'ları. | `persistence/`, `api/`, `storage/` |
| `src/content/` | Content script'ler (sayfa içine enjekte edilir). | `infobox/`, `detox/`, `whatsapp/`, `telegram/`, `agent/`, `quiz/`, `volume/` |
| `src/background/` | Service worker: mesaj handler'ları, alarm'lar. | `backgroundMain.ts` |
| `src/offscreen/` | Offscreen sayfa mantığı (ses/medya). | — |
| `src/sidepanel/` | Kenar paneli mantığı. | — |
| `src/css/` | Stiller. `newtab/` altında feature bazlı CSS dosyaları, `popup.css`. | `base.css` (tema token'ları), `ai-chat.css`, `kpss.css` vb. |
| `src/types/` | Tip tanımları. | `types.ts`, `kpss.ts`, `stock.ts`, `mindvaultSync.d.ts` vb. |
| `src/utils/` | Genel yardımcılar. | `i18n.ts`, `logger.ts`, `translations/` (tr.ts + en.ts), `markdownRenderer.ts` |
| `src/data/` | Statik veri dosyaları. | `kpss/` (eski sınav JSON'ları) |

### `src/components/` — View'lar (kök)
| Bileşen | Açıklama |
|---|---|
| `ViewRouter.tsx` | Aktif görünümü yönlendirir (Sidebar seçimine göre). |
| `Sidebar.tsx` | Glassmorphic navigasyon menüsü. |
| `ListView.tsx` / `KanbanView.tsx` | Görev listesi / drag-drop Kanban. |
| `EisenhowerView.tsx` | Öncelik matrisi. |
| `PomodoroView.tsx` | Pomodoro zamanlayıcı + stopwatch + alarm. |
| `WillpowerView.tsx` | Disiplin takip zamanlayıcısı. |
| `NotesView.tsx` | Zettelkasten notlar. |
| `HifizView.tsx` | Ezber ilerleme. |
| `SrsView.tsx` | Kelime kartları (spaced repetition). |
| `CalendarView.tsx` | Tamamlanan görev takvimi. |
| `PrayerView.tsx` | Şehir namaz vakitleri. |
| `KpssView.tsx` | KPSS ana paneli (Konu Dağılımı, quiz, notlar, harita). |
| `BistView.tsx` | BIST hisse takibi. |
| `HalkaArzView.tsx` | Halka arz listesi. |
| `FreeGamesView.tsx` | Oyun indirimleri. |
| `ArcadeView.tsx` | Arcade oyunları. |
| `DetoxView.tsx` | Dijital detoks. |
| `AIChatView.tsx` | AI sohbet paneli (AI ikonu burada). |
| `SettingsDrawer.tsx` | Ayarlar çekmecesi. |
| `ConfirmModal.tsx` | Onay modalı (native `confirm()` yasak). |
| `DatePicker.tsx` | Tarih seçici. |
| `KpssCountdownBanner.tsx` | KPSS geri sayım. |
| `FooterQuote.tsx` / `HeroHeader.tsx` | Sunum parçaları. |

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
| `pomodoro/`, `prayer/`, `hifiz/`, `arcade/`, `freegames/`, `detox/`, `eisenhower/`, `stock/`, `settings/`, `sidebar/`, `popup/` | Feature'a özel parçalar. |

---

## Veri Akışı (Katman Kuralı)

```
services/  →  presentation/hooks/  →  components/ (UI)
```

- `components/` ASLA `chrome.storage.*` veya `fetch()` çağırmaz — `services/` üzerinden gider.
- `src/services/` dış dünya ile iletişim kurar (storage, network, AI).
- `src/domain/` saf mantık içerir (UI/storage bağımsız).

---

## Build ve Çalıştırma

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Eklenti build → `dist/` |
| `npm run desktop:build` | Eklenti build + exe build → `desktop/dist/MindVault.exe` |
| `npm run desktop:start` | Electron'u geliştirme modunda çalıştırır |
| `npx tsc --noEmit` | Tip kontrolü |
| `npx eslint src --quiet` | Lint |
| `node scripts/findDeadFiles.mjs` | Ölü dosya kontrolü |

> **Not**: `desktop/` ayrı bir npm projesidir — bağımlılıkları `desktop/node_modules/` içinde durur.
