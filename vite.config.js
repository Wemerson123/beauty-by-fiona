import { defineConfig } from 'vite';

// base './' keeps every path relative, so the build works from any folder on the
// host. The build goes to docs/ and is committed: GitHub Pages (classic, branch
// main, folder /docs) serves it with no Actions workflow.
export default defineConfig({
  base: './',
  server: { port: 5184, strictPort: true, host: '127.0.0.1' },
  preview: { port: 5184, strictPort: true },
  build: { outDir: 'docs', assetsInlineLimit: 0 },
});
