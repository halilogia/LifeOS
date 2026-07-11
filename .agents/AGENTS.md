# ZenTodo / Life OS Chrome Extension Development Rules

This file outlines the codebase architecture, design patterns, and coding rules for the AI coding assistants working on the ZenTodo Chrome Extension workspace. Refer to these guidelines to make quick decisions, write aligned code, and avoid token-expensive directory/file scans.

---

## 1. Directory Structure & Architecture

The project is structured as a lightweight modular Chrome Extension:
* **`src/core/`**:
  * [storage.ts](file:///c:/GitHub/Done/chrome-extension/src/core/storage.ts): Storage adapter wrapping `chrome.storage.sync` with promises.
  * [state.ts](file:///c:/GitHub/Done/chrome-extension/src/core/state.ts): Main in-memory state tracking active language, tabs, etc.
  * [backup.ts](file:///c:/GitHub/Done/chrome-extension/src/core/backup.ts): JSON backup import and export controller.
* **`src/features/`**:
  * Contain separate domain modules handling logic and calculations (e.g., `tasks.ts`, `notes.ts`, `pomodoro.ts`, `hifiz.ts`, `calendar.ts`, `kpss.ts`, `quotes.ts`, `freeGames.ts`, `willpower.ts`).
* **`src/ui/`**:
  * [dom.ts](file:///c:/GitHub/Done/chrome-extension/src/ui/dom.ts): Central registry of DOM selector helper queries.
  * [sidebar.ts](file:///c:/GitHub/Done/chrome-extension/src/ui/sidebar.ts): Handlers for responsive menu interactions.
  * [render.ts](file:///c:/GitHub/Done/chrome-extension/src/render.ts): Visual card managers, switch views helper (`switchView`).
  * Views: Specialized screens that render dynamic layout elements (e.g. `prayerView.ts`, `srsView.ts`).
* **`src/css/newtab/`**:
  * Cascading stylesheets divided into parts (`part_1.css` to `part_12.css`).
* **`src/utils/`**:
  * [i18n.ts](file:///c:/GitHub/Done/chrome-extension/src/utils/i18n.ts): Localization dictionaries and `applyI18n` utility.
  * [utils.ts](file:///c:/GitHub/Done/chrome-extension/src/utils/utils.ts): Shared utility functions (clocks, dates, random quotes).

---

## 2. Core Implementation Rules

### 2.1 CSS & Styling
* **No Tailwind CSS**: Use vanilla CSS only.
* Write custom styles in modular chunks under `src/css/newtab/part_*.css`.
* Register any new stylesheet by adding an `@import` rule at the bottom of [newtab.css](file:///c:/GitHub/Done/chrome-extension/src/newtab.css).
* Respect the dark glassmorphic design system: use vibrant accents, smooth borders, and micro-interactions.

### 2.2 DOM Queries & Elements
* **Registry Rule**: Do not call `document.getElementById` or `document.querySelector` inside feature modules or views directly.
* Map all element queries to property functions inside [dom.ts](file:///c:/GitHub/Done/chrome-extension/src/ui/dom.ts) and access them via `elements.<elementName>()`.

### 2.3 Storage Management
* Use **`chrome.storage.sync`** for all configuration parameters, states, and user lists.
* Define get/set wrappers inside [storage.ts](file:///c:/GitHub/Done/chrome-extension/src/core/storage.ts).
* **Important**: When adding a new storage key, append its key name string to the `syncKeys` array in the `migrateLocalToSync` method of `storage.ts` so cloud sync works properly.

### 2.4 Localization (i18n)
* The extension supports English (`en`) and Turkish (`tr`).
* Define all interface strings in the `translations` object inside [i18n.ts](file:///c:/GitHub/Done/chrome-extension/src/utils/i18n.ts).
* For static markup, add `data-i18n="translation_key"` or `data-i18n-placeholder="translation_key"` attributes in [newtab.html](file:///c:/GitHub/Done/chrome-extension/src/newtab.html).
* For dynamically generated strings in JavaScript, look up values directly using `translations[state.currentLang].key`.

### 2.5 View Routing & Navigation
* To add a tab/panel:
  1. Add the view layout section in [newtab.html](file:///c:/GitHub/Done/chrome-extension/src/newtab.html) with class `view-content`.
  2. Map the active states, container sizes, and margin metrics under the `switchView` method in [render.ts](file:///c:/GitHub/Done/chrome-extension/src/render.ts).
  3. Wire the click trigger in the `navMap` dictionary in [newtab.ts](file:///c:/GitHub/Done/chrome-extension/src/newtab.ts).

---

## 3. Architecture Philosophy
* Keep feature code modular and decoupled from layout engines.
* Avoid heavy domain-driven frameworks; favor clean functional programming with clear types.
* Always compile and build with `npm run build` (or `cmd /c npm run build` on Windows) to verify types.
