import type { JSX } from "preact";

interface AppToggleRowProps {
  label: string;
  icon: "globe" | "bell" | "calendar" | "lock" | "info";
  enabled: boolean;
  enabledText: string;
  disabledText: string;
  onClick: () => void;
}

const ICON_PATHS: Record<AppToggleRowProps["icon"], JSX.Element> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </>
  ),
  bell: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </>
  ),
};

export function AppToggleRow({
  label,
  icon,
  enabled,
  enabledText,
  disabledText,
  onClick,
}: AppToggleRowProps) {
  return (
    <button className="settings-action-btn" onClick={onClick}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {ICON_PATHS[icon]}
      </svg>
      <span>{label}</span>
      <span
        style={{
          marginLeft: "auto",
          fontWeight: 700,
          color: enabled ? "var(--accent-color)" : "var(--text-secondary)",
        }}
      >
        {enabled ? enabledText : disabledText}
      </span>
    </button>
  );
}
