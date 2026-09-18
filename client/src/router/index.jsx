import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
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
      { path: 'formations', element: <PlaceholderPage title="Formations" task="P1-03" /> },
      { path: 'outils', element: <PlaceholderPage title="Outils" task="P1-03" /> },
      { path: 'blog', element: <PlaceholderPage title="Blog" task="P1-03" /> },
      { path: 'a-propos', element: <PlaceholderPage title="À propos" task="P1-03" /> },
      { path: 'contact', element: <PlaceholderPage title="Contact" task="P1-03" /> },
      {
        path: 'mentions-legales',
        element: <PlaceholderPage title="Mentions légales" task="P1-03" />,
      },
      {
        path: 'confidentialite',
        element: <PlaceholderPage title="Politique de confidentialité" task="P1-03" />,
      },
      { path: 'connexion', element: <PlaceholderPage title="Connexion" task="P1-04" /> },
      { path: 'inscription', element: <PlaceholderPage title="Inscription" task="P1-04" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
