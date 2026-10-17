import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Notice from '../ui/Notice.jsx';

// What a page reserved to 18+ shows when the server refuses it (P6-17).
//
// The server distinguishes two refusals, and they need opposite answers on
// screen — which is the whole reason it bothers to distinguish them:
//
//   adultsOnly  the account is a minor's — under 19, the age of civil
//               majority in Algeria (Code civil art. 40, confirmed by the
//               client's master referential; the project had assumed 18).
//               The function is not for them, so the notice says so AND says
//               what they keep: a refusal listing only prohibitions reads as
//               a closed door.
//   ageUnknown  the account never stated its age bracket. Deny by default is
//               right (unknown is not adult), but telling an adult only
//               "forbidden" is a dead end — so this says which field to fill
//               and links to it.
//
// Without this distinction the second case is how a rule that protects minors
// turns into a lock-out for everybody who has not finished their profile.
export default function AdultOnly({ reason }) {
  const { t } = useTranslation();
  const unknown = reason === 'ageUnknown';

  return (
    <div className="fin-adult-only">
      <Notice variant={unknown ? 'info' : 'warning'}>
        <span className="fin-adult-only-head">
          <ShieldAlert size={16} aria-hidden="true" />
          {t(unknown ? 'adultOnly.ageUnknown' : 'adultOnly.minor')}
        </span>
        {/* Un refus qui n'énumère que des interdits se lit comme une porte
            fermée. Le référentiel du client est précis sur ce qu'un compte
            jeune garde (budget réel, enveloppes, objectifs, sécurité,
            apprentissage, portefeuille fictif) : autant le dire. */}
        {!unknown && <span className="fin-adult-only-keeps">{t('adultOnly.minorKeeps')}</span>}
        {unknown && (
          <Link to="/compte/fincludia" className="fin-adult-only-link">
            {t('adultOnly.setAge')}
          </Link>
        )}
      </Notice>
    </div>
  );
}
