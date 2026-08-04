/**
 * WikiTitleHeader.tsx
 * Ders notu başlığı — sadece başlık.
 */

interface WikiTitleHeaderProps {
  displayTitle: string;
}

export function WikiTitleHeader({ displayTitle }: WikiTitleHeaderProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--card-border)",
        paddingBottom: "14px",
        width: "100%",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: 0,
          lineHeight: 1.25,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          letterSpacing: "-0.015em",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        {displayTitle}
      </h1>
    </div>
  );
}
