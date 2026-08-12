# KpssNotesDashboard Bölme Planı (829 → ≤300 satır)

## Sorun

[KpssNotesDashboard.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/kpss/wiki/KpssNotesDashboard.tsx) **829 satır** — AGENTS.md §6.1 kuralı (view ≤ 300) **3 kat aşıldı**. Reader (522), Editor (154), Sidebar (303) zaten ayrı — sadece bu dosya şişkin.

## Yaklaşım: "Tuval + Parça" (AGENTS.md §5.2)

Dashboard = **tuval** (state + veri akışı). Görsel parçalar → prop tabanlı alt bileşenler. **Sıfır işlev kaybı** (§5.5): tüm handler'lar, state'ler, modallar aynen korunur.

## Mevcut Yapı (satır aralıkları)

| Bölge | Satırlar | Ne |
|---|---|---|
| State + handler'lar | 1-241 | loadNotes, selectNote, CRUD, wikilink, filteredNotes |
| Header (ikon + başlık + syncMsg) | 242-302 | MindVault ikonu, başlık |
| Grid + toolbar | 303-340 | Sidebar + not paneli |
| Toolbar butonları | 340-530 | Oku/Değiştir, Tam Ekran, Yedekle/Yükle, .md, !, Grafik |
| Reader/Editor gövdesi | 530-650 | KpssWikiReader / KpssWikiEditor |
| Zettelkasten grafik modal | 653-665 | ZettelkastenGraphModal |
| Not Alma Rehberi modal | 665-824 | KPSS kılavuz popup'ı |

## Bölme Planı

### [NEW] `src/components/kpss/wiki/KpssNotesHeader.tsx` (~90 satır)
- Props: `t`, `syncMsg`
- İçerik: MindVault ikonu + gradyan başlık + syncMsg (mevcut L242-302)

### [NEW] `src/components/kpss/wiki/KpssNotesToolbar.tsx` (~200 satır)
- Props: `t`, `notes`, `viewMode`, `notesRootRef`, `selectedNote`, + callback'ler
  (`onModeChange`, `onFullscreen`, `onDownloadMarkdown`, `onExport`, `onImport`, `onShowHelp`, `onShowGraph`)
- İçerik: Oku/Değiştir sekmeleri + Tam Ekran + Yedekle/Yükle + .md + ! + Grafik butonları (L340-530)

### [NEW] `src/components/kpss/wiki/KpssHelpModal.tsx` (~160 satır)
- Props: `t`, `onClose`
- İçerik: KPSS Not Alma Rehberi popup'ı (L665-824)

### [MODIFY] `KpssNotesDashboard.tsx` (829 → ~280 satır)
- Kalır: state'ler (notes, filters, editor...), handler'lar (loadNotes, selectNote, CRUD, wikilink, export/import, fullscreen)
- Alt bileşenleri çağırır: `<KpssNotesHeader>`, `<KpssNotesToolbar>`, `<KpssHelpModal>`
- `declare global` (mindvaultSync) → [NEW] `src/types/mindvaultSync.d.ts`'e taşınır

### [NEW] `src/types/mindvaultSync.d.ts` (~12 satır)
- `Window.mindvaultSync` global tip bildirimi (Dashboard'dan çıkarılır)

## Taşınmayan (kalır)
- `KpssWikiSidebar` (303 — limite yakın, dokunulmaz)
- `KpssWikiReader` (522 — zaten ayrı, dokunulmaz)
- `KpssWikiEditor` (154 — zaten ayrı)
- `ZettelkastenGraphModal` (ayrı dosya, zaten import)

## Değişiklik Detayları

### KpssNotesDashboard son hali (mock yapı)
```
~280 satır:
- imports (6 alt bileşen)
- state (15 satır)
- loadNotes / selectNote / CRUD (120 satır — mevcut, aynen)
- handleWikilinkClick / filteredNotes / selectedNote (40 satır)
- return: <KpssNotesHeader> <grid><Sidebar><panel><KpssNotesToolbar><Reader/Editor></panel></grid> <GraphModal> <KpssHelpModal>
```

## Doğrulama

- `npx tsc --noEmit` — 0 hata
- `npx eslint src --quiet` — 0 hata
- `npm run build` — 271 modül
- `node scripts/findDeadFiles.mjs` — 0 ölü dosya
- KpssNotesDashboard ≤ 300 satır sayılır
- ARCHITECTURE.md güncellenir (yeni dosyalar)
- Mermaid değişim diyagramı

## Riskler

- **ZettelkastenGraphModal props'ları** — mevcut `notes as any` cast'i korunur (pre-existing, dokunulmaz)
- **Fullscreen ref** — `notesRootRef` Dashboard'da kalır, Toolbar'a prop olarak geçer
- **mindvaultSync global** — .d.ts'ye taşınır, tüm importlar aynı kalır
