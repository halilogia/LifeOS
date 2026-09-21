import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    server: {
      deps: {
        inline: ["zustand"],
      },
    },
  },
});
