import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiOriginForSecurityPolicy(origin) {
  return {
    name: 'dogwalking-api-origin-csp',
    transformIndexHtml(html) {
      return html.replaceAll('__DOG_WALKING_API_ORIGIN__', origin)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5199/api'
  const apiOrigin = new URL(apiBaseUrl).origin

  return {
    plugins: [react(), tailwindcss(), apiOriginForSecurityPolicy(apiOrigin)],
  }
})
