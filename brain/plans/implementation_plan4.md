# KpssWiki Graph View Fix — Implementation Plan

## Sorun

Graph View ("Düşünce Ağı") her notu ayrı düğüm olarak gösteriyor ama aralarında hiç bağlantı (edge) çizmiyor. Sebep:

1. `buildKnowledgeGraph()` sadece `[[wikilink]]` bağlantılarını edge'e çeviriyor
2. `parentId` (alt not ilişkisi) tamamen yok sayılıyor — oysa kullanıcının en çok kullandığı ilişki bu
3. Dashboard'daki `KpssWikiNote[]` → `Note[]` cast'i veri kaybına neden oluyor (`parentId`, `subject` yok oluyor)

## Yapılacaklar

### 1. `GraphEdge` tipine `type` alanı ekle
**[src/services/zettelkastenEngine.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/services/zettelkastenEngine.ts#L23-L27)**

- `GraphEdge.type: "parent" | "wikilink"` eklenecek
- Parent-child kenarları = düz çizgi, yeşil renk
- Wikilink kenarları = kesik çizgi, mor renk

### 2. `buildKnowledgeGraph()` — parentId parametresi ekle
**[src/services/zettelkastenEngine.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/services/zettelkastenEngine.ts#L126-L240)**

- Yeni parametre: `parentIdMap?: Map<string, string>` (noteId → parentId)
- Her parent-child için `type: "parent"` ile edge oluşturulacak
- Mevcut wikilink edge'leri `type: "wikilink"` olarak işaretlenecek
- Subject'e göre renklendirme: `getNodeColor` zaten KPSS konularını destekliyor (tarih, coğrafya vs.)

### 3. `GraphSvgCanvas` — Edge render'ını güncelle
**[src/components/notes/GraphSvgCanvas.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/GraphSvgCanvas.tsx#L79-L111)**

- `edge.type === "parent"` → düz çizgi, `#10b981` (emerald), kalın
- `edge.type === "wikilink"` → kesik çizgi, `#a855f7` (purple), ince
- Tooltip'te parent/child bilgisi göster

### 4. `ZettelkastenGraphModal` — `parentIdMap` prop'u ekle
**[src/components/notes/ZettelkastenGraphModal.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/ZettelkastenGraphModal.tsx)**

- Opsiyonel `parentIdMap?: Map<string, string>` prop'u ekle
- `buildKnowledgeGraph`'e ilet

### 5. `KpssNotesDashboard` — cast'i düzelt, parentIdMap hesapla
**[src/components/kpss/wiki/KpssNotesDashboard.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/kpss/wiki/KpssNotesDashboard.tsx#L243-L257)**

- `notes`'ten `parentIdMap` hesapla (`n.parentId ? [n.parentId, n.id] : ...`)
- `ZettelkastenGraphModal`'a `parentIdMap` prop'unu geç
- Çirkin `as unknown as` cast'i varsa temizle

### 6. Graph Legend güncelle
**[src/components/notes/GraphLegend.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/GraphLegend.tsx)**

- "Alt Not" ve "Wikilink" için ayrı lejant satırları ekle

---

## Değişecek Dosyalar

| Dosya | Değişiklik |
|---|---|
| [zettelkastenEngine.ts](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/services/zettelkastenEngine.ts) | `GraphEdge.type`, `buildKnowledgeGraph`'e `parentIdMap` |
| [GraphSvgCanvas.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/GraphSvgCanvas.tsx) | Edge render type'a göre stil |
| [ZettelkastenGraphModal.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/ZettelkastenGraphModal.tsx) | `parentIdMap` prop |
| [KpssNotesDashboard.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/kpss/wiki/KpssNotesDashboard.tsx) | parentIdMap hesaplama |
| [GraphLegend.tsx](file:///c:/Users/emre_/Desktop/GitHub/Done/chrome-extension/src/components/notes/GraphLegend.tsx) | Lejant güncelleme |

## Doğrulama

- `npx tsc --noEmit` sıfır hata
- `npm run build` başarılı
- Graph View'da parent-child kenarları yeşil düz çizgi, wikilink'ler mor kesik çizgi olarak gözükmeli
