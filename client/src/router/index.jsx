import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireRole from '../components/auth/RequireRole.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import MaintenanceGate from '../components/auth/MaintenanceGate.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AccountLayout from '../layouts/AccountLayout.jsx';
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
import DashboardPage from '../pages/account/DashboardPage.jsx';
import AccountTypePage from '../pages/account/AccountTypePage.jsx';
import PremiumAccessPage from '../pages/account/PremiumAccessPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';

// Heavy or role-specific areas are loaded on demand: public visitors never
// download the CMS (rich-text editor) or the lesson reader.
const lazyPage = (importer) => async () => ({ Component: (await importer()).default });

export const router = createBrowserRouter([
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
          { path: 'apprendre', lazy: lazyPage(() => import('../pages/apprendre/ApprendrePage.jsx')) },
          { path: 'apprendre/termes/:slug', lazy: lazyPage(() => import('../pages/apprendre/TermPage.jsx')) },
          { path: 'apprendre/guides/:slug', lazy: lazyPage(() => import('../pages/apprendre/GuidePage.jsx')) },
          { path: 'outils/comparateur', lazy: lazyPage(() => import('../pages/outils/ComparatorPage.jsx')) },
          { path: 'outils/comparateur/segments/:segment', lazy: lazyPage(() => import('../pages/outils/ComparatorSegmentPage.jsx')) },
          { path: 'outils/comparateur/:theme', lazy: lazyPage(() => import('../pages/outils/ComparatorThemePage.jsx')) },
          { path: 'outils/simulateurs', lazy: lazyPage(() => import('../pages/outils/SimulatorsPage.jsx')) },
          { path: 'outils/simulateurs/:key', lazy: lazyPage(() => import('../pages/outils/SimulatorPage.jsx')) },
          { path: 'outils/offres-emploi', lazy: lazyPage(() => import('../pages/outils/JobOffersPage.jsx')) },
          { path: 'outils/atelier', lazy: lazyPage(() => import('../pages/outils/WorkshopPage.jsx')) },
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
          {
            // Everything below needs a session (guard = convenience; the API re-checks).
            element: <RequireAuth />,
            children: [
              // Invoice generator (P4-03): the tool registry says "account required".
              { path: 'outils/facture', lazy: lazyPage(() => import('../pages/outils/InvoicePage.jsx')) },
              // E-Learning (learner side): formations are for logged-in users.
              { path: 'catalogue', lazy: lazyPage(() => import('../pages/learn/CatalogPage.jsx')) },
              { path: 'catalogue/:slug', lazy: lazyPage(() => import('../pages/learn/FormationPage.jsx')) },
              { path: 'catalogue/:slug/quiz/:quizId', lazy: lazyPage(() => import('../pages/learn/QuizPage.jsx')) },
              {
                path: 'catalogue/:slug/cours/:courseId',
                lazy: lazyPage(() => import('../pages/learn/CoursePage.jsx')),
              },
              {
                path: 'catalogue/:slug/certificat',
                lazy: lazyPage(() => import('../pages/learn/CertificatePage.jsx')),
              },
              // FINCLUDIA "Aujourd'hui" home screen and dashboards per public
              // (P6-06), screens C04 / LY02 / ET02 / JA02 / SA02.
              { path: 'aujourdhui', lazy: lazyPage(() => import('../pages/aujourdhui/TodayPage.jsx')) },
              // FINCLUDIA "Mon argent" (P6-04): synthesis, entry and history.
              { path: 'mon-argent', lazy: lazyPage(() => import('../pages/argent/MyMoneyPage.jsx')) },
              // FINCLUDIA budgets and envelopes (P6-05), screens C06 / JA03 / JA04.
              { path: 'budget', lazy: lazyPage(() => import('../pages/budget/BudgetsPage.jsx')) },
              { path: 'budget/:id', lazy: lazyPage(() => import('../pages/budget/BudgetDetailPage.jsx')) },
              // FINCLUDIA financial goals (P6-08), screens C09-C11.
              { path: 'objectifs', lazy: lazyPage(() => import('../pages/goals/GoalsPage.jsx')) },
              // FINCLUDIA debts (P6-10), screens C13-C14.
              { path: 'dettes', lazy: lazyPage(() => import('../pages/debts/DebtsPage.jsx')) },
              // FINCLUDIA safety reserve (P6-09), screen C12.
              { path: 'reserve', lazy: lazyPage(() => import('../pages/reserve/ReservePage.jsx')) },
              // FINCLUDIA real patrimony (P6-11), screens C16 / JA07.
              { path: 'patrimoine', lazy: lazyPage(() => import('../pages/patrimoine/WealthPage.jsx')) },
              // FINCLUDIA paper portfolio and investment workshop (P6-12),
              // screens C17 / EP03-EP07.
              { path: 'portefeuille', lazy: lazyPage(() => import('../pages/portefeuille/PaperPortfolioPage.jsx')) },
              // FINCLUDIA shared spaces (P6-13), screens P01 / P04 / CO01 /
              // CP01 / FA01.
              { path: 'espaces', lazy: lazyPage(() => import('../pages/espaces/SpacesPage.jsx')) },
              // FINCLUDIA financial calendar and recurring expenses (P6-07),
              // screens C23 / SA03 / SA04.
              { path: 'calendrier', lazy: lazyPage(() => import('../pages/calendrier/CalendarPage.jsx')) },
              // Where the payment provider sends the buyer back (P3-09): reads the order, grants nothing.
              { path: 'paiement/retour', lazy: lazyPage(() => import('../pages/payments/PaymentReturnPage.jsx')) },
              {
                path: 'compte',
                element: <AccountLayout />,
                children: [
                  { index: true, element: <Navigate to="profil" replace /> },
                  { path: 'profil', element: <ProfilePage /> },
                  { path: 'tableau-de-bord', element: <DashboardPage /> },
                  { path: 'formations', lazy: lazyPage(() => import('../pages/account/MyFormationsPage.jsx')) },
                  { path: 'certificats', lazy: lazyPage(() => import('../pages/account/MyCertificatesPage.jsx')) },
                  { path: 'type', element: <AccountTypePage /> },
                  { path: 'premium', element: <PremiumAccessPage /> },
                  { path: 'paiements', lazy: lazyPage(() => import('../pages/account/MyPaymentsPage.jsx')) },
                  { path: 'fincludia', lazy: lazyPage(() => import('../pages/account/FinProfilePage.jsx')) },
                  { path: 'categories', lazy: lazyPage(() => import('../pages/account/FinCategoriesPage.jsx')) },
                  { path: 'premiers-pas', lazy: lazyPage(() => import('../pages/account/FinOnboardingPage.jsx')) },
                ],
              },
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
