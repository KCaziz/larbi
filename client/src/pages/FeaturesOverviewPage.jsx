import { useTranslation } from 'react-i18next';
import PageHeader from '../components/layout/PageHeader.jsx';
import Notice from '../components/ui/Notice.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const rows = [
  { domainKey: 'features.domains.blog', visitor: 'open', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.formations', visitor: 'locked', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.tools', visitor: 'locked', standard: 'open', premium: 'open' },
  { domainKey: 'features.domains.premium', visitor: 'locked', standard: 'locked', premium: 'open' },
];

const stateIcon = { open: '✅', locked: '🔒' };

export default function FeaturesOverviewPage() {
  const { t } = useTranslation();
  const stateLabel = { open: t('features.table.open'), locked: t('features.table.locked') };

  const renderState = (state) => (
    <td>
      <span className={`chip chip-${state}`}>
        <span aria-hidden="true">{stateIcon[state]}</span> {stateLabel[state]}
      </span>
    </td>
  );

  return (
    <>
      <PageHeader icon="🗂️" title={t('features.title')} subtitle={t('features.intro')} />

      <Section>
        <div className="table-wrap">
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
                  {renderState(row.visitor)}
                  {renderState(row.standard)}
                  {renderState(row.premium)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Notice variant="info">{t('features.footNote')}</Notice>
      </Section>
    </>
  );
}
