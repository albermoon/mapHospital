import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Custom loader for .arb files
function arbLoader() {
  return {
    name: 'arb-loader',
    transform(src, id) {
      if (id.endsWith('.arb')) {
        return {
          code: `export default ${src}`,
          map: null
        }
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // The dev proxy forwards /api/google-sheets to the Google Apps Script deployment.
  // Prefer GOOGLE_SCRIPT_URL from .env (same var the Vercel function uses in prod);
  // fall back to the committed deployment URL if it is not set.
  const env = loadEnv(mode, process.cwd(), '')
  const scriptUrl =
    env.GOOGLE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycby6wrNety9fK2swp1ZzDIOqBw_XeuiLtea3Pw6CWo_SRicDkSgXvnmAWxPak5m_p6SW/exec'
  const { origin: scriptOrigin, pathname: scriptPath } = new URL(scriptUrl)

  return {
  plugins: [react(), arbLoader()],
  server: {
    proxy: {
      '/api/google-sheets': {
        target: scriptOrigin, // Google Apps Script domain
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/google-sheets/, scriptPath),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    css: true,
    reporters: [
      'default',
      ['./vitest.checklist-reporter.js', {}]
    ]
  }
  }
})
