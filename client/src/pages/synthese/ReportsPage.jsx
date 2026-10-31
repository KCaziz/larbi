import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Download, FileText, Save } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { thisMonth } from './SynthesisPage.jsx';
import CompareMonths from './CompareMonths.jsx';
import '../../components/fincludia/charts/Charts.css';
import './Synthesis.css';

// REP-01 « Rapports & téléchargement », at its own address (P8-25):
// `/app/synthese/rapports`. The last twelve months, each with its report
// (`/app/synthese/rapport/:mois`) and its downloads — CSV and spreadsheet from
// the server, PDF by printing the report.
const MONTHS = 12;

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('synthesis.reportsTitle'));
  const kept = useApi('/fin/rapport/instantanes');
  const [message, setMessage] = useState(null);
  const keptByMonth = new Map((kept.data?.instantanes ?? []).map((row) => [row.period, row]));
  const [year, month] = thisMonth().split('-').map(Number);

  async function keep(key) {
    setMessage(null);
    try {
      await api.post('/fin/rapport/instantane', { mois: key });
      setMessage(t('synthesis.keptSaved'));
      kept.reload();
    } catch {
      setMessage(t('synthesis.keptFailed'));
    }
  }
  const months = Array.from({ length: MONTHS }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - index, 1));
    return { key: date.toISOString().slice(0, 7), label: date.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
  });

  return (
    <>
      <PageHeader icon={FileText} title={t('synthesis.reportsTitle')} subtitle={t('synthesis.reportsIntro')} maxWidth={1040} />
      <div className="synthesis-page">
        <BackLink to="/app/synthese">{t('synthesis.backToSynthesis')}</BackLink>
        {message && (
          <p className="form-status" role="status">
            {message}
          </p>
        )}
        <ul className="synthesis-reports">
          {months.map((row) => (
            <li key={row.key}>
              <Link to={`/app/synthese/rapport/${row.key}`}>
                <FileText size={16} aria-hidden="true" /> {row.label}
              </Link>
              <span className="synthesis-kept">
                {keptByMonth.has(row.key) && (
                  <Link to={`/app/synthese/rapport/${row.key}?instantane=1`}>{t('synthesis.keptOn', { date: formatDate(i18n.language, keptByMonth.get(row.key).capturedAt) })}</Link>
                )}
                <button type="button" onClick={() => keep(row.key)}>
                  <Save size={14} aria-hidden="true" /> {keptByMonth.has(row.key) ? t('synthesis.keepAgain') : t('synthesis.keep')}
                </button>
              </span>
              <span className="synthesis-download">
                <Download size={16} aria-hidden="true" />
                <a href={`/api/fin/rapport/export?mois=${row.key}`} aria-label={t('synthesis.downloadAs', { format: 'CSV', month: row.label })}>
                  CSV
                </a>
                <a href={`/api/fin/rapport/export?mois=${row.key}&format=xlsx`} aria-label={t('synthesis.downloadAs', { format: 'XLSX', month: row.label })}>
                  XLSX
                </a>
              </span>
            </li>
          ))}
        </ul>
        <p className="fin-hint">{t('synthesis.pdfHint')}</p>
        <CompareMonths />
      </div>
    </>
  );
}
