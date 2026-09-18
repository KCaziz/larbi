import LockedContent from '../../components/ui/LockedContent.jsx';
import '../Pages.css';

export default function PremiumAccessPage() {
  return (
    <div>
      <h1>Contenus premium</h1>
      <p>
        Certains articles, formations ou outils sont réservés aux comptes premium.
        Voici comment ils apparaîtront pour un compte qui n'y a pas accès :
      </p>
      <LockedContent title="Contenu réservé aux comptes premium">
        Passez à un compte premium pour débloquer ce contenu.
      </LockedContent>
      <p>
        Ce verrouillage est uniquement visuel : l'accès réel est toujours vérifié côté
        serveur, jamais uniquement dans le frontend.
      </p>
    </div>
  );
}
