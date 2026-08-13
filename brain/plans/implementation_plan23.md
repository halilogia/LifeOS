# Orta Öncelikli Refactoring Planı — 3 Dosya

## A. `kpssChartDrawer.ts` (533 satır) → Duplicate hesap + dev çizim fonksiyonu

### Sorunlar
1. **`getSubjectNets` (L38-59) + `getOverallNets` (L61-70)**: `KpssCalculatorService`'te zaten aynı mantık var (`getSubjectNets`, `getOverallNets`). **Hiçbir yer import etmiyor** (sadece `drawKpssStatsChart` içinde çağrılıyor).
2. **`drawKpssStatsChart` (L72-532)**: 460 satır tek fonksiyon — grid çizim, veri hazırlama, hedef hesaplama, **3 farklı chart render modu** (boş bar, verili bar, line) + noktalar + eksen etiketleri hepsi iç içe. Tek sorumluluk değil.

### Bölme

**[MODIFY]** `src/domain/services/KpssCalculatorService.ts`
- `getSubjectNets` ve `getOverallNets` zaten burada varsa → `kpssChartDrawer`'daki kopyalar **silinir**, import edilir.

**[NEW]** `src/utils/kpssChartCalculations.ts`
- Hedef hesaplamaları: `calculateDailyTargets()`, `calculateChartData()`, `getLastNDays()` → `drawKpssStatsChart`'ın veri hazırlama kısmı

**[NEW]** `src/utils/kpssChartRenderBar.ts`
- `renderBarChart()` — Case A (boş) + Case B (verili) bar chart çizimi

**[NEW]** `src/utils/kpssChartRenderLine.ts`
- `renderLineChart()` — Case C line chart + noktalar + etiketler

**[MODIFY]** `src/utils/kpssChartDrawer.ts`
- `drawKpssStatsChart` fonksiyonu orkestratör olur: grid çizer, hesaplamaları çağırır, `chartType`'a göre doğru render'ı çağırır. ~100 satır.

**Tüketici:** `KpssDailyStatsCard.tsx` — **değişmez** (sadece `drawKpssStatsChart` import ediyor).

---

## B. `RssView.tsx` (476 satır) → Presentational parçaların ayrılması

### Sorun
Tek tuval içinde 3 UI bloğu inline render:
- **Header** (L177-288): başlık + RSS simgesi + ekle input + yenile butonu + notify
- **Feed List Sidebar** (L311-375): feed'lerin buton listesi + favicon + okunmamış sayısı
- **Item List** (L378-470): seçili feed'in başlığı/sil butonu + item kartları

Tüm state + handler'lar `RssView`'de, alt bileşen yok.

### Bölme

**[NEW]** `src/components/rss/RssFeedList.tsx`
- Props: `feeds`, `selectedFeedId`, `unreadByFeed`, `onSelect`, `getFaviconUrl`
- Feed butonları render eder (şu anki L311-375)

**[NEW]** `src/components/rss/RssItemList.tsx`
- Props: `selectedFeed`, `items`, `onRemoveFeed`, `onOpenItem`, `formatDate`, `t`
- Item listesi render eder (şu anki L378-470)

**[MODIFY]** `src/components/RssView.tsx`
- State + handler'lar burada kalır (Add URL, Sync, Select Feed, Open Item, Remove Feed)
- Header inline kalır (basit — bölmeye değmez)
- `ssFeedList` + `RssItemList`'i çağırır, verileri props ile geçer
- `sendRssMessage` yardımcısını `src/services/rssService.ts`'e taşı (veya `rssMessageBridge` adıyla yeni dosya)

**Tüketici:** `App.tsx` view router — **değişmez**.

---

## C. `pomodoroStore.ts` (398 satır) → Zustand Slice Pattern

### Sorun
4 domain tek store'da:
- **Pomodoro Timer** (mode, time, start/pause/reset, mode change, custom time)
- **Stopwatch** (time, start/pause/reset)
- **Alarms** (list, add/toggle/delete, 1sn check timer)
- **Zen Garden** (history, plant element, showPlantModal, focusNote)
- **Init** (4 subscription + 3 setInterval timer)

### Zustand Slice Pattern

Zustand `StateCreator` deseni ile her domain kendi `slice` dosyasında yaşar, `pomodoroStore.ts` onları birleştirir. **Tek store, tek `create()` çağrısı** — state paylaşımı bozulmaz, tüketici (`usePomodoro.ts`) değişmez.

```typescript
// pomodoro/slices/timerSlice.ts
export const createTimerSlice: StateCreator<PomodoroState, [], [], TimerSlice> = (set, get) => ({
  pomoMode: "focus",
  pomoTimeLeft: 25*60,
  // ... timer state + actions
});

// pomodoro/slices/stopwatchSlice.ts
export const createStopwatchSlice: StateCreator<PomodoroState, [], [], StopwatchSlice> = (set, get) => ({...});

// pomodoro/slices/alarmSlice.ts
export const createAlarmSlice: StateCreator<PomodoroState, [], [], AlarmSlice> = (set, get) => ({...});

// pomodoro/slices/zenSlice.ts
export const createZenSlice: StateCreator<PomodoroState, [], [], ZenSlice> = (set, get) => ({...});

// pomodoroStore.ts
export const usePomodoroState = create<PomodoroState>()((...a) => ({
  ...createTimerSlice(...a),
  ...createStopwatchSlice(...a),
  ...createAlarmSlice(...a),
  ...createZenSlice(...a),
}));
```

### Slice'lar

**[NEW]** `src/presentation/store/pomodoro/timerSlice.ts`
- State: `pomoMode`, `pomoTimeLeft`, `pomoTotalTime`, `pomoRunning`, `pomoEndTime`, `customTimes`
- Actions: `handlePomoModeChange`, `handleCustomTimeChange`, `handlePomoStart`, `handlePomoPause`, `handlePomoReset`
- Init'ten: pomodoroManager subscription + pomoTimer setInterval (timer bittiğinde zen slice'a `showPlantModal` + `lastCompleted*` set eder)

**[NEW]** `src/presentation/store/pomodoro/stopwatchSlice.ts`
- State: `swTime`, `swRunning`, `swStartTime`
- Actions: `handleSwStart`, `handleSwPause`, `handleSwReset`
- Init'ten: stopwatch subscription + swTimer setInterval

**[NEW]** `src/presentation/store/pomodoro/alarmSlice.ts`
- State: `alarms`, `alarmInput`
- Actions: `handleAddAlarm`, `handleToggleAlarm`, `handleDeleteAlarm`, `setAlarmInput`
- Init'ten: alarm subscription + alarmTimer setInterval

**[NEW]** `src/presentation/store/pomodoro/zenSlice.ts`
- State: `pomodoroHistory`, `showPlantModal`, `focusNote`, `selectedElement`, `searchQuery`, `lastCompletedDuration/StartTime/EndTime`
- Actions: `handlePlantElement`, setter'lar
- Init'ten: chrome.storage.local'dan history yükleme

**[MODIFY]** `src/presentation/store/pomodoroStore.ts`
- `PomodoroState` tipi (birleşik interface) burada kalır
- 4 slice'ı import edip `create()` ile birleştirir
- `configure`, `init`, `notify` (shared utility) burada kalır
- `activeTab` UI state'i de burada kalır (timer/zen tab geçişi)

**Tüketici:** `usePomodoro.ts` facade — **hiç değişmez** (aynı selector'lar, aynı store).

---

## Tüketici Haritası

| Dosya | Tüketici(ler) | Değişiklik |
|---|---|---|
| `kpssChartDrawer.ts` | `KpssDailyStatsCard.tsx` | 0 satır (import aynı) |
| `RssView.tsx` | `App.tsx` (view router) | 0 satır |
| `pomodoroStore.ts` | `usePomodoro.ts` (facade) | 0 satır |

## Öncelik Sırası

1. **kpssChartDrawer** — en yüksek değer (kopya kod temizliği + dev fonksiyon bölme)
2. **RssView** — orta değer (presentational ekstraksiyon)
3. **pomodoroStore** — en düşük risk (Slice Pattern, tüketici hiç değişmez)

## Doğrulama

Her aşama sonunda: `npx tsc --noEmit` → `npm run build` → `prettier` → `eslint` (0 error).
Sonunda: `node scripts/findDeadFiles.mjs` → 0 dead file.
`ARCHITECTURE.md` güncelle (yeni klasörler/modüller).

> [!NOTE]
> `KpssCalculatorService`'te `getSubjectNets`/`getOverallNets` mevcut değilse sadece `kpssChartCalculations.ts`'e taşınır, silinmez. Önce kontrol edilecek.
