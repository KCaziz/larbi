import './Pages.css';

export default function AboutPage() {
  return (
    <section className="page-section">
      <h1>À propos</h1>
      <p>
        Larbi réunit sur une seule plateforme les formations en ligne, un blog de
        tutoriels et des outils métier destinés aux indépendants et aux entreprises
        (auto-entrepreneurs, PME, PMI).
      </p>
      <h2>Notre approche</h2>
      <p>
        Chaque formation est organisée en cours, avec un suivi de progression et une
        certification délivrée une fois les conditions de complétion remplies. Les
        contenus du blog sont accessibles publiquement, certains étant réservés aux
        comptes premium selon le profil de l'utilisateur.
      </p>
      <h2>Sécurité et confidentialité</h2>
      <p>
        La protection des comptes et des contenus (vidéos, images, documents) est une
        priorité : les autorisations d'accès sont contrôlées côté serveur, et les
        contenus propriétaires ne sont jamais exposés publiquement sans vérification
        préalable.
      </p>
    </section>
  );
}
