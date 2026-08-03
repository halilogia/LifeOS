const isExternal = (value: string): boolean => {
  if (!value) {
    return true;
  }
  if (/^(https?:|data:|blob:|javascript:)/i.test(value)) {
    return true;
  }
  if (value.startsWith("#")) {
    return true;
  }
  return false;
};

const joinPath = (base: string, rel: string): string => {
  let cleanRel = rel;
  if (cleanRel.startsWith("/")) {
    cleanRel = cleanRel.slice(1);
  }
  const stack = base.split("/").filter(Boolean);
  for (const part of cleanRel.split("/")) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join("/");
};

const rewriteAttributes = async (
  attrs: string,
  basePrefix: string,
  resolve: (relPath: string) => Promise<string | null>,
): Promise<string> => {
  const attrRegex = /\b([a-zA-Z\-:]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrs))) {
    result += attrs.slice(last, m.index);
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? "";
    let newValue = value;
    if (
      (name === "src" || name === "href" || name === "poster") &&
      !isExternal(value)
    ) {
      const resolved = await resolve(joinPath(basePrefix, value));
      if (resolved) {
        newValue = resolved;
      }
    } else if (name === "srcset") {
      const parts = value.split(",").map((entry) => entry.trim());
      const rewritten = await Promise.all(
        parts.map(async (entry) => {
          const [urlPart, ...rest] = entry.split(/\s+/);
          const resolved = await resolve(joinPath(basePrefix, urlPart));
          return resolved ? [resolved, ...rest].join(" ") : entry;
        }),
      );
      newValue = rewritten.join(", ");
    }
    result += `${m[1]}="${newValue.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`;
    last = attrRegex.lastIndex;
  }
  result += attrs.slice(last);
  return result;
};

export const rewriteHTML = async (
  html: string,
  basePrefix: string,
  resolve: (relPath: string) => Promise<string | null>,
): Promise<string> => {
  const tagRegex = /<(link|script|img|source|video|audio)\b([^>]*)>/gi;
  const out: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html))) {
    out.push(html.slice(lastIndex, match.index));
    const [, tag, attrs] = match;
    const newAttrs = await rewriteAttributes(attrs, basePrefix, resolve);
    out.push(`<${tag}${newAttrs}>`);
    lastIndex = tagRegex.lastIndex;
  }
  out.push(html.slice(lastIndex));
  return out.join("");
};
