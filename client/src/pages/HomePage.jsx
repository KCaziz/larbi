import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Bienvenue sur Larbi</h1>
        <p>
          Formations en ligne, blog, outils métier et suivi de progression, réunis sur une
          seule plateforme, avec un espace adapté à chaque type de compte.
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

      <section className="page-section">
        <h2>Ce que propose la plateforme</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>E-Learning</h3>
            <p>
              Des formations organisées en cours, avec suivi de votre progression et
              certification à la clé une fois la formation terminée.
            </p>
            <Button to="/formations" variant="ghost">
              En savoir plus →
            </Button>
          </div>
          <div className="feature-card">
            <h3>Blog &amp; tutoriels</h3>
            <p>
              Des articles et tutoriels en accès libre, avec certains contenus réservés
              aux comptes premium.
            </p>
            <Button to="/blog" variant="ghost">
              Lire le blog →
            </Button>
          </div>
          <div className="feature-card">
            <h3>Outils métier</h3>
            <p>
              Simulateur de crédit et générateur de facture pensés pour les
              auto-entrepreneurs, PME et PMI.
            </p>
            <Button to="/outils" variant="ghost">
              Voir les outils →
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <h2>Un compte adapté à votre profil</h2>
        <p>
          Chaque compte est associé à une catégorie et à un niveau d'accès, qui
          déterminent les contenus et fonctionnalités disponibles.
        </p>
        <ul className="account-types">
          <li>Auto-entrepreneur</li>
          <li>PME</li>
          <li>PMI</li>
          <li>Standard</li>
          <li>Premium</li>
        </ul>
        <Button to="/fonctionnalites" variant="ghost">
          Voir le détail des accès par type de compte →
        </Button>
      </section>
    </>
  );
}
