import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (env.VITE_SITE_ORIGIN || 'https://voluntail.vercel.app').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-site-origin-index-html',
        transformIndexHtml(html) {
          return html.replaceAll('%SITE_ORIGIN%', siteOrigin)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1800,
    },
    server: {
      proxy: {
        '/api': { target: 'http://localhost:8080', changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/api': { target: 'http://localhost:8080', changeOrigin: true },
      },
    },
  }
})
