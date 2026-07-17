# ZenTodo / Life OS Chrome Extension Development Rules

This file outlines the codebase architecture, design patterns, and coding rules for the AI coding assistants working on the ZenTodo Chrome Extension workspace. Refer to these guidelines to make quick decisions, write aligned code, and avoid token-expensive directory/file scans.

---

## 1. Directory Structure & Architecture

The project is structured as a Vite-bundled modular Preact + TypeScript Chrome Extension:
* **`newtab.html`**: Entry HTML file at the root. Points to `/src/index.tsx`.
* **`src/index.tsx`**: Bootstraps and mounts the Preact `<App />` component inside `#app`.
* **`src/App.tsx`**: The main application file managing global states (active language, timezone clocks, active dashboard routing view, settings configurations, and global task mutators).
* **`src/components/`**: Modular Preact visual view panels:
  * `Sidebar.tsx`: Glassmorphic navigation menu with SVG icons.
  * `ListView.tsx` & `KanbanView.tsx`: Active tasks lists and drag-and-drop Kanban columns.
  * `NotesView.tsx`: Color cards notes taker and custom motivational quotes logs.
  * `PomodoroView.tsx`: SVG countdown timer, stopwatch, and audio alarms.
  * `WillpowerView.tsx`: Discreet self-discipline timer dashboard.
  * `HifizView.tsx` & `SrsView.tsx`: Memorization progress and vocabulary spaced repetition flashcards.
  * `CalendarView.tsx`: Completed tasks schedule grids.
  * `PrayerView.tsx`: City prayer times lookup.
  * `KpssView.tsx`: Subject checklist and Canvas daily progress charts.
  * `FreeGamesView.tsx`: Gaming deals tracker.
* **`src/core/`**:
  * [storage.ts](file:///c:/GitHub/Done/chrome-extension/src/core/storage.ts): Synced cloud storage wrappers (`chrome.storage.sync`).
  * [state.ts](file:///c:/GitHub/Done/chrome-extension/src/core/state.ts): Main in-memory states context.
  * [backup.ts](file:///c:/GitHub/Done/chrome-extension/src/core/backup.ts): JSON backup utilities.
* **`src/css/newtab/`**:
  * CSS files divided into feature-specific stylesheets (e.g. `base.css`, `sidebar.css`, `tasks.css`, etc.). Import stylesheet changes in [newtab.css](file:///c:/GitHub/Done/chrome-extension/src/newtab.css).

---

## 2. Core Implementation Rules

### 2.1 CSS & Styling
* **No Tailwind CSS**: Use vanilla CSS only.
* Write custom styles in modular, domain-specific chunks under `src/css/newtab/<feature>.css` (e.g. `pomodoro.css`, `willpower.css`, `tasks.css`).
* Respect the dark glassmorphic design system: use vibrant accents, smooth borders, and micro-interactions.

### 2.2 Preact Declarative States (No Manual DOM Queries)
* **Zero Direct DOM Queries**: Do not call `document.getElementById` or `document.querySelector` to update layouts or read values.
* Manage all UI layout modifications, inputs, modals, and visibility indicators declaratively using Preact state hooks (`useState`, `useRef`, `useEffect`).

### 2.3 Storage Management
* Use **`chrome.storage.sync`** for configurations, user lists, and study logs.
* Define get/set wrappers inside [storage.ts](file:///c:/GitHub/Done/chrome-extension/src/core/storage.ts).
* **Important**: When adding a new storage key, append its key name string to the `syncKeys` array in the `migrateLocalToSync` method of `storage.ts` so cloud sync works properly.

### 2.4 Localization (i18n)
* The extension supports English (`en`) and Turkish (`tr`).
* Define all interface strings in the `translations` object inside [i18n.ts](file:///c:/GitHub/Done/chrome-extension/src/utils/i18n.ts).
* Render localized text in TSX using the format `{translations[lang].translation_key}`.

### 2.5 View Routing & Navigation
* Dashboard routing is managed inside [App.tsx](file:///c:/GitHub/Done/chrome-extension/src/App.tsx) via the state variable `activeView`.
* To introduce a new panel, declare it under the `renderActiveViewComponent` router and wire its navigation triggers to [Sidebar.tsx](file:///c:/GitHub/Done/chrome-extension/src/components/Sidebar.tsx).

### 2.6 Path Aliases
* **Module Aliases Requirement**: Always use path alias syntax `@/` for importing internal modules (e.g. `@/core/...`, `@/components/...`, `@/utils/...`) rather than relative directory nesting references (`../../`).

### 2.7 Confirm Dialog Deprecation
* **No browser confirmations**: Do not invoke native browser `confirm()` or alert popups. Always trigger the custom declarative `<ConfirmModal />` component to obtain confirmation actions.

---

## 3. Architecture Philosophy
* Keep feature code modular and decoupled. Avoid framework-heavy states; favor clean functional programming with clear types.
* Verify TypeScript checks and compile the extension using `npm run build`. Load the output `dist/` directory into Chrome.

---

## 4. Quality, Security & Compile Compliance Rules

### 4.1 Zero Compile & Lint Error Tolerance
* **Strict Compiler Checks**: The project must always compile cleanly. Every change must be validated by running `npx tsc --noEmit` and `npx eslint src` to ensure zero compilation and linting errors.
* **Prettier Formatting Compliance**: All code must conform to Prettier formatting guidelines. Run `npx prettier --write src` to clean and unify spacing, indentation, and structure.

### 4.2 Security Audit Rules
* **DOM XSS Injection Prevention**: Never write unescaped user-entered text directly using `.innerHTML` or `dangerouslySetInnerHTML`. Always route strings through `escapeHtml()` sanitization filters before inserting them into active DOM elements in content scripts or rendering blocks.
* **Storage Schema Validation**: Validate all imported external datasets, JSON backups, or sync variables using schema validation libraries (such as Zod schemas) before writing them to Chrome storage.

### 4.3 Structured Planning
* **Planning Workflow Requirement**: Any complex task (architectural changes, multiple file edits, or security revisions) requires establishing a structured plan inside `implementation_plan.md` and waiting for user review and approval before writing code.

---

## 5. Clean Code & Clean Architecture Principles

### 5.1 Separation of Concerns (SoC)
* **Visual Components Boundaries**: Preact elements inside `src/components/` should focus strictly on UI layout representation and simple visual hooks. 
* **Business Logic Relocation**: Storage management, network fetches, calculation formulas, and state providers must reside in separate helper/service classes inside `src/core/` or `src/services/`.

### 5.2 Single Responsibility Principle (SRP)
* Keep functions, files, and classes focused on a single responsibility. Do not write monolithic components that merge layout, alarms, storage sync, and custom checkers in one massive scope.
* **Presentational Component Extraction**: Actively split large components (such as `App.tsx` or view pages) by extracting pure presentational code (HTML/JSX markup that relies only on props) into separate modular files under `src/components/` (e.g., `HeroHeader.tsx`, `FooterQuote.tsx`).

### 5.3 Immutable State Management
* Do not mutate Preact states or arrays directly (e.g. `state.push()` or `state[0] = val`). Always enforce immutable update patterns (like mapping, filtering, or spreading arrays: `[...prev, item]`) to guarantee correct reactive updates.
