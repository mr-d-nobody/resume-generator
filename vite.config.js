import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function credentialedJobApiProxy(env) {
  return {
    name: 'credentialed-job-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/jooble-jobs') && !req.url?.startsWith('/api/adzuna-jobs')) {
          next()
          return
        }

        const requestUrl = new URL(req.url, 'http://localhost')
        const keywords = requestUrl.searchParams.get('keywords') || ''
        const location = requestUrl.searchParams.get('location') || ''

        try {
          if (requestUrl.pathname === '/api/jooble-jobs') {
            const apiKey = env.JOOBLE_API_KEY
            if (!apiKey) {
              sendJson(res, 500, { error: 'Jooble credentials are not configured.' })
              return
            }

            const response = await fetch(`https://jooble.org/api/${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keywords, location, page: 1 }),
            })
            sendJson(res, response.status, await response.json())
            return
          }

          const appId = env.ADZUNA_APP_ID
          const appKey = env.ADZUNA_APP_KEY
          if (!appId || !appKey) {
            sendJson(res, 500, { error: 'Adzuna credentials are not configured.' })
            return
          }

          const params = new URLSearchParams({
            app_id: appId,
            app_key: appKey,
            results_per_page: '50',
            'content-type': 'application/json',
          })
          if (keywords) params.set('what', keywords)
          if (location) params.set('where', location)

          const country = (requestUrl.searchParams.get('country') || env.ADZUNA_COUNTRY || 'us').toLowerCase().replace(/[^a-z]/g, '')
          const response = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`)
          sendJson(res, response.status, await response.json())
        } catch (error) {
          sendJson(res, 502, { error: error?.message || 'Unable to fetch jobs.' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [credentialedJobApiProxy(env), react()],
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
