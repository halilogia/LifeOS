# Critical Unit Test Suite Expansion Plan

This plan details the implementation of comprehensive unit test coverage for the critical missing areas identified in the Life OS Chrome Extension: XSS Sanitization & Security, Natural Language AI Command Parsing, and Zettelkasten Wikilink/Tag processing.

---

## Plan Overview & Goals

1. **Increase Test Coverage**: Add 3 new dedicated Vitest test suites, expanding total test count from 58 to ~80+ passing tests.
2. **Prevent Regression & Security Flaws**: Guarantee that future updates to markdown rendering, URL handling, AI command parsing, and note links do not introduce breaking bugs or security vulnerabilities.
3. **Execution**: All tests will run via `npm test` (`vitest run`) and must pass cleanly.

---

## Proposed Changes

### Test Suite Additions

#### [NEW] [tests/sanitize.test.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/tests/sanitize.test.ts)
- Test `escapeHtml()` with special characters (`&`, `<`, `>`, `"`, `'`).
- Test `escapeHtmlAttr()` attribute escaping for quotes and HTML entities.
- Test `sanitizeUrl()` blocking unsafe protocols (`javascript:`, `data:`, `vbscript:`) and allowing safe protocols (`http`, `https`, `mailto`, `tel`).
- Test `renderMarkdown()` against XSS payloads (e.g. `![alt" onload="alert(1)](url)` and `[Click](javascript:alert(1))`).

#### [NEW] [tests/aiCommandParser.test.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/tests/aiCommandParser.test.ts)
- Test natural language task extraction (e.g. `"Yarın 14:00'te KPSS Tarih çalış adında görev ekle"`).
- Test timer and pomodoro command triggers (e.g. `"25 dakika pomodoro başlat"`).
- Test date parsing for relative expressions (`"yarın"`, `"akşam"`, `"bugün"`).
- Test fallback behavior when prompt cannot be parsed into a known action.

#### [NEW] [tests/zettelkastenEngine.test.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/tests/zettelkastenEngine.test.ts)
- Test `[[Wikilink]]` title extraction from note markdown text.
- Test `#tag` hashtag extraction from note markdown text.
- Test backlink relationship generation between related notes.

---

## Verification Plan

### Automated Tests
1. Execute full Vitest test suite:
   ```powershell
   npm test
   ```
2. Verify all test files pass (10 test files total, ~80+ tests passing).
3. Run TypeScript type check and ESLint:
   ```powershell
   npx tsc --noEmit
   npx eslint src
   ```
4. Run production build:
   ```powershell
   npm run build
   ```
