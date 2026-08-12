# Refactoring God Files — Approved Revised Plan

## Summary
Refactor 4 high-complexity files (>500 lines) into modular, single-responsibility files following proejct architecture rules (`AGENTS.md` - Single Responsibility Principle, Layout Assembly Pattern, Centralized AI Config, Safe DOM Sanitization, Zero Dead Files).

## Target Files & Strategy

### 1. `src/content/quiz/quizPanel.ts` (774 lines)
Extract into `src/content/quiz/`:
- `QuizParser.ts`: Regex matchers & markdown quiz parser logic (`parseQuizMarkdown`).
- `QuizStorage.ts`: `QuizStats` interface and Chrome storage getter/setters.
- `QuizRenderer.ts`: Shadow DOM container, card rendering, navigation, and summary modal (using safe DOM `textContent`).
- `quizPanel.ts`: Coordinator (~100 lines) handling DOM MutationObserver and initializing the quiz overlay.

### 2. `src/components/kpss/map/MapBuilder.tsx` (629 lines)
Extract into `src/components/kpss/map/`:
- `mapPinUtils.ts`: Types (`MapPin`, `MapPinKind`), constants (`PIN_KINDS`), color mapping (`pinKindColor`), and block parser/serializer (`parseHaritaBlock`, `serializeHaritaBlock`).
- `MapPinFormModal.tsx`: Sub-component modal for adding/editing map pins.
- `MapPinListSidebar.tsx`: Pin listing sidebar sub-component with filter/search.
- `MapBuilder.tsx`: Thin React layout container component (~120 lines).

### 3. `src/content/detox/detoxBlocker.ts` (537 lines)
Extract into `src/content/detox/`:
- `SiteMatcher.ts`: Domain matching, time limit checkers, and blocking condition evaluators.
- `BlockerUI.ts`: Overlay DOM injection, countdown display, and motivational quote rendering (using safe DOM APIs).
- `detoxBlocker.ts`: Thin entry point fetching settings and orchestrating checking and overlay injection (~80 lines).

### 4. `src/sidepanel/useSidePanelChat.ts` (505 lines)
Extract into `src/sidepanel/`:
- `sidePanelChatStorage.ts`: Session management, chat history loading & saving to Chrome storage.
- `sidePanelSpeech.ts`: Web Speech API recognition helper function.
- `sidePanelActionRunner.ts`: Chip action handlers ("summarize", "yt_summarize", "key_takeaways", etc.) delegating to `aiChatService.ts` via `getAIConfigFromStorage()`.
- `useSidePanelChat.ts`: Clean main hook (~120 lines) coordinating state and handlers.

## Verification Plan
1. **TypeScript Type Check**: Run `npx tsc --noEmit` to ensure zero compilation errors.
2. **Production Build**: Run `npm run build` to verify Vite build success.
3. **Dead File Verification**: Run `node scripts/findDeadFiles.mjs` to ensure 0 dead files.
4. **Architecture Map Update**: Update `src/ARCHITECTURE.md` to reflect newly added modules.
