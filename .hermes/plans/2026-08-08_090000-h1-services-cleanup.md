# H1 Fix — Services chrome.* → Repository

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** services katmanındaki `chrome.*` çağrılarını repository/port'e taşı. Clean Arch: service = domain logic + port calls, infrastructure (chrome.*) = repository/port implementations.

---

## Audit Findings (H1)

| Service | chrome.* Usage | Lines | Fix Strategy |
|---|---|---|---|
| `src/services/errorReportService.ts` | `chrome.runtime.sendMessage` (to background) | ~200 | Create `IErrorReportPort` + `ChromeErrorReportAdapter` (infrastructure) |
| `src/services/kpss/kpssQuestionBankService.ts` | `chrome.storage.local.get/set` (question bank cache) | ~300 | Create `IQuestionBankRepository` + `ChromeStorageQuestionBankRepository` |
| `src/services/kpss/kpssSrsService.ts` | `chrome.storage.local.get/set` (SRS progress cache) | ~200 | Create `ISrsProgressRepository` + `ChromeStorageSrsProgressRepository` |

**Note:** `kpssExternalQuizService.ts` uses `chrome.tabs`/`chrome.scripting` — browser API, **NOT** storage. Stays in infrastructure as-is (content script bridge).

---

## Plan — 3 Tasks

### Task 1: Error Report Port + Adapter
1. `src/application/ports/IErrorReportPort.ts` — interface: `reportError(error: Error, context?: string): Promise<void>`
2. `src/infrastructure/adapters/ChromeErrorReportAdapter.ts` — implements port, uses `chrome.runtime.sendMessage({ type: "ERROR_REPORT", payload })`
3. `src/services/errorReportService.ts` — inject port via constructor, call `port.reportError()` instead of direct `chrome.runtime.sendMessage`

### Task 2: Question Bank Repository
1. `src/domain/repositories/IQuestionBankRepository.ts` — interface mirroring service's storage methods: `getQuestionBank()`, `setQuestionBank(data)`, `clear()`
2. `src/infrastructure/persistence/repositories/ChromeStorageQuestionBankRepository.ts` — implements interface, uses `chrome.storage.local` with keys from `keys.ts`
3. `src/services/kpss/kpssQuestionBankService.ts` — inject repo via constructor, replace direct `chrome.storage` calls with repo methods

### Task 3: SRS Progress Repository
1. `src/domain/repositories/ISrsProgressRepository.ts` — interface: `getProgress()`, `setProgress(data)`, `clear()`
2. `src/infrastructure/persistence/repositories/ChromeStorageSrsProgressRepository.ts` — implements interface
3. `src/services/kpss/kpssSrsService.ts` — inject repo, replace `chrome.storage` calls

---

## Verification Gates (after each task)

```bash
npx tsc --noEmit          # exit 0
npm run test              # all pass
npm run build             # success
npx eslint <changed files> # 0 error (warnings OK)
```

**No `console.*`, no `any`, no `chrome.*` in services after.**

---

## Constraints

- **No git commands** — user forbids
- **Consumer components untouched** — only service internals change
- **Port/Repository naming** follows existing patterns (`ITodoRepository`, `ChromeStorageTodoRepository`)
- **Storage keys** from `src/infrastructure/storage/keys.ts`
- **Factory pattern** not required — direct `new ChromeStorageXxxRepository()` in service file (like `useBist.ts` does)

---

## File Map (new files)

```
src/application/ports/
  IErrorReportPort.ts
  IQuestionBankRepository.ts
  ISrsProgressRepository.ts

src/infrastructure/adapters/
  ChromeErrorReportAdapter.ts

src/infrastructure/persistence/repositories/
  ChromeStorageQuestionBankRepository.ts
  ChromeStorageSrsProgressRepository.ts
```