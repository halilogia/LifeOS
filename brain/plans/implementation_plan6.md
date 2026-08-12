# Mimari İhlal Düzeltme Planı — src/data/ Klasörü (v2)

## Bulunan İhlaller

| # | İhlal | Kural |
|---|---|---|
| 1 | `src/data/` tanımsız klasör | 6.3 |
| 2 | `KpssPastExamsDashboard.tsx` direkt `@/data/` import | 6.2 |
| 3 | 13 JSON statik import → 2.8MB main bundle'da | performans |

## Çözüm

### Adım 1: `src/data/kpss/` → `src/services/kpss/data/` taşı

Nedeni: Verinin tek tüketicisi `kpssQuizService` — veri servisin yanında yaşamalı.

### Adım 2: `kpssDataRegistry.ts` — Dinamik (Lazy) Import'a çevir

**Mevcut durum (statik — kötü):**
```ts
import exam2021 from "./exam2021.json";  // 37KB main bundle'da
// ... 12 tane daha
export const KPSS_YEARLY_DATA = { "2021": exam2021, ... };
```

**Hedef (dinamik — iyi):**
```ts
const YEAR_FILES: Record<string, () => Promise<Record<string, unknown[]>>> = {
  "2021": () => import("./exam2021.json"),
  // ...
};

// Yıl listesi (statik, ~200 byte)
export const AVAILABLE_EXAM_YEARS = ["2021", "2020", ..., "2009", "tarih_arsivi"];

// Tek yıl lazy load
export async function loadExamYearData(year: string): Promise<Record<string, unknown[]>> {
  const loader = YEAR_FILES[year];
  if (!loader) throw new Error(`Unknown year: ${year}`);
  return loader();
}

// Tüm yılları lazy load
export async function loadAllExamData(): Promise<Record<string, Record<string, unknown[]>>> {
  const entries = await Promise.all(
    Object.entries(YEAR_FILES).map(async ([year, loader]) => [year, await loader()])
  );
  return Object.fromEntries(entries);
}
```

**Fayda**: 2.8MB ana bundle'dan çıkar, sadece ihtiyaç anında yüklenir. Vite otomatik code-split yapar.

### Adım 3: Tüketicileri güncelle

| Dosya | Değişiklik |
|---|---|
| `services/kpss/kpssQuizService.ts` | Senkron `KPSS_YEARLY_DATA` → asenkron `loadExamYearData()` / `loadAllExamData()` |
| `components/kpss/exams/KpssPastExamsDashboard.tsx` | **Servis üzerinden** veri al (direkt data import'u kaldır) |

`kpssService`'e `getExamYearData(year)` ve `getAvailableExamYears()` metotları eklenir. Component sadece servis çağırır.

### Adım 4: Temizlik & Doğrulama

- `src/data/` klasörünü sil
- `npx tsc --noEmit`
- `npm run build`
- `node scripts/findDeadFiles.mjs`
- `npx prettier --write src`

## Etkilenen Dosyalar

| Dosya | İşlem |
|---|---|
| `src/data/kpss/kpssDataRegistry.ts` | [DELETE] → `src/services/kpss/data/kpssDataRegistry.ts` [NEW] |
| `src/data/kpss/exam20XX.json` (17 dosya) | [MOVE] → `src/services/kpss/data/` |
| `src/services/kpss/kpssQuizService.ts` | [MODIFY] async API'ye geçiş |
| `src/services/kpss/kpssService.ts` | [MODIFY] yeni public metotlar |
| `src/components/kpss/exams/KpssPastExamsDashboard.tsx` | [MODIFY] servis üzerinden veri |
| `src/data/` | [DELETE] klasör |
| `src/ARCHITECTURE.md` | [MODIFY] güncelle |

## Risk

- **Düşük**: JSON dosyaları salt okunur, sadece taşınıyor
- `kpssQuizService` async olacak — tüm çağıranlar `await` eklemeli
- Vite code-split otomatik, ek konfigürasyon gerekmez

---

Devam etmemi onaylıyor musunuz?
