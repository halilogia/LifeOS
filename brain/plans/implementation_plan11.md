# Security Audit & Hardening Plan for Life OS Chrome Extension

This plan outlines the security audit findings for the Life OS Chrome Extension and details the step-by-step implementation required to enforce zero XSS vulnerabilities, strict storage schema validation, and complete alignment with extension security standards (AGENTS.md Rules 4.2 & 4.4).

---

## Audit Summary & Findings

A comprehensive security scan was conducted across the codebase focusing on:
1. **DOM XSS Injection**:
   - `markdownRenderer.ts`: HTML entity replacement currently escapes `&`, `<`, `>`, but misses quotation marks (`"`, `'`). When markdown links `[text](url)` or images `![alt](url)` are parsed, unescaped quotes in `alt` or `url` attributes can create attribute-level XSS injection.
   - `kpssWikiService.ts`: Paragraf dipnot (footnote) URL references in `footnotes.map()` directly interpolate raw user/untrusted URL strings into HTML templates without escaping HTML entities.
   - `domAgentEngine.ts`: Line 269 renders `badge.innerHTML` with dynamic `actionLabel` strings, which can execute XSS if an action label contains raw HTML/scripts.
2. **Unvalidated JSON / Storage Schema Import (Data Integrity & Spoofing)**:
   - `todosStore.ts`: Backup import parses raw JSON and calls `chrome.storage.local.set(data)` directly without schema validation or key filtering. A corrupted or malicious JSON backup file could pollute extension storage or overwrite internal states.
   - `KpssNotesDashboard.tsx`: Notes import parses JSON and directly calls `saveKpssWikiNotes(imported)` with only an `Array.isArray` check, omitting property schema validation and string sanitization.
3. **API Credentials & CSP (Compliant)**:
   - API keys and tokens are securely stored in Chrome storage (`chrome.storage.sync` / `local`) and never hardcoded in source files.
   - Manifest V3 Content Security Policy (CSP) is strictly configured (`script-src 'self'`).
   - No `eval()` or `new Function()` calls were found in source code.

---

## User Review Required

> [!NOTE]
> All proposed security fixes maintain 100% feature compatibility and existing UI behavior while enforcing strict DOM sanitization and storage validation.

> [!IMPORTANT]
> - Backup JSON imports will now strictly validate keys and values before restoring data into `chrome.storage.local` to prevent unexpected storage corruption.
> - Markdown rendering will sanitize quotation marks and attributes to guarantee attribute XSS prevention.

---

## Open Questions

There are no blocking open questions. The recommended security hardening steps follow standard web/extension security guidelines and project rules.

---

## Proposed Changes

### Core Utils & Sanitization

#### [MODIFY] [markdownRenderer.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/utils/markdownRenderer.ts)
- Update HTML entity escaping to escape quotes (`"`, `'`) in text and attribute placeholders.
- Sanitize URLs in markdown image `src` and link `href` to only allow safe protocols (`http`, `https`, `mailto`, `tel`).

#### [MODIFY] [sanitize.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/utils/sanitize.ts)
- Ensure robust `escapeHtml` function covers `&`, `<`, `>`, `"`, and `'`.

---

### KPSS & Content Scripts Hardening

#### [MODIFY] [kpssWikiService.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/services/kpss/kpssWikiService.ts)
- Apply `escapeHtml(url)` when rendering footnote items in `footnotes.map()` before inserting them into HTML string templates.

#### [MODIFY] [domAgentEngine.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/content/agent/domAgentEngine.ts)
- Replace `badge.innerHTML = ...` with safe `badge.textContent = ...` or build badge child elements with `document.createElement`.

---

### Storage Import & Backup Validation

#### [MODIFY] [todosStore.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/presentation/store/todosStore.ts)
- Implement schema/key validation on imported backup JSON data before calling `chrome.storage.local.set()`.
- Filter out unauthorized or unknown top-level storage keys.

#### [MODIFY] [KpssNotesDashboard.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/kpss/wiki/KpssNotesDashboard.tsx)
- Add structural validation and field sanitization for imported KPSS wiki note objects before saving them to storage.

---

## Verification Plan

### Automated Build & Lint Verification
1. Run TypeScript type check:
   ```powershell
   npx tsc --noEmit
   ```
2. Run ESLint code quality check:
   ```powershell
   npx eslint src
   ```
3. Run extension build test:
   ```powershell
   npm run build
   ```

### Manual & Security Scenario Verification
1. Test markdown rendering with special characters and quotes in note titles and content (e.g. `![test" onload="alert(1)](https://example.com/img.jpg)`).
2. Test importing a backup file with invalid/unexpected fields to confirm schema validation rejects corrupt payloads gracefully without polluting `chrome.storage`.
3. Verify browser-use agent action badge display.
