import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Correction de l'extension ngrok (.app au lieu de .dev)
    allowedHosts: ['.loca.lt', '.ngrok-free.app', '.ngrok-free.dev'], 
    
    // 2. HMR derrière un tunnel (ngrok, localtunnel) : le navigateur arrive par
    //    le port 443 du tunnel, pas par le port local de Vite, donc le client HMR
    //    doit viser 443. Uniquement quand la variable est posée : en local le
    //    port 443 n'écoute pas, le WebSocket ne se connecte jamais et la console
    //    se remplit d'erreurs (ce qui faisait échouer les 12 parcours navigateur).
    //    Avec un tunnel : VITE_HMR_CLIENT_PORT=443 npm run dev
    ...(process.env.VITE_HMR_CLIENT_PORT ? { hmr: { clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) } } : {}),


    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:4000',
        changeOrigin: true, // Requis pour que le serveur Express accepte la requête venant du tunnel
        secure: false
      }
    },
  },
})
