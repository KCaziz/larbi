import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section className="page-status">
        <p className="code">Erreur 404</p>
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <Button to="/">Retour à l'accueil</Button>
      </section>
    );
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <section className="page-status">
      <p className="code">Erreur</p>
      <h1>Une erreur inattendue est survenue</h1>
      <p>Merci de réessayer dans un instant. Si le problème persiste, contactez le support.</p>
      <Button to="/">Retour à l'accueil</Button>
    </section>
  );
}
