import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function FormationsPresentationPage() {
  return (
    <section className="page-section">
      <h1>Formations</h1>
      <p>
        Chaque formation est composée d'un nombre défini de cours. Votre progression est
        suivie cours par cours et par formation, et une certification vous est délivrée
        une fois toutes les conditions de complétion remplies.
      </p>
      <p>L'accès aux formations nécessite d'être connecté et dépend de vos droits.</p>
      <Notice variant="info">
        Le catalogue des formations, l'inscription et la lecture des cours seront
        disponibles à partir de la Phase 2 (E-Learning — tâches P2-01 à P2-07).
      </Notice>
    </section>
  );
}
