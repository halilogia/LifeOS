/**
 * PomoZenElementSvgs.tsx
 * Zen Bahçesi simgesel elemanları (bonsai, koi, pagoda, lantern, bamboo, pebble) SVG çizim fonksiyonu.
 */

import { PomodoroLog } from "@/types/types.js";

export function renderZenElementSvg(element: PomodoroLog["element"]) {
  switch (element) {
    case "bonsai":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M12 48h40l-4 8H16l-4-8z"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
          <rect
            x="20"
            y="56"
            width="6"
            height="3"
            rx="1.5"
            fill="rgba(255,255,255,0.15)"
          />
          <rect
            x="38"
            y="56"
            width="6"
            height="3"
            rx="1.5"
            fill="rgba(255,255,255,0.15)"
          />
          <path
            d="M32 48c0 0-4-8 1-14c5-6-2-12-2-12s-4 4-2 8c2 4-2 7-3 10c-1 3-3 8-3 8z"
            fill="#a1887f"
            stroke="#8d6e63"
            stroke-width="1.5"
          />
          <circle cx="25" cy="22" r="8" fill="rgba(129,199,132,0.85)" />
          <circle cx="36" cy="18" r="9" fill="rgba(76,175,80,0.85)" />
          <circle cx="44" cy="24" r="6.5" fill="rgba(129,199,132,0.85)" />
        </svg>
      );
    case "koi":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="rgba(129,212,250,0.1)"
            stroke="rgba(129,212,250,0.3)"
            stroke-width="1.5"
          />
          <path
            d="M22 36c4-4 12-2 16-6s4-12 4-12s-6 2-10 6s-2 12-2 12z"
            fill="#ffb74d"
            stroke="#f57c00"
            stroke-width="1.5"
          />
          <path
            d="M38 30c2-2 6-1 8-3s2-6 2-6s-3 1-5 3s-1 6-1 6z"
            fill="#e0e0e0"
            stroke="#9e9e9e"
            stroke-width="1"
          />
          <path
            d="M22 36c-2 2-6 2-6 2s1-4 3-6"
            stroke="#f57c00"
            stroke-width="1.5"
          />
        </svg>
      );
    case "pagoda":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <rect
            x="22"
            y="50"
            width="20"
            height="6"
            rx="1"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
          <path
            d="M16 46h32l-4-10H20l-4 10z"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1.5"
          />
          <path
            d="M20 34h24l-3-8H23l-3 8z"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1.5"
          />
          <path
            d="M23 24h18l-2-6H25l-2 6z"
            fill="rgba(255,255,255,0.25)"
            stroke="rgba(255,255,255,0.5)"
            stroke-width="1.5"
          />
          <line
            x1="32"
            y1="18"
            x2="32"
            y2="10"
            stroke="rgba(255,255,255,0.6)"
            stroke-width="2"
          />
        </svg>
      );
    case "lantern":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M16 26c8-4 24-4 32 0l-4-6H20l-4 6z"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1.5"
          />
          <rect
            x="22"
            y="26"
            width="20"
            height="18"
            rx="2"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
          <circle cx="32" cy="36" r="5" fill="#ffb74d" />
          <rect
            x="28"
            y="44"
            width="8"
            height="12"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
        </svg>
      );
    case "bamboo":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <rect
            x="28"
            y="10"
            width="5"
            height="12"
            rx="1"
            fill="rgba(129,199,132,0.7)"
            stroke="rgba(76,175,80,0.8)"
            stroke-width="1.5"
          />
          <rect
            x="28"
            y="24"
            width="5"
            height="12"
            rx="1"
            fill="rgba(129,199,132,0.7)"
            stroke="rgba(76,175,80,0.8)"
            stroke-width="1.5"
          />
          <rect
            x="28"
            y="38"
            width="5"
            height="12"
            rx="1"
            fill="rgba(129,199,132,0.7)"
            stroke="rgba(76,175,80,0.8)"
            stroke-width="1.5"
          />
          <path
            d="M33 16c4 0 8-3 10-6c-2 4-6 6-10 6z"
            fill="rgba(76,175,80,0.9)"
          />
          <path
            d="M28 30c-4 0-8-3-10-6c2 4 6 6 10 6z"
            fill="rgba(76,175,80,0.9)"
          />
          <path
            d="M33 44c4-1 8-4 9-8c-2 3-5 7-9 8z"
            fill="rgba(76,175,80,0.9)"
          />
        </svg>
      );
    case "pebble":
      return (
        <svg viewBox="0 0 64 64" fill="none">
          <ellipse
            cx="32"
            cy="50"
            rx="20"
            ry="8"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="1.5"
          />
          <ellipse
            cx="32"
            cy="40"
            rx="15"
            ry="6"
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1.5"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="10"
            ry="4"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.5)"
            stroke-width="1.5"
          />
        </svg>
      );
    default:
      return null;
  }
}
