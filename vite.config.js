import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    // Use VITE_BASE_PATH if defined, otherwise default to root path for Vercel.
    base: env.VITE_BASE_PATH || '/',
    server: {
      proxy: {
        '/api/himalayas-jobs': {
          target: 'https://himalayas.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/himalayas-jobs/, '/jobs/api/search'),
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
