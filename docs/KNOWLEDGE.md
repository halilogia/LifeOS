# Kalıcı Hafıza — ZenTodo / Life OS

Projenin mimari ve domain bilgisinin özeti. Detaylar: `src/ARCHITECTURE.md` (canlı harita), `.agents/AGENTS.md` (kurallar), `brain/task.md` (görev takibi).

---

## KPSS Quiz Sistemi Mimarisi

### 2 Ayrı Soru Çözme Akışı (Farklı! Karıştırma)

| Akış | Kaynak | Prompt kullanır mı? | Kayıt |
|---|---|---|---|
| **1. Konu Testi (kendi AI)** | `useKpssQuiz` → `kpssQuizFlowService.fetchQuestionsSubsetFromAI` → `kpssAiService` → yapılandırılmış AI endpoint (Gemini/Ollama/OpenRouter) | ✅ `getKpssSystemPrompt()` — [kpssPrompts.ts](../src/services/kpssPrompts.ts) | Tam sorular: `evaluateAndSaveQuizResult` → `questions[]` kaydedilir |
| **2. Harici AI** (Claude/Gemini sitede çözme) | `useKpssQuiz` → `kpssQuizFlowService.saveExternalQuizResult` | ❌ **HİÇ kullanmaz** — kullanıcı başka sitede kendi promptuyla çözer, uygulamaya doğru/yanlış sayısını elle girer | Sadece skor: `questions: []`, correct/total sayısı |

### Konu Testi (Akış 1) — HER ZAMAN AI ÜRETİR (2026-08-01 itibarıyla)
- **Eski davranış:** Çıkmış soru arşivinden (exam2009.json vb.) beslenirdi; arşiv yeterliyse AI çağrılmazdı — KULLANICI İSTEMEDİĞİ İÇİN KALDIRILDI
- **Yeni davranış:** Konu testi HER ZAMAN AI'dan soru üretir:
  1. `pastQuizzes`'ten o konunun geçmiş çözülen soruları alınır (senin çözdüğün AI soruları)
  2. **Exclude:** Geçmiş sorular AI'a "bunları tekrar sorma" diye gönderilir
  3. **Few-shot:** Geçmiş sorular "aynı kalitede üret" diye örnek olarak gönderilir
  4. İlk 1 soru bekle-senkron (boş ekran görünmez), kalan `count-1` arka planda
- Çıkmış sorular arşivi SADECE "Çıkmış Sorular Sınav Salonu" sekmesinde kullanılır (`getPastExamQuestions`)

### Prompt Dosyası: `src/services/kpssPrompts.ts`
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
- **Çok dosyalı feature** (>3, aynı domain) → `feature/` klasörü: `services/kpss/`, `components/kpss/quiz/`
- **Tek dosyalık feature / giriş noktası** → kök: `ListView.tsx`, `prayerService.ts`
- **View kökleri** (`components/` 29): ViewRouter'dan yönlenir, birbirini import etmez — route listesi kökte görünür
- **Alt domain'ler** → `feature/<domain>/`: kpss/quiz, kpss/wiki, kpss/srs

### Güncel Klasör Yapısı
```
services/              13 kök (tek dosya feature'lar)
services/kpss/          8 (AiService, QuizFlow, QuizService, SrsService, WikiService, Prompts...)
services/stock/         3 (AiService, Prompts, RuleEngine)
components/            29 view + paylaşılan parça (ConfirmModal, DatePicker)
components/kpss/       10 kök + quiz/ 8 + wiki/ 4 + srs/ 1
infrastructure/persistence/repositories/  15 ChromeStorage*
infrastructure/persistence/migrations/    1 LocalToSyncMigration
presentation/hooks/    19 (tek sorumluluk — istisna, bölünmez)
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

## Brain Klasörü Yapısı (2026-08-01 güncel)
```
brain/
├── knowledge.md     ← bu dosya
├── task.md          ← görev takibi
└── plans/           ← plan-NN-YYYY-MM-DD.md (eski planlar korunur)
```
- Kurallar: `.agents/AGENTS.md` (tek kaynak, brain'de kopyası YOK)
- Mimari harita: `src/ARCHITECTURE.md` (kod yanında yaşar)
- `decisions.md` KALDIRILDI (kullanıcı isteği) — kararlar knowledge.md'ye işlenir
- `walkthrough.md` KULLANILMIYOR (kural kaldırıldı)
