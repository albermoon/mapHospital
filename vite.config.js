import { defineConfig } from 'vite'
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

export default defineConfig({
  plugins: [react(), arbLoader()],
  server: {
    proxy: {
      '/api/google-sheets': {
        target: 'https://script.google.com', // Google Apps Script domain
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api\/google-sheets/,
            '/macros/s/AKfycby6wrNety9fK2swp1ZzDIOqBw_XeuiLtea3Pw6CWo_SRicDkSgXvnmAWxPak5m_p6SW/exec'
          ),
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
})
