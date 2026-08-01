import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

export default defineConfig({
  plugins: [
    preact(),
    {
      name: "iife-inline-plugin",
      enforce: "post",
      generateBundle(_, bundle) {
        for (const entryName of ["content.js", "background.js"]) {
          const entryChunk = bundle[entryName];
          if (!entryChunk || entryChunk.type !== "chunk") continue;

          // Collect all chunks to inline: direct imports + transitive dependencies
          const toInline: string[] = [];
          const visited = new Set<string>();
          const queue = [...entryChunk.imports].filter(
            (name) => name.startsWith("assets/") && !name.includes(".css"),
          );
          for (const name of queue) {
            if (visited.has(name)) continue;
            visited.add(name);
            toInline.push(name);
            const chunk = bundle[name];
            if (chunk && chunk.type === "chunk") {
              for (const dep of chunk.imports) {
                if (
                  !visited.has(dep) &&
                  dep.startsWith("assets/") &&
                  !dep.includes(".css")
                ) {
                  queue.push(dep);
                }
              }
            }
          }

          // Inline in reverse order (dependencies first)
          for (const impName of toInline.reverse()) {
            const impChunk = bundle[impName];
            if (!impChunk || impChunk.type !== "chunk") continue;

            // Get the chunk code and strip ALL import/export statements
            let inlineCode = impChunk.code
              .replace(
                /import\s*(?:\{[^}]*\}|[^;]+?)\s*from\s*["'][^"']+["'];?\s*/g,
                "",
              )
              .replace(/(?:^|\n)\s*export\s+/g, "\n")
              .trim();

            // Wrap in IIFE
            entryChunk.code =
              `(function(){${inlineCode}})();\n` + entryChunk.code;

            // Remove any import line referencing this chunk from entry
            const escapedName = impName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            entryChunk.code = entryChunk.code.replace(
              new RegExp(
                `import\\s*(?:\\{[^}]*\\}|[^;]+?)\\s*from\\s*["'][^"']*${escapedName}["'];?\\s*`,
                "g",
              ),
              "",
            );

            // Remove from imports list but KEEP the chunk in bundle
            entryChunk.imports = entryChunk.imports.filter(
              (i) => !visited.has(i),
            );
          }

          // Strip any remaining export/import from entry itself
          entryChunk.code = entryChunk.code
            .replace(/export\s*\{[^}]*\}\s*;?/g, "")
            .replace(/(?:^|\n)\s*export\s+/g, "\n");

          // Remove empty lines from the start
          entryChunk.code = entryChunk.code.replace(/^\s*\n+/, "");
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    modulePreload: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, "newtab.html"),
        popup: path.resolve(__dirname, "popup.html"),
        sidepanel: path.resolve(__dirname, "sidepanel.html"),
        offscreen: path.resolve(__dirname, "offscreen.html"),
        content: path.resolve(__dirname, "src/content/contentMain.ts"),
        background: path.resolve(__dirname, "src/background/backgroundMain.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") return "content.js";
          if (chunkInfo.name === "background") return "background.js";
          return "assets/[name]-[hash].js";
        },
        inlineDynamicImports: false,
      },
    },
  },
});
