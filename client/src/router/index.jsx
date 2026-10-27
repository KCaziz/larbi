import { createBrowserRouter } from 'react-router-dom';
import RequireRole from '../components/auth/RequireRole.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import MaintenanceGate from '../components/auth/MaintenanceGate.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import AppRedirectWhenSignedIn from '../components/auth/AppRedirectWhenSignedIn.jsx';
import LegacyRedirect from '../components/auth/LegacyRedirect.jsx';
import { LEGACY_REDIRECTS } from '../config/appNavigation.js';
import HomePage from '../pages/HomePage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import ServicesPage from '../pages/ServicesPage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import FaqPage from '../pages/FaqPage.jsx';
import FeaturesOverviewPage from '../pages/FeaturesOverviewPage.jsx';
import FormationsPresentationPage from '../pages/formations/FormationsPresentationPage.jsx';
import ToolsPresentationPage from '../pages/outils/ToolsPresentationPage.jsx';
import BlogListPage from '../pages/blog/BlogListPage.jsx';
import ArticlePage from '../pages/blog/ArticlePage.jsx';
import NewsletterLinkPage from '../pages/newsletter/NewsletterLinkPage.jsx';
import LegalNoticePage from '../pages/legal/LegalNoticePage.jsx';
import PrivacyPolicyPage from '../pages/legal/PrivacyPolicyPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ProfilePage from '../pages/account/ProfilePage.jsx';
import AccountTypePage from '../pages/account/AccountTypePage.jsx';
import PremiumAccessPage from '../pages/account/PremiumAccessPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';

// Heavy or role-specific areas are loaded on demand: public visitors never
// download the CMS (rich-text editor) or the lesson reader.
const lazyPage = (importer) => async () => ({ Component: (await importer()).default });


// The application (P8-02): its own window, apart from the showcase site, with
// the client's final navigation. One session serves both.
const appRoutes = {
  path: '/app',
  element: <RequireAuth />,
  errorElement: <ErrorPage />,
  children: [
    {
      element: <AppLayout />,
      children: [
        { index: true, lazy: lazyPage(() => import('../pages/accueil/HomePage.jsx')) },
        // « Aujourd'hui » (tab 03B): what is left to do, from the Synthèse and the menu.
        { path: 'aujourdhui', lazy: lazyPage(() => import('../pages/aujourdhui/TodayPage.jsx')) },
        { path: 'comptes', lazy: lazyPage(() => import('../pages/comptes/AccountsPage.jsx')) },
        { path: 'synthese', lazy: lazyPage(() => import('../pages/synthese/SynthesisPage.jsx')) },
        { path: 'mouvements', lazy: lazyPage(() => import('../pages/mouvements/MovementsPage.jsx')) },
        { path: 'budgets', lazy: lazyPage(() => import('../pages/budget/BudgetsPage.jsx')) },
        { path: 'budgets/:id', lazy: lazyPage(() => import('../pages/budget/BudgetDetailPage.jsx')) },
        { path: 'calendrier', lazy: lazyPage(() => import('../pages/calendrier/CalendarPage.jsx')) },
        { path: 'objectifs', lazy: lazyPage(() => import('../pages/goals/GoalsPage.jsx')) },
        { path: 'objectifs/fonds-urgence', lazy: lazyPage(() => import('../pages/reserve/ReservePage.jsx')) },
        { path: 'dettes', lazy: lazyPage(() => import('../pages/debts/DebtsPage.jsx')) },
        { path: 'patrimoine', lazy: lazyPage(() => import('../pages/patrimoine/WealthPage.jsx')) },
        { path: 'financement', lazy: lazyPage(() => import('../pages/funding/FundingReadinessPage.jsx')) },
        { path: 'portefeuille', lazy: lazyPage(() => import('../pages/portefeuille/PaperPortfolioPage.jsx')) },
        { path: 'outils', element: <ToolsPresentationPage base="/app" /> },
        { path: 'outils/comparateur', lazy: lazyPage(() => import('../pages/outils/ComparatorPage.jsx')) },
        { path: 'outils/comparateur/adequation', lazy: lazyPage(() => import('../pages/outils/UsageFitPage.jsx')) },
        { path: 'outils/comparateur/segments/:segment', lazy: lazyPage(() => import('../pages/outils/ComparatorSegmentPage.jsx')) },
        { path: 'outils/comparateur/:theme', lazy: lazyPage(() => import('../pages/outils/ComparatorThemePage.jsx')) },
        { path: 'outils/simulateurs', lazy: lazyPage(() => import('../pages/outils/SimulatorsPage.jsx')) },
        { path: 'outils/simulateurs/:key', lazy: lazyPage(() => import('../pages/outils/SimulatorPage.jsx')) },
        { path: 'outils/offres-emploi', lazy: lazyPage(() => import('../pages/outils/JobOffersPage.jsx')) },
        { path: 'outils/atelier', lazy: lazyPage(() => import('../pages/outils/WorkshopPage.jsx')) },
        { path: 'outils/postal', lazy: lazyPage(() => import('../pages/outils/PostalReferencePage.jsx')) },
        { path: 'outils/credit', lazy: lazyPage(() => import('../pages/outils/CreditSimulatorPage.jsx')) },
        { path: 'outils/facture', lazy: lazyPage(() => import('../pages/outils/InvoicePage.jsx')) },
        { path: 'outils/explorateur', lazy: lazyPage(() => import('../pages/outils/ExplorerPage.jsx')) },
        { path: 'sante', lazy: lazyPage(() => import('../pages/sante/HealthPage.jsx')) },
        { path: 'formation', lazy: lazyPage(() => import('../pages/learn/CatalogPage.jsx')) },
        { path: 'formation/:slug', lazy: lazyPage(() => import('../pages/learn/FormationPage.jsx')) },
        { path: 'formation/:slug/quiz/:quizId', lazy: lazyPage(() => import('../pages/learn/QuizPage.jsx')) },
        { path: 'formation/:slug/cours/:courseId', lazy: lazyPage(() => import('../pages/learn/CoursePage.jsx')) },
        { path: 'formation/:slug/certificat', lazy: lazyPage(() => import('../pages/learn/CertificatePage.jsx')) },
        { path: 'apprendre', lazy: lazyPage(() => import('../pages/apprendre/ApprendrePage.jsx')) },
        { path: 'apprendre/termes/:slug', lazy: lazyPage(() => import('../pages/apprendre/TermPage.jsx')) },
        { path: 'apprendre/guides/:slug', lazy: lazyPage(() => import('../pages/apprendre/GuidePage.jsx')) },
        { path: 'progression', lazy: lazyPage(() => import('../pages/apprendre/PassportPage.jsx')) },
        { path: 'certificats', lazy: lazyPage(() => import('../pages/account/MyCertificatesPage.jsx')) },
        { path: 'notifications', lazy: lazyPage(() => import('../pages/notifications/NotificationsPage.jsx')) },
        // Gestion commune keeps its former screen, out of the menu, until it
        // gets its own application (P9-02).
        { path: 'espaces', lazy: lazyPage(() => import('../pages/espaces/SpacesPage.jsx')) },
        { path: 'entreprise', lazy: lazyPage(() => import('../pages/entreprise/BusinessPage.jsx')) },
        { path: 'parametres', lazy: lazyPage(() => import('../pages/parametres/SettingsPage.jsx')) },
        { path: 'parametres/profil', element: <ProfilePage /> },
        { path: 'parametres/fincludia', lazy: lazyPage(() => import('../pages/account/FinProfilePage.jsx')) },
        { path: 'parametres/categories', lazy: lazyPage(() => import('../pages/account/FinCategoriesPage.jsx')) },
        { path: 'parametres/premiers-pas', lazy: lazyPage(() => import('../pages/account/FinOnboardingPage.jsx')) },
        { path: 'parametres/confiance', lazy: lazyPage(() => import('../pages/trust/TrustCenterPage.jsx')) },
        { path: 'parametres/formations', lazy: lazyPage(() => import('../pages/account/MyFormationsPage.jsx')) },
        { path: 'parametres/paiements', lazy: lazyPage(() => import('../pages/account/MyPaymentsPage.jsx')) },
        { path: 'parametres/premium', element: <PremiumAccessPage /> },
        { path: 'parametres/type', element: <AccountTypePage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
};

export const router = createBrowserRouter([
  appRoutes,
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Outside the maintenance gate: an administrator needs a way in even
      // while the rest of the site is closed.
      { path: 'connexion', element: <LoginPage /> },
      {
        element: <MaintenanceGate />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'formations', element: <FormationsPresentationPage /> },
          { path: 'outils', element: <ToolsPresentationPage /> },
          { path: 'blog', element: <BlogListPage /> },
          { path: 'blog/:slug', element: <ArticlePage /> },
          { path: 'newsletter/confirmer', element: <NewsletterLinkPage mode="confirm" /> },
          { path: 'newsletter/desinscription', element: <NewsletterLinkPage mode="unsubscribe" /> },
          { path: 'a-propos', element: <AboutPage /> },
          { path: 'services', element: <ServicesPage /> },
          { path: 'faq', element: <FaqPage /> },
          { path: 'fonctionnalites', element: <FeaturesOverviewPage /> },
          { path: 'contact', element: <ContactPage /> },
          { path: 'mentions-legales', element: <LegalNoticePage /> },
          { path: 'confidentialite', element: <PrivacyPolicyPage /> },
          { path: 'inscription', element: <RegisterPage /> },
          { path: 'mot-de-passe-oublie', element: <ForgotPasswordPage /> },
          // Public: anyone holding a certificate number can check it.
          { path: 'verification', lazy: lazyPage(() => import('../pages/certificates/VerifyCertificatePage.jsx')) },
          { path: 'verification/:number', lazy: lazyPage(() => import('../pages/certificates/VerifyCertificatePage.jsx')) },
          // Public tools and learning pages (P8-02): a visitor reads them here,
          // a signed-in person is sent to the same page inside the application.
          {
            element: <AppRedirectWhenSignedIn />,
            children: [
              { path: 'apprendre', lazy: lazyPage(() => import('../pages/apprendre/ApprendrePage.jsx')) },
              { path: 'apprendre/termes/:slug', lazy: lazyPage(() => import('../pages/apprendre/TermPage.jsx')) },
              { path: 'apprendre/guides/:slug', lazy: lazyPage(() => import('../pages/apprendre/GuidePage.jsx')) },
              { path: 'outils/comparateur', lazy: lazyPage(() => import('../pages/outils/ComparatorPage.jsx')) },
              { path: 'outils/comparateur/adequation', lazy: lazyPage(() => import('../pages/outils/UsageFitPage.jsx')) },
              { path: 'outils/comparateur/segments/:segment', lazy: lazyPage(() => import('../pages/outils/ComparatorSegmentPage.jsx')) },
              { path: 'outils/comparateur/:theme', lazy: lazyPage(() => import('../pages/outils/ComparatorThemePage.jsx')) },
              { path: 'outils/simulateurs', lazy: lazyPage(() => import('../pages/outils/SimulatorsPage.jsx')) },
              { path: 'outils/simulateurs/:key', lazy: lazyPage(() => import('../pages/outils/SimulatorPage.jsx')) },
              { path: 'outils/offres-emploi', lazy: lazyPage(() => import('../pages/outils/JobOffersPage.jsx')) },
              { path: 'outils/atelier', lazy: lazyPage(() => import('../pages/outils/WorkshopPage.jsx')) },
              { path: 'outils/postal', lazy: lazyPage(() => import('../pages/outils/PostalReferencePage.jsx')) },
            ],
          },
          {
            element: <RequireAuth />,
            children: [{ path: 'paiement/retour', lazy: lazyPage(() => import('../pages/payments/PaymentReturnPage.jsx')) }],
          },
          // The former connected space: every address now lives under /app.
          ...LEGACY_REDIRECTS.map((redirect) => ({
            path: redirect.prefix ? `${redirect.from}/*` : redirect.from,
            element: <LegacyRedirect to={redirect.to} prefix={redirect.prefix} />,
          })),
          {
            element: <RequireAuth />,
            children: [
              {
                element: <RequireRole role="admin" />,
                children: [
                  {
                    path: 'admin',
                    lazy: lazyPage(() => import('../pages/admin/AdminLayout.jsx')),
                    children: [
                      { index: true, lazy: lazyPage(() => import('../pages/admin/AdminDashboardPage.jsx')) },
                      {
                        path: 'formations',
                        lazy: lazyPage(() => import('../pages/admin/formations/FormationsListPage.jsx')),
                      },
                      {
                        path: 'formations/:id',
                        lazy: lazyPage(() => import('../pages/admin/formations/FormationEditorPage.jsx')),
                      },
                      {
                        path: 'articles',
                        lazy: lazyPage(() => import('../pages/admin/articles/ArticlesListPage.jsx')),
                      },
                      {
                        path: 'articles/:id',
                        lazy: lazyPage(() => import('../pages/admin/articles/ArticleEditorPage.jsx')),
                      },
                      {
                        path: 'newsletter',
                        lazy: lazyPage(() => import('../pages/admin/newsletter/NewsletterPage.jsx')),
                      },
                      {
                        path: 'media',
                        lazy: lazyPage(() => import('../pages/admin/platform/MediaLibraryPage.jsx')),
                      },
                      {
                        path: 'certificates',
                        lazy: lazyPage(() => import('../pages/admin/platform/CertificatesAdminPage.jsx')),
                      },
                      {
                        path: 'apprendre',
                        lazy: lazyPage(() => import('../pages/admin/apprendre/GlossaryAdminPage.jsx')),
                      },
                      {
                        path: 'assistant',
                        lazy: lazyPage(() => import('../pages/admin/chatbot/ChatbotAdminPage.jsx')),
                      },
                      {
                        path: 'assistant-fincludia',
                        lazy: lazyPage(() => import('../pages/admin/finAssistant/FinAssistantAdminPage.jsx')),
                      },
                      {
                        path: 'paiements',
                        lazy: lazyPage(() => import('../pages/admin/payments/PaymentsAdminPage.jsx')),
                      },
                      {
                        path: 'comparateur',
                        lazy: lazyPage(() => import('../pages/admin/comparator/ComparatorAdminPage.jsx')),
                      },
                      {
                        path: 'users',
                        lazy: lazyPage(() => import('../pages/admin/platform/UsersPage.jsx')),
                      },
                      {
                        path: 'settings',
                        lazy: lazyPage(() => import('../pages/admin/platform/SettingsPage.jsx')),
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
