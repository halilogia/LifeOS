interface WikiTitleHeaderProps {
  displayTitle: string;
}

export function WikiTitleHeader({ displayTitle }: WikiTitleHeaderProps) {
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        paddingBottom: "10px",
      }}
    >
      <h1
        style={{
          fontSize: "2.1rem",
          fontWeight: 800,
          color: "#ffffff",
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          letterSpacing: "-0.015em",
        }}
      >
        {displayTitle}
      </h1>
    </div>
  );
}
