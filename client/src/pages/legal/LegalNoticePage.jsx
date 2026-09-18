import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function LegalNoticePage() {
  return (
    <section className="page-section legal-page">
      <h1>Mentions légales</h1>
      <Notice variant="action-needed">
        Cette page ne peut pas être publiée en l'état : les informations légales
        ci-dessous doivent être fournies et validées par le client. Aucune valeur n'a
        été inventée.
      </Notice>

      <h2>Éditeur du site</h2>
      <dl>
        <dt>Raison sociale</dt>
        <dd>[à compléter par le client]</dd>
        <dt>Forme juridique</dt>
        <dd>[à compléter]</dd>
        <dt>SIRET</dt>
        <dd>[à compléter]</dd>
        <dt>Adresse du siège</dt>
        <dd>[à compléter]</dd>
        <dt>Directeur de la publication</dt>
        <dd>[à compléter]</dd>
        <dt>Contact</dt>
        <dd>[à compléter]</dd>
      </dl>

      <h2>Hébergement</h2>
      <dl>
        <dt>Hébergeur</dt>
        <dd>[à compléter une fois l'infrastructure de production choisie — voir P5-06]</dd>
      </dl>
    </section>
  );
}
