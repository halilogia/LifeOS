import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  text: string;
  style?: Record<string, string | number>;
}

export function MathRenderer({ text, style }: MathRendererProps) {
  if (!text) {
    return null;
  }

  // Split by block math ($$...$$) first, then inline math ($...$)
  // We use a regex that captures both, maintaining the correct order.
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

  return (
    <span style={style}>
      {parts.map((part, idx) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ margin: "10px 0" }}
              />
            );
          } catch {
            return <span key={idx}>{part}</span>;
          }
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />
            );
          } catch {
            return <span key={idx}>{part}</span>;
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}
