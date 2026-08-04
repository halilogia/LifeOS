# KPSS İkon Kütüphanesi

Merkezi ikon dosyası: **`src/components/kpss/kpssIcons.tsx`**

## Kural

KPSS modülünde **yeni ikon eklerken bu dosyaya ekle** — bileşen içine inline `<svg>` gömme.
Desen, `stock/explore/exploreIcons.tsx` ile birebirdir.

## Kullanım

```tsx
import { IconFullscreen, IconDownload } from "./kpssIcons.js";

// Varsayılan boyut 16px
<button><IconFullscreen /></button>

// Boyut / çizgi kalınlığı değiştirilebilir
<button><IconDownload size={14} strokeWidth={2.2} /></button>
```

- Tüm ikonlar **`currentColor`** kullanır → butonun `color` stilinden renk alır.
- `size` (px, varsayılan 16) ve `strokeWidth` (varsayılan 2) prop'ları opsiyoneldir.

## İkon Listesi

| İkon | Ad | Açıklama |
|------|-----|----------|
| ⛶ | `IconFullscreen` | Tam ekran (köşeler) |
| ⬇ | `IconDownload` | İndir (aşağı ok + çizgi) |
| ☰ | `IconList` | Madde işaretli liste / İçindekiler |
| 🗑 | `IconTrash` | Sil (çöp kutusu) |
| ⛓ | `IconGraph` | Ağ / graf (Zettelkasten) |
| ⓘ | `IconInfo` | Bilgi / yardım |
| ✕ | `IconClose` | Kapat (X) |
| 🔍 | `IconSearch` | Ara (büyüteç) |
| 🌳 | `IconSchema` | Şema (hiyerarşi ağacı) |
| 📍 | `IconMapPin` | Harita pin |
| ← | `IconBack` | Geri ok |
| → | `IconForward` | İleri ok |
| ▶ | `IconPlay` | Oynat |
| ⏹ | `IconStop` | Durdur |
| ↺ | `IconReset` | Sıfırla (geri sar) |
| 💾 | `IconSave` | Kaydet (disket) |
| ✏ | `IconEdit` | Düzenle (kalem) |
| 📖 | `IconBook` | Oku (kitap) |

## Yeni İkon Ekleme

1. `kpssIcons.tsx` içine `IconAdı` fonksiyonu ekle (mevcut deseni kopyala).
2. SVG path'lerini koy (`stroke="currentColor"` zorunlu — `base()` yardımcısı halleder).
3. Bu listeye satır ekle.

## Neden?

- Tutarlı görünüm (aynı stroke kalınlığı, aynı `currentColor` davranışı).
- Tek dosyadan yönetim — uyarmaya gerek kalmaz.
- Emoji yerine kaliteli SVG (emojiler platforma göre kötü görünür).
