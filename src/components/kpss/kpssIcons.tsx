/**
 * kpssIcons.tsx
 * KPSS modülü merkezi ikon kütüphanesi.
 *
 * KULLANIM:
 *   import { IconFullscreen, IconDownload, IconList } from "./kpssIcons.js";
 *   <button><IconFullscreen size={14} /></button>
 *
 * KURAL:
 *   - Yeni ikon eklerken BURAYA ekle (bileşen içine inline <svg> gömme).
 *   - Tüm ikonlar `currentColor` kullanır → butonun `color`'ından renk alır.
 *   - Boyut varsayılan 16px; `size` prop'u ile değiştirilebilir.
 * Desen: stock/explore/exploreIcons.tsx ile birebir aynı.
 */

interface IconProps {
  size?: number;
  strokeWidth?: number;
}

function base(size: number | undefined, strokeWidth: number | undefined) {
  return {
    width: size ?? 16,
    height: size ?? 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth ?? 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
}

/** Tam ekran (köşeler) */
export function IconFullscreen({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

/** İndir (aşağı ok + alt çizgi) */
export function IconDownload({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

/** Madde işaretli liste (İçindekiler) */
export function IconList({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

/** Sil (çöp kutusu) */
export function IconTrash({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/** Ağ / graf (Zettelkasten) */
export function IconGraph({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <line x1="8.5" y1="7.5" x2="15.5" y2="7.5" />
      <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
      <line x1="16.5" y1="8.5" x2="13.5" y2="15.5" />
    </svg>
  );
}

/** Bilgi (yardım, !) */
export function IconInfo({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/** Kapat (X) */
export function IconClose({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Ara (büyüteç) */
export function IconSearch({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** Şema (ağaç/hiyerarşi) */
export function IconSchema({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <rect x="3" y="3" width="7" height="6" rx="1" />
      <rect x="14" y="3" width="7" height="6" rx="1" />
      <rect x="8.5" y="15" width="7" height="6" rx="1" />
      <path d="M6.5 9v3h11V9" />
      <path d="M12 12v3" />
    </svg>
  );
}

/** Harita (pin) */
export function IconMapPin({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Geri (ok) */
export function IconBack({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/** İleri (ok) */
export function IconForward({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/** Oynat (play) */
export function IconPlay({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
    </svg>
  );
}

/** Durdur (stop) */
export function IconStop({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  );
}

/** Sıfırla (geri sar) */
export function IconReset({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/** Kaydet (disket) */
export function IconSave({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

/** Kalem (düzenle) */
export function IconEdit({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

/** Oku (kitap) */
export function IconBook({ size, strokeWidth }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
