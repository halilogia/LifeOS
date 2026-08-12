# Kritik İhlal Düzeltme Planı

**Tarih:** 04.08.2026 | **Kapsam:** 24 `any` hatası + ~20 katman ihlali + 1 `fetch()` ihlali

---

## Hedef

AGENTS.md Section 2.10 (`any` yasağı) ve Section 6.2 (katman bağımlılığı) ihlallerini sıfırlamak.

---

## Strateji: Aşamalı (Risk Bazlı)

Kritik ihlaller **3 fazda** düzeltilecek. Her faz sonunda `tsc --noEmit` + `npm run build` ile doğrulama.

| Faz | Kapsam | Risk | Dosya Sayısı |
|---|---|---|---|
| **Phase 1** | `any` tipi hataları (services + components) | Düşük | ~10 |
| **Phase 2** | `chrome.storage` katman ihlalleri → hook'lara taşı | Orta | ~7 |
| **Phase 3** | `fetch()` direkt kullanımı + doğrulama | Düşük | 1 |

---

## Phase 1: `any` Tipi Hatalarının Giderilmesi

### 1.1 — `components/KpssView.tsx` (1 hata, L119)

```diff
- const [flashcardsUniverse, setFlashcardsUniverse] = useState<any[]>(kpssOsymHistoryFlashcards);
+ const [flashcardsUniverse, setFlashcardsUniverse] = useState<FlashcardItem[]>(kpssOsymHistoryFlashcards);
```

`FlashcardItem` tipi `useState<WordReviewData[]>` ile aynı şekle sahip — `kpssSrsService.loadSrsQueue()`'den dönen `universe` alanıyla eşleşmeli. Mevcutta `QuizQuestion` veya `SRSWordWithInfo` kullanılıyor. `loadSrsQueue`'nun dönüş tipine bakıp uygun tipi seçeceğim.

### 1.2 — `components/ViewRouter.tsx` (2 hata, L89, L91)

```diff
- onUpdateTodoUrgentImportant={props.onUpdateTodoUrgentImportant as any}
- onMoveTaskDirection={props.onMoveTaskDirection as any}
+ onUpdateTodoUrgentImportant={props.onUpdateTodoUrgentImportant}
+ onMoveTaskDirection={props.onMoveTaskDirection}
```

Sorun: `EisenhowerView`'ın prop tipleri ile `ViewRouter`'ın prop tipleri uyuşmuyor. İki çözüm:
- **Tercih edilen:** `ViewRouterProps` interface'indeki callback tiplerini `EisenhowerView` ile uyumlu hale getir
- Alternatif: `EisenhowerView` props interface'ini genişlet

### 1.3 — `components/DetoxView.tsx` (1 hata, L49)

```diff
- const res = resData as Record<string, any>;
+ const res = resData as DetoxStorageData;
```

Yeni tip:
```typescript
interface DetoxStorageData {
  detox_enabled?: boolean;
  detox_blocked_sites?: string[];
  detox_end_time?: number;
}
```

### 1.4 — `components/settings/AiSettingsTab.tsx` (2 hata: L42 `any` + L92 `fetch`)

**L42 `any` düzeltmesi:**
```diff
- (syncRes: Record<string, any>) => {
+ (syncRes: { aiUserMemory?: string }) => {
```

**L92 `fetch()` → Phase 3'te** (bu dosyada iki ayrı ihlal var)

### 1.5 — `services/kpss/kpssQuizService.ts` (4 hata)

ESLint JSON çıktısı bozuk olduğu için tam satırları `grep_search` ile doğrulayıp her bir `any`/`unknown` cast'ini düzelteceğim. Görünen ihlaller:
- L67: `(osymData as { history?: any[] })` → `unknown[]` veya proper interface
- `as unknown as QuizQuestion` kalıpları → `QuizQuestion` tipine uygun `satisfies` veya explicit mapping

### 1.6 — `services/kpss/kpssQuizFlowService.ts` (4 hata)

- `KpssPastQuiz` ↔ `Record<string, unknown>` cast'leri → `KpssPastQuiz` map tipi kullanılacak

### 1.7 — `services/bistService.ts` (3 hata)

- API yanıtı `unknown` → parse edilip typed interface'e map'lenecek

### 1.8 — `services/ipoService.ts` (1 hata)

- Satır kontrol edilecek

### 1.9 — `services/vocabulary/loader.ts` (3 hata)

- `RawWord` interface'i zaten `[key: string]: unknown` kullanıyor. `as unknown as Word[]` yerine explicit mapper yazılacak.

### 1.10 — `presentation/hooks/usePomodoro.ts` (2 hata)

- Tam satırlar grep ile tespit edilip düzeltilecek.

### 1.11 — `services/errorReportService.ts` (1 hata)

- Tam satır tespit edilip düzeltilecek.

---

## Phase 2: `chrome.storage` Katman İhlallerinin Hook'lara Taşınması

> [!CAUTION]
> En riskli faz. Her dosyada mevcut davranış %100 korunmalı (Zero-Loss Refactoring Protocol, Section 5.5).

### 2.1 — `components/DetoxView.tsx` (7 çağrı)

**Yaklaşım:** `useDetox` hook'u oluştur (yeni dosya: `src/presentation/hooks/useDetox.ts`)

Taşınacaklar:
- `chrome.storage.sync.get(["detox_enabled", "detox_blocked_sites", "detox_end_time"])`
- `chrome.storage.local.get(["screen_time_stats"])`
- `chrome.storage.sync.set({ detox_blocked_sites: ... })` (3 farklı yerde)
- `chrome.storage.sync.set(settings, ...)` (2 farklı yerde)

Hook arayüzü:
```typescript
function useDetox(): {
  isEnabled: boolean;
  blockedSites: string[];
  endTime: number;
  screenTimeStats: Record<string, number>;
  setBlockedSites: (sites: string[]) => Promise<void>;
  addBlockedSite: (site: string) => Promise<void>;
  removeBlockedSite: (site: string) => Promise<void>;
  saveSettings: (settings: DetoxSettings) => Promise<void>;
  toggleEnabled: (enabled: boolean) => Promise<void>;
  loadScreenTimeStats: () => Promise<void>;
}
```

### 2.2 — `components/KpssView.tsx` (5 çağrı)

**Yaklaşım:** `useKpssSettings` hook'u oluştur veya mevcut `useSettings`'e ekle.

Taşınacaklar:
- `chrome.storage.sync.get(["kpssChartType"])` 
- `chrome.storage.sync.get(["kpssChartDays"])`
- `chrome.storage.sync.set({ kpssChartType: type })`
- `chrome.storage.sync.set({ kpssChartDays: days })`
- `chrome.storage.local.get(["kpss_past_quizzes"])`

### 2.3 — `components/Sidebar.tsx` (2 çağrı)

**Yaklaşım:** `useSidebarOrder` hook'u oluştur (yeni dosya: `src/presentation/hooks/useSidebarOrder.ts`)

Taşınacaklar:
- `chrome.storage.sync.get(["sidebarOrder"])`
- `chrome.storage.sync.set({ sidebarOrder: nextOrder })`

### 2.4 — `components/settings/AiSettingsTab.tsx` (4 çağrı)

**Yaklaşım:** `useAiSettings` hook'u oluştur (yeni dosya: `src/presentation/hooks/useAiSettings.ts`)

Taşınacaklar:
- `chrome.storage.sync.get(["aiUserMemory"])`
- `chrome.storage.onChanged.addListener/removeListener`
- `chrome.storage.sync.set({ aiUserMemory })`

### 2.5 — `components/popup/PopupVolumeTab.tsx` (2 çağrı)

**Yaklaşım:** Mevcut `useSettings` hook'una `volume` state'i ekle veya `useVolume` hook'u oluştur.

### 2.6 — `components/kpss/wiki/KpssNotesDashboard.tsx` (2 çağrı)

**Yaklaşım:** `useKpssNotes` hook'una `sidebarCollapsed` state'i ekle. Mevcut hook: `useKpssNotes`.

### 2.7 — `components/kpss/daily/KpssDailyStatsCard.tsx` (2 çağrı)

**Yaklaşım:** `useKpssChartSettings` hook'u oluştur veya mevcut `useSettings`'e ekle.

---

## Phase 3: `fetch()` İhlali + Final Doğrulama

### 3.1 — `components/settings/AiSettingsTab.tsx` L92

`fetch(url, { headers })` → `src/services/aiChatService.ts` içine `fetchAvailableModels()` fonksiyonu olarak taşı.

### 3.2 — Final Doğrulama

```bash
npx tsc --noEmit
npm run build
npx eslint src --rule "@typescript-eslint/no-explicit-any: error"
node scripts/findDeadFiles.mjs
```

---

## Open Questions

> [!IMPORTANT]
> **Phase 2 kapsamıyla ilgili karar:** 7 dosyada ~20 `chrome.storage` çağrısı var. Hepsini tek seferde mi yoksa dosya dosya mı yapalım? Hepsi birbirinden bağımsız, paralel yapılabilir. Ama riski azaltmak için **dosya dosya** ilerlemeyi öneriyorum.

> [!WARNING]
> `components/popup/PopupVolumeTab.tsx` popup context'inde çalışıyor. `useSettings` hook'u zaten var — bu hook'u popup'ta da kullanılabilecek şekilde genişletmek gerekebilir. Mevcut `useSettings` hook'unun yapısını inceleyip karar vereceğim.

---

## Tahmini İş Yükü

| Faz | Dosya | Tahmini Süre |
|---|---|---|
| Phase 1 | ~10 dosya (any düzeltme) | ~15 dk |
| Phase 2 | ~7 dosya (hook extraction) | ~30 dk |
| Phase 3 | 1 dosya (fetch taşıma) + doğrulama | ~10 dk |
| **Toplam** | | **~55 dk** |
