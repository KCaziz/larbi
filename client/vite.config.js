import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The frontend calls the same-origin `/api`; in dev Vite forwards it to
    // Express. Same origin means the httpOnly session cookie works with no
    // cross-site cookie/CORS tricks (production uses a reverse proxy the same way).
    // VITE_API_PROXY lets the automated end-to-end tests point the site at their
    // own temporary API instead of the development one.
    proxy: {
      '/api': process.env.VITE_API_PROXY || 'http://localhost:4000',
    },
  },
})
