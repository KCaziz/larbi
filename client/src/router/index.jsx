import { createBrowserRouter, Navigate } from 'react-router-dom';
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
      {
        path: 'compte',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Navigate to="profil" replace /> },
          { path: 'profil', element: <ProfilePage /> },
          { path: 'tableau-de-bord', element: <DashboardPage /> },
          { path: 'type', element: <AccountTypePage /> },
          { path: 'premium', element: <PremiumAccessPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
