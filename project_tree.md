# Project Directory Layout & File Map

This document charts the structure of the Chrome Extension codebase.

---

## Workspace Structure

```
chrome-extension/
├── .agents/                 # Workspace customizations & development rules
│   └── AGENTS.md            # Coding standards & architectural guidelines
├── brain/                   # Development plans, checklists & knowledge logs
│   ├── CHANGELOG.md         # Release history
│   ├── README.md            # Project description & setup manual
│   ├── ROADMAP.md           # Completed & upcoming milestones
│   ├── implementation_plan.md # Architectural refactoring plan
│   ├── knowledge.md         # Reference guides (dynamic translations, Layout Assembly)
│   ├── project_tree.md      # This directory tree map
│   ├── task.md              # Phase-based tasks tracker
│   └── walkthrough.md       # Verifications & walkthrough of changes
├── dist/                    # Compiled and built Chrome Extension output
├── icons/                   # Brand and logo assets (16, 48, 128px)
├── src/                     # Source directory
│   ├── application/         # Core Use Cases & Ports (Google Sync, Settings)
│   │   ├── ports/
│   │   └── use-cases/
│   ├── components/          # Modular visual Preact panels
│   │   ├── detox/           # Sub-components for site blocking
│   │   ├── halkaarz/        # Sub-components for stock dashboard
│   │   ├── hifiz/           # Sub-components for memorizations
│   │   ├── kpss/            # Sub-components for subject planning & quizes
│   │   ├── pomodoro/        # Sub-components for focus timer & history
│   │   ├── popup/           # Sub-components for browser icon popup screen
│   │   │   ├── PopupDetoxTab.tsx
│   │   │   └── PopupPomoTab.tsx
│   │   └── settings/        # Sub-components for drawers
│   │       ├── AiSettingsTab.tsx
│   │       ├── DetoxSettingsTab.tsx
│   │       ├── GeneralSettingsTab.tsx
│   │       ├── KpssSettingsTab.tsx
│   │       └── SyncSettingsTab.tsx
│   ├── core/                # In-memory states and synced storage bindings
│   ├── css/                 # Segmented stylesheets
│   │   └── newtab/
│   ├── data/                # Vocabulary JSON decks & KPSS curricula databases
│   ├── domain/              # Entities, Value Objects & pure domain helper logic
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── value-objects/
│   ├── infrastructure/      # Concrete storage repositories & Google OAuth API clients
│   │   ├── api/
│   │   └── persistence/
│   ├── presentation/        # React UI state custom hooks & ViewModels
│   │   └── hooks/
│   │       ├── useAppInit.ts
│   │       ├── usePopup.ts  # [NEW] Popup states & clock ticks isolation hook
│   │       ├── useSettings.ts
│   │       ├── useSync.ts
│   │       ├── useTodos.ts
│   │       └── useUI.ts
│   ├── types/               # Type schemas & shared interfaces
│   ├── utils/               # Common string parsers and helpers
│   │   └── i18n.ts          # Localization dictionaries & getTranslation Proxy
│   ├── background.js        # Service worker for active domain screen-time logging
│   ├── content.js           # Injectable content script for redirect blocks
│   ├── index.tsx            # Main Newtab app bootstrap mount entrypoint
│   ├── popup.html           # Icon popup layout structure
│   ├── popup.tsx            # Icon popup coordinator & Layout Canvas
│   ├── postbuild.js         # Build asset copier
│   └── vite-env.d.ts        # TypeScript declarations
├── package.json             # Build commands & npm dependency manifests
├── tsconfig.json            # TypeScript build rules & path mappings
└── vite.config.ts           # Vite packaging configurations
```
