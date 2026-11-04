import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppTopBar from '../components/layout/AppTopBar.jsx';
import { useRevealOnAction } from '../lib/useRevealOnAction.js';
import ChatbotWidget from '../components/assistant/ChatbotWidget.jsx';
import './SharedLayout.css';

// Gestion commune (P9-02): a solution of its own, apart from the personal
// application, with its own address (`/partage`) and its own menu — one entry,
// « Mes espaces », and, inside a space, its compartments.
//
// The top bar is the SAME as Gestion budgétaire's (recette R2-03): one bar for
// both applications, its switcher (decision P9-01 point 1) saying which one is
// open. A space only ever shows what its members chose to share (the privacy
// matrix of P6-13).
export default function SharedLayout() {
  const { t } = useTranslation();
  useRevealOnAction();

  return (
    <div className="shared-shell">
      <a href="#shared-main" className="skip-link">
        {t('appNav.skipToContent')}
      </a>
      <AppTopBar app="shared" />
      <main id="shared-main" className="shared-main">
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  );
}
