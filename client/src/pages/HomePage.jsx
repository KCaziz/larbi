import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function HomePage() {
  return (
    <section className="hero">
      <h1>Bienvenue sur Larbi</h1>
      <p>
        Formations en ligne, blog, outils métier et suivi de progression, réunis sur une
        seule plateforme. Le contenu détaillé de cette page arrive dans une prochaine
        étape (P1-03).
      </p>
      <div className="hero-actions">
        <Button to="/formations" variant="primary">
          Découvrir les formations
        </Button>
        <Button to="/outils" variant="secondary">
          Voir les outils
        </Button>
      </div>
    </section>
  );
}
