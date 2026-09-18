import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function ServicesPage() {
  return (
    <section className="page-section">
      <h1>Services &amp; offres</h1>
      <p>
        Trois grands domaines, accessibles selon votre type de compte et votre niveau
        d'accès (standard ou premium).
      </p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Formations</h3>
          <p>
            Parcours structurés en cours, suivi de progression et certification à la
            fin de la formation. Accès authentifié.
          </p>
          <Button to="/formations" variant="ghost">
            Voir les formations →
          </Button>
        </div>
        <div className="feature-card">
          <h3>Blog &amp; tutoriels</h3>
          <p>
            Articles publics, avec des contenus premium recommandés selon votre profil.
          </p>
          <Button to="/blog" variant="ghost">
            Lire le blog →
          </Button>
        </div>
        <div className="feature-card">
          <h3>Outils métier</h3>
          <p>
            Simulateur de crédit et générateur de facture PDF/Excel. Accès authentifié
            et selon les droits.
          </p>
          <Button to="/outils" variant="ghost">
            Voir les outils →
          </Button>
        </div>
      </div>
      <p>
        <Button to="/fonctionnalites" variant="ghost">
          Voir le détail des accès par type de compte →
        </Button>
      </p>
    </section>
  );
}
