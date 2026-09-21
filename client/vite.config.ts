import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: {
    // `pnpm run preview` serves only the built static files (no backend), and
    // production builds now call a same-origin relative /api path (see
    // weatherService.ts) instead of an absolute URL. Proxy that path to a
    // locally-running backend (`uvicorn app.main:app --reload` in server/) so
    // preview mode still works for checking a production build locally.
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      // 'text' hides fully-covered (100%) files by default (skipFull), which
      // is exactly what we want here: the terminal table surfaces only the
      // files that still need attention. Full per-file detail, including the
      // 100% files, is in the html report.
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts', 'src/main.tsx']
    }
  }
})
