import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireRole from '../components/auth/RequireRole.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
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
      { path: 'connexion', element: <LoginPage /> },
      { path: 'inscription', element: <RegisterPage /> },
      { path: 'mot-de-passe-oublie', element: <ForgotPasswordPage /> },
      // Public: anyone holding a certificate number can check it.
      { path: 'verification', lazy: lazyPage(() => import('../pages/certificates/VerifyCertificatePage.jsx')) },
      { path: 'verification/:number', lazy: lazyPage(() => import('../pages/certificates/VerifyCertificatePage.jsx')) },
      {
        // Everything below needs a session (guard = convenience; the API re-checks).
        element: <RequireAuth />,
        children: [
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
]);
