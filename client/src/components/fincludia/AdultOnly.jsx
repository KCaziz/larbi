import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Notice from '../ui/Notice.jsx';

// What a page reserved to 18+ shows when the server refuses it (P6-17).
//
// The server distinguishes two refusals, and they need opposite answers on
// screen — which is the whole reason it bothers to distinguish them:
//
//   adultsOnly  the account is a minor's. The function is not for them, and
//               saying so plainly is the end of it: there is nothing to fix.
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
        {unknown && (
          <Link to="/compte/fincludia" className="fin-adult-only-link">
            {t('adultOnly.setAge')}
          </Link>
        )}
      </Notice>
    </div>
  );
}
