import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/projects/strings-sim/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        simulator: resolve(__dirname, 'index.html'),
        learn: resolve(__dirname, 'learn/index.html'),
        glossary: resolve(__dirname, 'glossary/index.html'),
        implementation: resolve(__dirname, 'implementation/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
