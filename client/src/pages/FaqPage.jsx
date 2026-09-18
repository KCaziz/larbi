import './Pages.css';

const faqItems = [
  {
    question: 'Quels types de comptes existent ?',
    answer:
      "La plateforme gère plusieurs profils (auto-entrepreneur, PME, PMI, et d'autres catégories pourront être ajoutées), avec un niveau d'accès standard ou premium selon votre compte.",
  },
  {
    question: 'Quelle est la différence entre un compte standard et premium ?',
    answer:
      "Le niveau de votre compte détermine les contenus et fonctionnalités auxquels vous avez accès : certains articles, formations ou outils peuvent être réservés aux comptes premium.",
  },
  {
    question: 'Le blog est-il accessible sans compte ?',
    answer:
      "Oui, le blog est en accès public. Les formations et les outils nécessitent en revanche d'être connecté, et sont soumis à vos droits d'accès.",
  },
  {
    question: 'Comment fonctionne la certification des formations ?',
    answer:
      "Une certification est délivrée uniquement lorsque toutes les conditions de complétion d'une formation sont remplies, avec vérification effectuée côté serveur.",
  },
  {
    question: 'Mes contenus et médias sont-ils protégés ?',
    answer:
      "L'accès aux contenus propriétaires (vidéos, images, documents) est contrôlé côté serveur. Aucune solution web ne peut empêcher totalement la copie d'un contenu affiché, mais la plateforme limite fortement les possibilités de récupération directe.",
  },
];

export default function FaqPage() {
  return (
    <section className="page-section">
      <h1>Questions fréquentes</h1>
      <div className="faq-list">
        {faqItems.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
