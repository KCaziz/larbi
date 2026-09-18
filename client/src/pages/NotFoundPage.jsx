import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function NotFoundPage() {
  return (
    <section className="page-status">
      <p className="code">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <Button to="/">Retour à l'accueil</Button>
    </section>
  );
}
