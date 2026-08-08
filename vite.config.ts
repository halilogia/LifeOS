import { defineConfig, build as viteBuild } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

let isBuildingScripts = false;

export default defineConfig({
  plugins: [
    preact(),
    {
      name: "build-extension-scripts",
      enforce: "post",
      async closeBundle() {
        if (isBuildingScripts) return;
        isBuildingScripts = true;

        try {
          // Build background.js standalone
          await viteBuild({
            configFile: false,
            build: {
              outDir: path.resolve(__dirname, "dist"),
              emptyOutDir: false,
              minify: true,
              rollupOptions: {
                input: path.resolve(__dirname, "src/background/backgroundMain.ts"),
                output: {
                  entryFileNames: "background.js",
                  format: "iife",
                },
              },
            },
            resolve: {
              alias: {
                "@": path.resolve(__dirname, "./src"),
              },
            },
          });

          // Build content.js standalone
          await viteBuild({
            configFile: false,
            build: {
              outDir: path.resolve(__dirname, "dist"),
              emptyOutDir: false,
              minify: true,
              rollupOptions: {
                input: path.resolve(__dirname, "src/content/contentMain.ts"),
                output: {
                  entryFileNames: "content.js",
                  format: "iife",
                },
              },
            },
            resolve: {
              alias: {
                "@": path.resolve(__dirname, "./src"),
              },
            },
          });
        } finally {
          isBuildingScripts = false;
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
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});
