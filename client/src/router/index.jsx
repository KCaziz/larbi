import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import AboutPage from '../pages/AboutPage.jsx';
import ServicesPage from '../pages/ServicesPage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import FaqPage from '../pages/FaqPage.jsx';
import FormationsPresentationPage from '../pages/formations/FormationsPresentationPage.jsx';
import ToolsPresentationPage from '../pages/outils/ToolsPresentationPage.jsx';
import BlogListPage from '../pages/blog/BlogListPage.jsx';
import ArticlePage from '../pages/blog/ArticlePage.jsx';
import LegalNoticePage from '../pages/legal/LegalNoticePage.jsx';
import PrivacyPolicyPage from '../pages/legal/PrivacyPolicyPage.jsx';
import PlaceholderPage from '../pages/PlaceholderPage.jsx';
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
      { path: 'contact', element: <ContactPage /> },
      { path: 'mentions-legales', element: <LegalNoticePage /> },
      { path: 'confidentialite', element: <PrivacyPolicyPage /> },
      // P1-04 pages: real content not built yet, kept out of this task's scope.
      { path: 'connexion', element: <PlaceholderPage title="Connexion" task="P1-04" /> },
      { path: 'inscription', element: <PlaceholderPage title="Inscription" task="P1-04" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
