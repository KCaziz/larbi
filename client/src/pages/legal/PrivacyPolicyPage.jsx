import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function PrivacyPolicyPage() {
  return (
    <section className="page-section legal-page">
      <h1>Politique de confidentialité</h1>
      <Notice variant="action-needed">
        Le détail exact des traitements (finalités précises, durées de conservation,
        sous-traitants, contact DPO le cas échéant) doit être validé avec le client
        avant publication. Les principes ci-dessous reflètent uniquement les règles déjà
        actées dans le cahier des charges du projet.
      </Notice>

      <h2>Données collectées</h2>
      <p>
        La plateforme limite les données personnelles collectées aux informations
        réellement nécessaires à la gestion des comptes (auto-entrepreneur, PME, PMI,
        etc.), au suivi des formations et à l'usage des outils.
      </p>

      <h2>Sécurité des comptes et des contenus</h2>
      <p>
        L'accès aux comptes, aux formations, aux contenus premium et aux médias
        propriétaires (vidéos, images, documents) est vérifié côté serveur. Les
        identifiants transmis à l'API sont systématiquement contrôlés vis-à-vis de
        l'utilisateur connecté et de ses permissions.
      </p>

      <h2>Vos droits</h2>
      <dl>
        <dt>Contact pour l'exercice de vos droits</dt>
        <dd>[à compléter par le client]</dd>
      </dl>
    </section>
  );
}
