# İçindekiler Kaldırma & Wikipedia-Tarzı Bilgi Barı Revizyonu

## Özet

Tüm İçindekiler (Table of Contents) ile ilgili kodlar silinecek. Onun yerine, başlığın altına Wikipedia tarzı bir bilgi satırı eklenecek: **Ders adı · ~X dk okuma · X kelime · GG.AA.YYYY**

## Okuma Süresi Hesabı (Bilgi)

Şu an `KpssWikiReader.tsx` içinde:
```ts
const wordCount = contentText.trim().split(/\s+/).filter(Boolean).length;
const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
```
Dakikada 200 kelime varsayılıyor, en az 1 dk.

---

## Değişiklik Detayları

### 1. [MODIFY] WikiTitleHeader.tsx — İçindekileri Sil, Bilgi Barı Ekle

- `tableOfContents`, `onNavigate` prop'ları silinecek
- `useState`, `IconList` import'ları silinecek
- İçindekiler ikon butonu ve popup (~130 satır) tamamen silinecek
- Yeni prop'lar eklenecek: `subject`, `readingTimeMinutes`, `wordCount`, `updatedAt`
- Başlığın altına Wikipedia tarzı küçük gri bilgi satırı eklenecek:
  ```
  Tarih · ~2 dk okuma · 350 kelime · 04.08.2026
  ```

### 2. [MODIFY] KpssWikiReader.tsx — TOC Kodlarını Temizle, Yeni Props Geç

- `tableOfContents`, `onNavigateToc` prop'ları silinecek
- `extractHeadings` import'u silinecek
- `tableOfContents` useMemo silinecek
- `handleTocNavigate` fonksiyonu silinecek
- `WikiTitleHeader`'a yeni prop'lar (`subject`, `readingTimeMinutes`, `wordCount`, `updatedAt`) geçilecek
- `WikiInfobox` grid'den kaldırılacak (yerine bilgi barı başlıkta)
- Grid `1fr 240px` → `1fr` (tek sütun)

### 3. [MODIFY] KpssNotesDashboard.tsx — TOC Props'larını Temizle

- `tableOfContents` destructure'dan silinecek
- `handleTocNavigate` silinecek
- `KpssWikiReader`'a geçen `tableOfContents` ve `onNavigateToc` kaldırılacak

### 4. [MODIFY] useKpssNotes.ts — TOC Hesaplamasını Sil

- `tableOfContents` değişkeni ve hesaplama bloğu silinecek
- `HeadingItem` import'u kullanılmıyorsa kaldırılacak
- Return type'dan ve return object'ten `tableOfContents` çıkarılacak

### 5. [MODIFY] WikiInfobox.tsx — Okuma Süresi/Metin Boyutu/Güncelleme'yi Kaldır

- "Okuma Süresi", "Metin Boyutu", "Son Güncelleme" satırları kaldırılacak (zaten başlıkta gösterilecek)
- Sadece başlık, konu, resim, iç bağlantılar, gelen bağlantılar kalacak
- KpssWikiReader "grid"den kaldırıldığı için infobox şimdilik kullanılmayacak (ileride istenirse geri eklenebilir)

## Doğrulama

```bash
npx tsc --noEmit  # Sıfır hata
npm run build     # Başarılı build
```
