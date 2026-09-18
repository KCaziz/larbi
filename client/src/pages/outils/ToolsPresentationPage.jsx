import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function ToolsPresentationPage() {
  return (
    <section className="page-section">
      <h1>Outils</h1>
      <p>Deux outils métier sont prévus pour cette première version :</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Simulateur de crédit</h3>
          <p>
            Estimation du crédit possible selon votre profil financier, calculée côté
            serveur à partir de règles bancaires fournies par le client.
          </p>
        </div>
        <div className="feature-card">
          <h3>Générateur de facture</h3>
          <p>
            Création de factures (client, prestataire, produits/services, totaux) avec
            export PDF et Excel.
          </p>
        </div>
      </div>
      <p>L'accès aux outils nécessite d'être connecté et dépend de vos droits.</p>
      <Notice variant="info">
        Les outils deviendront utilisables en Phase 4 (tâches P4-01 à P4-05), une fois
        l'authentification et les rôles en place.
      </Notice>
    </section>
  );
}
