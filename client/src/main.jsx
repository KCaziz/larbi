import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Typographies de la charte officielle (P1-13) : Sora pour les titres, Inter
// pour le contenu et les données. Auto-hébergées via npm, jamais depuis un CDN
// tiers : la règle de P1-11 est qu'aucune adresse IP de visiteur ne parte vers
// un tiers pour afficher une police.
//
// IBM Plex Sans Arabic reste chargée, et ce n'est pas un reste : ni Sora ni
// Inter ne couvrent l'alphabet arabe.
import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { ThemeProvider } from './theme/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
