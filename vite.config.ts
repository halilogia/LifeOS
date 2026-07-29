import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, 'newtab.html'),
        popup: path.resolve(__dirname, 'popup.html'),
        sidepanel: path.resolve(__dirname, 'sidepanel.html'),
        offscreen: path.resolve(__dirname, 'offscreen.html'),
        sandbox: path.resolve(__dirname, 'sandbox.html'),
        sandboxJs: path.resolve(__dirname, 'sandbox.js'),
        content: path.resolve(__dirname, 'src/content/contentMain.ts'),
        background: path.resolve(__dirname, 'src/background/backgroundMain.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'sandboxJs') return 'sandbox.js';
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
