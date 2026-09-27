# Kalıcı Hafıza — Life OS

Projenin mimari ve domain bilgisinin özeti. Detaylar: `ARCHITECTURE.md` (canlı harita),
`docs/PROJECT_GUIDE.md` (dizin rehberi), `project_tree.md` (üretilmiş ağaç),
`.agents/AGENTS.md` (kurallar).

> **Not (2026-09-27):** `brain/` dizini artık git takibinde **değildir** ve
> `brain/knowledge.md` kullanılmaz — kalıcı bağlam bu dosyada tutulur.

---

## KPSS Quiz Sistemi Mimarisi

### 2 Ayrı Soru Çözme Akışı (Farklı! Karıştırma)

| Akış | Kaynak | Prompt kullanır mı? | Kayıt |
|---|---|---|---|
| **1. Konu Testi (kendi AI)** | `useKpssQuiz` → `kpssQuizFlowService.fetchQuestionsSubsetFromAI` → `kpssAiService` → yapılandırılmış AI endpoint (Gemini/Ollama/OpenRouter) | ✅ `getKpssSystemPrompt()` — [kpss/kpssPrompts.ts](../src/services/kpss/kpssPrompts.ts) | Tam sorular: `evaluateAndSaveQuizResult` → `questions[]` kaydedilir |
| **2. Harici AI** (Claude/Gemini sitede çözme) | `useKpssQuiz` → `kpssQuizFlowService.saveExternalQuizResult` | ❌ **HİÇ kullanmaz** — kullanıcı başka sitede kendi promptuyla çözer, uygulamaya doğru/yanlış sayısını elle girer | Sadece skor: `questions: []`, correct/total sayısı |

### Konu Testi (Akış 1) — HER ZAMAN AI ÜRETİR (2026-08-01 itibarıyla)
- **Eski davranış:** Çıkmış soru arşivinden (exam2009.json vb.) beslenirdi; arşiv yeterliyse AI çağrılmazdı — KULLANICI İSTEMEDİĞİ İÇİN KALDIRILDI
- **Yeni davranış:** Konu testi HER ZAMAN AI'dan soru üretir:
  1. `pastQuizzes`'ten o konunun geçmiş çözülen soruları alınır (senin çözdüğün AI soruları)
  2. **Exclude:** Geçmiş sorular AI'a "bunları tekrar sorma" diye gönderilir
  3. **Few-shot:** Geçmiş sorular "aynı kalitede üret" diye örnek olarak gönderilir
  4. İlk 1 soru bekle-senkron (boş ekran görünmez), kalan `count-1` arka planda
- Çıkmış sorular arşivi SADECE "Çıkmış Sorular Sınav Salonu" sekmesinde kullanılır (`getPastExamQuestions`)

### Prompt Dosyası: `src/services/kpss/kpssPrompts.ts`
- `getKpssSystemPrompt(subjectKey, lang, dynamicExamples?)` → sistem promptu döner
- Yapı: `baseRules` (ortak ÖSYM kuralları) + `subjectRules` (derse özel: tarih/coğrafya/matematik/türkçe/vatandaşlık/genel) + `outputFormat` (JSON şeması) + isteğe bağlı few-shot örnekler
- JSON çıktı şeması: `{question, options[5], correctAnswer(0-4), solution, chart?, map?}` — `QuizQuestion` tipi [kpssAiService.ts](../src/services/kpssAiService.ts)

### Çeldirici Kuralı Yönü (2026-08-01 itibarıyla ters çevrildi!)
- **ÖSYM standardı = DÜŞÜRÜCÜ çeldirici**: doğru bilgi, yanlış bağlam/dönem (ilk bakışta doğru görünür)
- **Bariz yanlış / uydurma / komik şıklar YASAK** — eski prompt bunu istiyordu, yanlıştı
- **Uydurma yasağı**: gerçek olmayan savaş/antlaşma/kurum/kişi/olay ismi asla üretilmez; çeldiriciler de gerçek bilgiden seçilir
- **Dönem kayması**: çeldiricide BİLİNÇLİ serbest, doğru cevapta ASLA (örn: "II. Kılıç Arslan → Kösedağ" doğru cevap olamaz)

### Diğer Prompt Kuralları (2026-08-01 eklendi)
- Zorluk dağılımı: 5 soruda 1 kolay + 2 orta + 2 zor
- Soru tipi: 2 öncüllü + 1 paragraf + 1 kavram + 1 kronoloji
- Cevap anahtarı: A-E dengeli, ardışık aynı harf yasak
- Kazanım tekrarı yasağı + şık uzunluk dengesi + ipucu yasağı
- Açıklama: doğru cevap + her çeldiricinin neden yanlış olduğu

## SRS Aralıklı Tekrar (SM-2 — AuraLingo'dan alındı)

### Köken
- `src/domain/services/SrsService.ts` ↔ AuraLingo `src/domain/usecase/srs.logic.ts` — **1:1 kopya** (calculateSM2, createInitialSRSWord, prepareSRSQueue, XP değerleri, Fisher-Yates)
- AuraLingo'da 4 AYRI koleksiyon var (srsWords/verbSrsWords/phrasalSrsWords/idiomSrsWords — tip koleksiyondan gelir)
- Chrome eklentisinde TEK koleksiyon (`srsProgress`) — kelime `level` alanından tip çözülür

### Aralıklar (Kolay zinciri)
- Yeni → Kolay: 1 gün → 3 gün → `interval × easeFactor` (8, 20, 50, ~125...)
- easeFactor: Kolay +0.15 (tavan 2.5), Zor -0.2 (taban 1.3)
- Orta: ~10 dk (0.007 gün) → 1 gün → ×1.2
- Zor: ~1 dk (0.0007 gün), status learning

### wordType Çözümü (Plan 06 — 2026-08-02)
- Eski bug: `createInitialSRSWord(w.id, "vocabulary")` sabit — fiil/phrasal/idiom yanlış tipleniyordu
- `resolveWordType(word)` eklendi: level → idiom/phrasal/irregular(v1/class)→verb, gerisi vocabulary
- Eski progress kayıtları `enrichedProgress`'te gerçek tipe düzeltilir (kelime loader'da bulunabiliyorsa)
- Interval/EF hesabı wordType kullanmaz — sadece veri doğruluğu

---

## LaTeX Desteği (Yapıldı)
- `src/components/kpss/MathRenderer.tsx` — KaTeX renderer (`katex` + `@types/katex` package.json'da)
- `$...$` inline + `$$...$$` blok; hata → ham metin (throwOnError: false)
- Kullanıldığı yerler: `KpssQuizQuestionsStep.tsx`, `KpssQuizResultStep.tsx`
- Not: `markdownRenderer.ts` (notes/wiki) LaTeX desteklemez — ayrı konu

---

## Harici AI Quiz Overlay Paneli (Plan 04 — Yapıldı 2026-08-01)

### Ne yapar
- Gemini, ChatGPT, Claude, Copilot sitelerinde AI yanıtındaki quiz formatını algılar (soru + A-E şıkları)
- Sağ altta **"Quiz Moduna Geç"** trigger butonu belirir → tıklayınca karanlık glassmorphism overlay açılır
- Şık kartları tıklanabilir, sorular arası gezinme, son soruda "Bitir" → doğru/yanlış sayacı
- İstatistik: `lifos_quiz_stats` (chrome.storage.local) — test sayısı + doğru/toplam, soru içeriği kaydedilmez

### Dosyalar
- `src/content/quiz/quizPanel.ts` — site tespiti + MutationObserver + debounce parse + Shadow DOM overlay UI
- `src/content/contentMain.ts` — `initQuizPanel()` 7. modül olarak eklendi (try/catch izole)
- ~~`src/content/quiz/quizOptionInjector.ts`~~ SİLİNDİ (Plan 03 buton injector — kırılgan, panel ile değiştirildi)

### Tasarım Notları (Kullanıcı + AI önerileri uygulandı)
- **Shadow DOM izolasyonu** — panel kendi shadow root'unda; site CSS'i paneli bozamaz
- **Esnek regex**: `/^\s*[*_]*([A-E])[.)]\s*(.*)$/i` — `A.` `A)` `* A)` `**A)**` hepsini yakalar
- **Debounce 1.8s** — AI yazımı bitince (yeni karakter gelmezse) parse çalışır, CPU tasarrufu
- **KaTeX yok** — `$...$` → özel stil span (italic + monospace + mor arka plan); bundle büyümedi
- **Güvenlik**: `document.createElement` + `textContent`, innerHTML YOK (AGENTS.md 4.4)
- `data-lifos-quiz-processed` idempotent deseni kaldırıldı — panel trigger'ı tek host, `#lifos-quiz-trigger-host` kontrolü

---

## Klasör Yapısı Kararları (2026-08-01)

### Kök vs Klasör Kuralı (AGENTS.md 6.5)
- **Çok dosyalı feature** (>3, aynı domain) → `feature/` klasörü: `services/kpss/`, `services/ambientAudio/`, `components/kpss/quiz/`
- **Tek dosyalık feature / giriş noktası** → kök: `ListView.tsx`, `prayerService.ts`
- **View kökleri** (`components/` 34 kök dosya): ViewRouter'dan yönlenir (23 `case`), birbirini import etmez
- **Alt domain'ler** → `feature/<domain>/`: kpss/quiz, kpss/wiki, kpss/srs

### Güncel Klasör Yapısı (2026-09-27)
```
components/             34 kök dosya (23 view + paylaşılan parça)
components/kpss/        konu/quiz/wiki/map/srs alt klasörleri
components/media/       6 parça (Toolbar, Grid, Card, Stats, Detail, Quotes)
components/network/     6 kart (Overview, Protocol, Radar, Speedometer, DNS, History)
components/govjobs/     3 parça (Header, FilterBar, Card)
services/               17 kök dosya
services/kpss/          AiService, QuizFlow, QuizService, SrsService, WikiService, Prompts, data/
services/stock/         AiService, Prompts, RuleEngine
services/ambientAudio/  5 katman (types / noiseSynthesis / voices / engine / index)
services/aichat/        registry/ (10 plugin), actionExecutor, systemPrompt, providers
infrastructure/persistence/repositories/  23 ChromeStorage*
presentation/hooks/     28 · presentation/store/  (zustand)
tests/                  24 dosya / 155 test (environment: node)
```

### IDE Taşıma Dersi (2026-08-01)
- **VS Code alias import'ları güncellemez** — `@/` yollarına dokunmaz, sadece relative
- Dosya taşırken: `@/services/kpssX.js` → `@/services/kpss/kpssX.js` elle düzeltilmeli
- IDE bazen `.js` → `.ts` uzantı hatası yapar — tsc yakalar, düzelt

---

## Sync Mimarisi (2026-08-01 güncel)

### 3 Katman
1. **chrome.storage.sync** (otomatik): 40+ key Chrome'un kendi sync'i ile eşitlenir — A/B PC arası otomatik, son yazan kazanır, kayıp olmaz
2. **Google Tasks** (todo'lar): `SyncGoogleTasksUseCase` — "Life OS - Focus" + "Life OS - Routines" listeleri, yeni todo yüklenir + **durum değişikliği push edilir** (updateTask, 2026-08-01 eklendi)
3. **Google Drive yedek** (manuel): Backup = tüm sync JSON'ı yaz, Restore = **id-bazlı merge** (Drive + yerel birleşir, yerelde olup Drive'da olmayan korunur — 2026-08-01 eklendi)

### Neye Göre Eşitlenir
- **Sync edilen:** todos, notes, kpssProgress, kpssSrs, stockPortfolio, alarms, sidebarOrder, ayarlar, API key'ler
- **Sync edilmeyen (local):** cache'ler (bist, kap, games, prayer), pomodoro state, stopwatch, arcade oyunları — geçici/oturum verisi
- **Notlar Tasks'a gitmez** — Tasks görev listesi, not defteri değil. Notlar storage.sync + Drive ile eşitlenir

### Ölü Dosya / Boş Klasör Kontrolü
- `node scripts/findDeadFiles.mjs` — 3 bölüm: ölü dosya + boş klasör + public referanssız asset
- Boş klasörler ölü dosya silinince kalır — script onları da yakalar

---

## BIST Nakit + Toplam Varlık (Plan 05 — 2026-08-01)

### Veri Modeli
- `StockCashBalance { amount, updatedAt }` — `chrome.storage.sync` key `stockCash` (`SYNC_STOCK_CASH`)
- `StockTradeHistory { id, symbol, displayName, lotCount, sellPrice, buyPrice, realizedProfit, realizedProfitPercent, soldAt }` — key `stockTradeHistory`, son 100 kayıt

### Nakit Davranışı
- **Hisse al** → nakit `-alışFiyat × lot` (useBist `handleSaveStock`)
- **Hisse sat** → nakit `+satışFiyat × lot` (useBist `handleConfirmSell` — trade kaydı portfolio güncellemeden ÖNCE)
- **Toplam Varlık = nakit + hisse değeri** (canlı fiyatlar)
- Kullanıcı nakit **elle ekler** (`CashBalanceModal` — mevcut + yeni = toplam önizleme)

### Varlık Dağılımı Pasta Grafiği (WealthDistributionModal)
- **Preact `<linearGradient>` + `<stop>` RENDER EDEMEZ** → siyah pasta! `fill="url(#grad-N)"` çözülmez
- Çözüm: **çift katman** — aynı path 2 kez: alt `opacity 0.35` + üst `opacity 0.9` (derinlik + renk)
- Önceki denemeler: stroke-dasharray donut (offset işareti yanlıştı, yarım daire) → arc path (tam pasta) → gradyan (siyah) → çift katman ✅
- Açılış: Toplam Varlık kartına tıkla → `stopPropagation` ile kalem (nakit ekleme) çakışması engellenir

### WP/Telegram Köprü Toggle'ları
- Keys: `whatsappBridgeEnabled` + `telegramBridgeEnabled` — **varsayılan KAPALI** (sync)
- contentMain: `chrome.storage.sync.get` → açıksa `safeInit` — kapalıysa hiç başlatılmaz
- Sayfa yenileme gerektirir (canlı dinleme yok)
- Ayar zinciri: keys → AppSettings → ISettingsRepository → ChromeStorageSettingsRepository (default false) → UpdateSettingsUseCase → useSettings → SettingsDrawer → GeneralSettingsTab → BridgeToggles

---

## Bellek Uyutucu (Sekme Boşaltma) — 2026-09-27

### Neden katmanlı
`chrome.tabs.discard()` bir sekmenin belleğini boşaltır ve sayfadaki JS durumunu
(kaydedilmemiş form, çalışan zamanlayıcı) yok eder. **Yanlış bir karar kullanıcının
verisini siler.** Bu yüzden karar mantığı `src/domain/services/tabSuspendPolicy.ts`
içinde, `chrome.*` çağrısı olmadan tutulur; 28 senaryo `tests/tabSuspendPolicy.test.ts`
ile tarayıcı olmadan doğrulanır. Handler yalnızca veri toplar ve kararı uygular.

### Değerlendirme sırası kasıtlı
Güvenlik gerekçeleri bilgilendirici gerekçelerden **önce** raporlanır. Sesli *ve* yeterince
boşta olmayan bir sekme için `not-idle` değil `audible` döner — kullanıcı "neden
boşaltılmadı?" sorusunda gerçek nedeni görmeli. Sıra: extension-page → browser-internal →
incognito → audible → pinned → active → protected-url → last-window-tab → already-discarded →
unknown-age → not-idle.

### Tuzaklar
- **MV3'te `setInterval` güvenilir değil.** Servis worker boşta kaldığında (~30 sn)
  sonlandırılır; periyodik iş `chrome.alarms` ile yapılır. `screentimeTracker.ts` hâlâ
  `setInterval` kullanıyor — bu, aynı hatayı taşıyan eski bir örnek, kopyalanmamalı.
- **`@types/chrome` `tabs.discard`'i yalnızca tek sekme olarak modelliyor.** Runtime dizi
  kabul etse de tip güvenliği için tek tek çağrılır; yan tesi olarak `beforeunload` uyarısı
  veren tek bir sekme partiyi iptal etmez.
- **Servis worker yeniden başlayınca bellekteki durum gider.** Son erişim zamanları
  `chrome.storage.local`'de tutulur. Hiç kayıt yoksa sekme atlanır (`unknown-age`) —
  tahmin yürütmek yerine güvenli taraf seçilir.
- **Varsayılan kapalı.** Geri dönüşsüz bir işlem, açık izin olmadan çalışmaz.

### Kapsam dışı bırakılanlar
Ham ses dosyası saklama (`MediaRecorder`) A3'e alınmadı: kota yönetimi, blob yaşam döngüsü
ve oynatma arayüzü gerektiriyor. `ROADMAP.md` donmuş **F1**'de kalan iş olarak duruyor.

---

## Ortam Sesi Katmanları (2026-09-27)
- `src/services/ambientAudio/` 5 katman: `ambientAudioTypes` → `noiseSynthesis` → `voices` → `ambientAudioEngine` → `index`
- **Katman sınırı kuralı:** timbres ve sabit *trim* kazancı üreticide, kullanıcı *ses seviyesi* motorda (`VoiceHandle.masterGain`). Tek yerden yönetilir.
- `noiseSynthesis.ts` bilinçli olarak `AudioContext`'ten bağımsızdır → `tests/ambientAudio.test.ts` node ortamında çalışır. Web Audio'ya dokunan mantık test edilemez; bu yüzden ayrılmıştır.
- `VOICE_FACTORIES` tür→üretici tablosudur. Yeni bir ses eklemek için: `AmbientSoundType`'a değer + `ambientAudioTypes.ts`'e alias kararı + `voices.ts`'e fabrika + tabloda girdi.
- **Generation jetonu:** `ambientAudioEngine` her `play`/`stopAllSounds`'ta `generation` artırır; üreticiler bunu `isActive()` olarak alır. LoFi akor zamanlayıcısı bu olmadan **değiştirilmiş** bir `AudioContext`'e akor gönderiyordu (eski hata).
- **Kapsam notu:** Motor hâlâ **tek ses kaynağıdır** (`play()` ilk satırında `stopAllSounds()`). Çok kanallı mixer donmuş durumdadır; bkz. `ROADMAP.md` **F4**.

---

## AI Eylem Kayıt Sistemi (2026-09-21)
- `src/services/aichat/registry/aiFeatureRegistry.ts` — tekil (`getInstance()`), `Map<string, AiFeaturePlugin>`.
- `plugins/index.ts` yerine **kayıt `src/services/aichat/registry/index.ts:39`'da** yapılır: 10 plugin (bist, kpss, mediaVault, memory, navigation, notes, pomodoro, prayer, routines, tasks) liste halinde kaydedilir. Yeni modül eylem eklemek için: `plugins/` altına dosya + `registry/index.ts`'e tek satır. Çekirdek AI sohbet kodu **hiç değişmez**. Uygulama geri bildirimi ortak: `AiActionBadge`.
- **Çıkarılacak ders:** A1 (AI Goal Breakdown) bu sisteme oturacak; yeni bir AI yolu açmayın.

---

## Ölü Kod Politikası (2026-09-27)
- Kural: kullanılmayan tip, fonksiyon, çeviri anahtarı veya CSS kuralı **biriktirilmez**.
- Doğrulama: `node scripts/findDeadFiles.mjs` (ölü dosya + boş klasör + referanssız public asset) ve `node scripts/i18nHealthCheck.mjs` (eksik çeviri anahtarı).
- Dikkat: `getTranslation()` bir Proxy'dir — eksik anahtar **hata fırlatmaz**, anahtarın kendisini döndürür. Bu yüzden i18n artıkları sessizce birikir. Ayda bir `translations/` taraması yapılmalı.
- Dikkat 2: `StockRuleType`'a uygulanmayan bir kural tipi eklenirse `evaluateStockRules()` içindeki `default: break` onu sessizce yutar. Tip ile kural motoru birlikte değişmelidir.
- Dikkat 3: `t[`şablon_${x}`]` ile dinamik erişilen anahtar aileleri statik grep ile bulunamaz (`willpower_rank_*`, `zen_elem_*`, `hifiz_*`, `kpss_map_topic_*`, `labelKey` sabitleri). Bunlara dokunan kod silinmemeli.
