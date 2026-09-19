import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The frontend calls the same-origin `/api`; in dev Vite forwards it to
    // Express. Same origin means the httpOnly session cookie works with no
    // cross-site cookie/CORS tricks (production uses a reverse proxy the same way).
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
