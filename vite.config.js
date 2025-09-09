import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
})
