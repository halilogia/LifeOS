# Final Polish & Critical Test Expansion Plan

## 1. Goal
1. Clean up 6 legacy unreferenced hook files in `src/presentation/hooks/` and remove empty `src/services/kpss/prompts` folder to achieve **0 Dead Files** (AGENTS.md Rule 6.4).
2. Add critical unit tests for core domain logic currently missing test coverage:
   - **SRS SM-2 Spaced Repetition Algorithm** (`tests/srsService.test.ts`)
   - **KPSS Net & Countdown Calculator** (`tests/kpssCalculator.test.ts`)

---

## 2. Open Questions & Review Items

> [!NOTE]
> All 18 Zustand stores in `src/presentation/store/` have been audited:
> - **Zero `any` types** (Strict Type Safety)
> - **Storage Delegation**: Repositories in `infrastructure/persistence/` handle Chrome Storage
> - **Cloud Backup Coverage**: Tested via `cloudBackup.test.ts` (100% covered)

---

## 3. Proposed Changes

### Component 1: Dead File & Folder Cleanup

#### [DELETE] [useAppConfirmActions.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useAppConfirmActions.ts)
#### [DELETE] [useAppInit.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useAppInit.ts)
#### [DELETE] [useSettings.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useSettings.ts)
#### [DELETE] [useSync.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useSync.ts)
#### [DELETE] [useTodos.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useTodos.ts)
#### [DELETE] [useUI.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/hooks/useUI.ts)
#### [DELETE] Empty Directory `src/services/kpss/prompts/`

---

### Component 2: Domain Unit Tests Expansion

#### [NEW] [srsService.test.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/tests/srsService.test.ts)
Unit tests for SM-2 Spaced Repetition algorithm:
- Initial review with quality 5 (perfect recall) → interval 1 day
- Second review with quality 4 → interval 6 days
- Hard review (quality 1-2) → reset interval to 1 day & reduce EF
- Boundary checks for minimum EF (1.3)

#### [NEW] [kpssCalculator.test.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/tests/kpssCalculator.test.ts)
Unit tests for KPSS calculation formulas:
- 4 wrong answers subtract 1 net point calculation (`correct - wrong / 4`)
- Overall net sum calculation across General Ability & General Culture subjects
- Target date countdown calculation

---

## 4. Verification Plan

### Automated Tests
- `npm run test` — verify all 51+ unit tests pass cleanly.
- `npx tsc --noEmit` — verify 0 TypeScript compilation errors.
- `npm run build` — verify production bundle build.
- `node scripts/findDeadFiles.mjs` — verify **"Toplam: 0 dosya"** output.
