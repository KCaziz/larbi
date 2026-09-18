import { useTranslation } from 'react-i18next';
import './Pages.css';

const rows = [
  { domainKey: 'features.domains.blog', visitor: 'open', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.formations', visitor: 'locked', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.tools', visitor: 'locked', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.premium', visitor: 'locked', standard: 'locked', premium: 'open' },
];

export default function FeaturesOverviewPage() {
  const { t } = useTranslation();
  const stateLabel = { open: t('features.table.open'), locked: t('features.table.locked') };

  return (
    <section className="page-section">
      <h1>{t('features.title')}</h1>
      <p>{t('features.intro')}</p>
      <table className="features-table">
        <thead>
          <tr>
            <th>{t('features.table.domain')}</th>
            <th>{t('features.table.visitor')}</th>
            <th>{t('features.table.standard')}</th>
            <th>{t('features.table.premium')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.domainKey}>
              <td>{t(row.domainKey)}</td>
              <td data-state={row.visitor}>{stateLabel[row.visitor]}</td>
              <td data-state={row.standard}>{stateLabel[row.standard]}</td>
              <td data-state={row.premium}>{stateLabel[row.premium]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{t('features.footNote')}</p>
    </section>
  );
}
