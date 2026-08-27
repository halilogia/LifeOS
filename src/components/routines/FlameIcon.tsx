/**
 * FlameIcon.tsx
 * Duolingo-inspired multi-layered gradient SVG flame component.
 * Features ignition animations, vibrant glowing gradients, and ember sparkles.
 */

interface FlameIconProps {
  isIgnited: boolean;
  isSupercharged?: boolean;
  streakCount: number;
  size?: number;
}

export function FlameIcon({
  isIgnited,
  isSupercharged = false,
  streakCount: _streakCount,
  size = 36,
}: FlameIconProps) {
  const gradientIdOuter = "flame-grad-outer";
  const gradientIdBody = "flame-grad-body";
  const gradientIdCore = "flame-grad-core";
  const gradientIdInactive = "flame-grad-inactive";

  return (
    <div
      className={`duo-flame-wrapper ${isIgnited ? "ignited" : "idle"} ${isSupercharged ? "supercharged" : ""}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Background radial halo when ignited */}
      {isIgnited && <div className="flame-glow-halo"></div>}

      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="duo-flame-svg"
      >
        <defs>
          {/* Active Outer Flame Gradient */}
          <linearGradient id={gradientIdOuter} x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4b4b" />
            <stop offset="50%" stopColor="#ff8c00" />
            <stop offset="100%" stopColor="#ff5722" />
          </linearGradient>

          {/* Active Mid Body Flame Gradient */}
          <linearGradient id={gradientIdBody} x1="18" y1="8" x2="18" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffca28" />
            <stop offset="60%" stopColor="#ff9800" />
            <stop offset="100%" stopColor="#f57c00" />
          </linearGradient>

          {/* Active Inner Core Gradient */}
          <linearGradient id={gradientIdCore} x1="18" y1="14" x2="18" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff9c4" />
            <stop offset="100%" stopColor="#ffe082" />
          </linearGradient>

          {/* Inactive Sleek Grey Gradient */}
          <linearGradient id={gradientIdInactive} x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* 1. Outer Flame Silhouette */}
        <path
          className="flame-layer-outer"
          d="M18 2.5C18 2.5 22.5 8 22.5 12C22.5 13.5 22 14.8 21.2 15.8C23.2 14.5 25.5 13.8 27.5 15.5C30.5 18 31 22.5 29.5 26.5C27.5 31.8 22.8 34 18 34C13.2 34 8.5 31.8 6.5 26.5C5 22.5 5.5 18 8.5 15.5C10.5 13.8 12.8 14.5 14.8 15.8C14 14.8 13.5 13.5 13.5 12C13.5 8 18 2.5 18 2.5Z"
          fill={isIgnited ? `url(#${gradientIdOuter})` : `url(#${gradientIdInactive})`}
        />

        {/* 2. Mid Flame Body (When Ignited) */}
        {isIgnited && (
          <path
            className="flame-layer-body"
            d="M18 9C18 9 21 13 21 16C21 17.2 20.6 18.2 20 19C21.5 18 23 17.5 24.5 19C26.5 21 26.8 24.5 25.5 27.5C24 31 21 32.5 18 32.5C15 32.5 12 31 10.5 27.5C9.2 24.5 9.5 21 11.5 19C13 17.5 14.5 18 16 19C15.4 18.2 15 17.2 15 16C15 13 18 9 18 9Z"
            fill={`url(#${gradientIdBody})`}
          />
        )}

        {/* 3. Incandescent White-Yellow Inner Core (When Ignited) */}
        {isIgnited && (
          <path
            className="flame-layer-core"
            d="M18 16.5C18 16.5 19.8 19 19.8 21C19.8 21.8 19.5 22.5 19 23C20 22.5 21 22.2 21.8 23.2C22.8 24.5 22.8 26.5 21.8 28.5C20.8 30.5 19.5 31.2 18 31.2C16.5 31.2 15.2 30.5 14.2 28.5C13.2 26.5 13.2 24.5 14.2 23.2C15 22.2 16 22.5 17 23C16.5 22.5 16.2 21.8 16.2 21C16.2 19 18 16.5 18 16.5Z"
            fill={`url(#${gradientIdCore})`}
          />
        )}

        {/* Sparks / Embers for high streaks */}
        {isSupercharged && (
          <>
            <circle cx="28" cy="8" r="1.5" fill="#ffca28" className="flame-sparkle spark-1" />
            <circle cx="8" cy="11" r="1.2" fill="#fff59d" className="flame-sparkle spark-2" />
            <circle cx="18" cy="1" r="1" fill="#ffffff" className="flame-sparkle spark-3" />
          </>
        )}
      </svg>
    </div>
  );
}
