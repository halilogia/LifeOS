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
      },
    },
  },
});
