import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vitest config (added)
// Using ESM export with test section for Vitest

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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    css: true,
  }
})
