import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Printer } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../entreprise/Business.css';

// P13-05, lot H (2026-11-24): the payslips of the person, in every
// organisation that linked them as an employee (ECR-0269). Read only.

export default function MyPayslipsPage() {
  const { t, i18n } = useTranslation();
  const slips = useApi('/fin/mes-bulletins');
  const [printing, setPrinting] = useState(null);
  useDocumentMeta(t('myPayslips.title'), t('myPayslips.intro'));
  const list = slips.data?.bulletins ?? [];
  return (
    <>
      <PageHeader icon={FileText} title={t('myPayslips.title')} subtitle={t('myPayslips.intro')} maxWidth={1000} />
      <div className="business-page">
        {slips.status === 'loading' && !slips.data ? (
          <LoadingState />
        ) : list.length === 0 ? (
          <p className="business-empty">{t('myPayslips.none')}</p>
        ) : (
          <ul className="business-documents">
            {list.map((s) => (
              <li key={s.id} className="business-document">
                <div className="business-document-head">
                  <strong>{s.periode}</strong>
                  <span>{s.organisation.tradeName || s.organisation.name}</span>
                  <span className="inv-muted">{t('myPayslips.net', { amount: formatAmount(i18n.language, s.net, s.organisation.currency) })}</span>
                  {s.provisoire && <span className="inv-badge">{t('myPayslips.provisional')}</span>}
                </div>
                <Button type="button" variant="ghost" onClick={() => setPrinting(s)}>
                  <Printer size={16} aria-hidden="true" />
                  {t('myPayslips.print')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {printing && <Sheet slip={printing} onDone={() => setPrinting(null)} />}
    </>
  );
}

function Sheet({ slip, onDone }) {
  const { t, i18n } = useTranslation();
  const [finish] = useState(() => onDone);
  useEffect(() => {
    document.body.classList.add('printing-document');
    const done = () => finish();
    window.addEventListener('afterprint', done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
      document.body.classList.remove('printing-document');
    };
  }, [finish]);
  const money = (v) => formatAmount(i18n.language, v, slip.organisation.currency);
  const rows = [
    ['gross', slip.gross],
    ['employeeContrib', -slip.employeeContrib],
    ['taxable', slip.taxable],
    ['irg', -slip.irg],
    ['irgIrregular', -(slip.irgIrregular ?? 0)],
    ['netDeductions', -slip.netDeductions],
  ];
  return createPortal(
    <div className="print-sheet-root">
      <article className="print-sheet" dir={i18n.dir?.() ?? 'ltr'}>
        <header className="print-head">
          <div>
            <strong className="print-org">{slip.organisation.tradeName || slip.organisation.name}</strong>
            {slip.organisation.wilaya && <div>{slip.organisation.wilaya}</div>}
          </div>
          <div className="print-title">
            <h1>{t('business.pay.printTitle')}</h1>
            <div>{slip.periode}</div>
          </div>
        </header>
        {slip.provisoire && <p className="print-draft">{t('myPayslips.provisional')}</p>}
        <section className="print-to">
          <strong>{slip.nom}</strong>
          {slip.poste && <div>{slip.poste}</div>}
          {slip.matricule && <div className="print-small">{t('business.pay.number', { n: slip.matricule })}</div>}
        </section>
        <table className="print-totals">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{t(`business.pay.lines.${k}`)}</th>
                <td>{money(v)}</td>
              </tr>
            ))}
            <tr className="print-grand">
              <th scope="row">{t('business.pay.lines.net')}</th>
              <td>{money(slip.net)}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>,
    document.body,
  );
}
