import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Correction de l'extension ngrok (.app au lieu de .dev)
    allowedHosts: ['.loca.lt', '.ngrok-free.app', '.ngrok-free.dev'], 
    
    // 2. Configuration HMR pour éviter que le rafraîchissement automatique tourne en boucle
    hmr: {
      clientPort: 443,
    },
    
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:4000',
        changeOrigin: true, // Requis pour que le serveur Express accepte la requête venant du tunnel
        secure: false
      }
    },
  },
})
