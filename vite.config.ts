import { defineConfig } from 'vite';

export default defineConfig({
  base: '/projects/strings-sim/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});
