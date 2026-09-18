import './Pages.css';

const rows = [
  { domain: 'Blog & tutoriels', visitor: 'open', standard: 'open', premium: 'open' },
  { domain: 'Formations', visitor: 'locked', standard: 'open', premium: 'open' },
  { domain: 'Outils (crédit, facture)', visitor: 'locked', standard: 'open', premium: 'open' },
  { domain: 'Contenus premium', visitor: 'locked', standard: 'locked', premium: 'open' },
];

const stateLabel = { open: 'Accès', locked: 'Restreint' };

export default function FeaturesOverviewPage() {
  return (
    <section className="page-section">
      <h1>Fonctionnalités accessibles</h1>
      <p>
        L'accès à chaque domaine dépend du fait d'être connecté et, pour certains
        contenus, du niveau de votre compte (standard ou premium).
      </p>
      <table className="features-table">
        <thead>
          <tr>
            <th>Domaine</th>
            <th>Visiteur</th>
            <th>Compte standard</th>
            <th>Compte premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.domain}>
              <td>{row.domain}</td>
              <td data-state={row.visitor}>{stateLabel[row.visitor]}</td>
              <td data-state={row.standard}>{stateLabel[row.standard]}</td>
              <td data-state={row.premium}>{stateLabel[row.premium]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Ce tableau reflète les règles d'accès déjà définies pour le projet. Le contrôle
        réel est toujours appliqué côté serveur, jamais uniquement dans l'interface.
      </p>
    </section>
  );
}
