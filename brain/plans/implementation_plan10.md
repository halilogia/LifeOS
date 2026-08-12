# ZenTodo Chrome Extension Optimizasyon ve Performans İyileştirme Planı

Bu plan, ZenTodo eklentisinin sekme açılış hızını (NewTab load speed), derleme yapılandırmasını (Vite bundle splitting) ve dosya/mimari hijyenini optimize etmek için hazırlanmıştır.

## User Review Required

> [!NOTE]
> Bu optimizasyonlar sonucunda `newtab.js` bundle boyutu ~1.000 KB'tan ~200 KB seviyesine düşecek, diğer ağır modüller (KPSS, AI Chat, Arcade, Finans/BIST vb.) dinamik (lazy-load) olarak ihtiyaç duyulduğunda yüklenecektir. Hiçbir özellik veya iş mantığı kaybı yaşanmayacaktır (Zero Feature Loss).

## Open Questions

> [!IMPORTANT]
> Görünümler (Views) dinamik yüklenirken kısa süreli görsel geçiş için mevcut cam (glassmorphic) yükleniyor animasyon paneli kullanılacaktır. Özel bir skeleton/loader tercihiniz var mıdır?

## Proposed Changes

---

### Derleme & Modül Bölümleme (Code Splitting)

#### [MODIFY] [vite.config.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/vite.config.ts)
- `inlineDynamicImports: false` deprecated uyarısını kaldırıp Vite 8 standartlarına uygun code-splitting yapılandırmasını aktifleştirmek.

#### [MODIFY] [ViewRouter.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/ViewRouter.tsx)
- Ağır görünümleri (`KpssView`, `AIChatView`, `ArcadeView`, `PrayerView`, `BistView`, `HalkaArzView`, `FreeGamesView`, `WillpowerView`, `NotesView`, `PomodoroView`, `HifizView`, `SrsView`, `CalendarView`, `DetoxView`) `preact/compat` ile `lazy` ve `<Suspense>` mekanizmasına geçirmek.
- Ana `list` ve `kanban/eisenhower` görünümlerini hızlı ilk görünüm (instant first paint) için senkron tutmak veya optimize etmek.

---

### State & Init Optimization

#### [MODIFY] [App.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/App.tsx)
- `useEffect` içerisindeki gereksiz/redundant state aktarımlarını (`setSyncSettings`) ve çift render tetikleyicilerini temizlemek.

---

### Mimari Hijyen ve Klasör Temizliği

#### [DELETE] `src/infrastructure/persistence/migrations` (Boş Klasör)
#### [DELETE] `src/services/kpss/prompts` (Boş Klasör)
- AGENTS.md Kural 6.4 (Dead File & Empty Folder Prevention) uyarınca boş dizinleri temizlemek.

---

## Verification Plan

### Automated Tests
- `npm test`: Tüm Vitest birim testlerinin (%100 yeşil - 58 test) geçtiğini doğrulamak.
- `npx tsc --noEmit`: Sıfır TypeScript derleme hatası olduğunu doğrulamak.
- `node scripts/findDeadFiles.mjs`: 0 ölü dosya ve 0 boş klasör sonucunu teyit etmek.
- `npm run build`: `dist/assets/newtab-*.js` dosya boyutunun ~1 MB'tan ~200 KB'a düştüğünü ve Vite deprecation uyarısının kalmadığını doğrulamak.

### Manual Verification
- Chrome NewTab sekmesini açarak yapılacaklar listesinin anında yüklendiğini kontrol etmek.
- Kenar çubuğundan KPSS, AI Chat, BIST, Notlar vb. sekmelere tıklandığında dinamik parçaların sorunsuz yüklendiğini ve çalıştığını test etmek.
