import type { VNode } from "preact";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  text: string;
  style?: Record<string, string | number>;
}

/**
 * Split a string into math-aware segments and render to Preact nodes.
 * Exported so other components (e.g. KpssQuestionStem) can reuse the exact
 * KaTeX rendering pipeline without duplicating the split/render logic.
 */
export function renderRichText(
  text: string,
  renderInline: (segment: string, key: string) => VNode | string,
): (VNode | string)[] {
  if (!text) {
    return [];
  }

  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

  return parts.map((part, idx): VNode | string => {
    const key = `rt-${idx}`;
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const math = part.slice(2, -2);
      try {
        const html = katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
        return (
          <div
            key={key}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{ margin: "10px 0" }}
          />
        );
      } catch {
        return <span key={key}>{part}</span>;
      }
    } else if (part.startsWith("$") && part.endsWith("$")) {
      const math = part.slice(1, -1);
      try {
        const html = katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
        return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <span key={key}>{part}</span>;
      }
    }
    return renderInline(part, key);
  });
}

export function MathRenderer({ text, style }: MathRendererProps) {
  if (!text) {
    return null;
  }

  return (
    <span style={style}>
      {renderRichText(text, (segment, key) => (
        <span key={key}>{segment}</span>
      ))}
    </span>
  );
}
