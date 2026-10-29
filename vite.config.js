import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page static app. JS stays on CDN imports inside app/index.html;
// Vite serves locally and copies HTML/assets on build via scripts/build.mjs.
export default defineConfig({
  base: '/status/',
  root: '.',
  publicDir: false,
  server: {
    port: 5173,
    open: '/app/',
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
    // Keep large inline module as-is; do not code-split CDN imports awkwardly
    modulePreload: false,
    cssCodeSplit: false,
  },
});
