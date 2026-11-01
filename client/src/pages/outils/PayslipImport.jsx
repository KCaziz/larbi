import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp } from 'lucide-react';
import { readPayslipFile } from '../../lib/payslipImport.js';
import { parsePayslip } from '../../lib/payslipParse.js';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';

// « Importer une fiche » (P8-30): a PDF or a photo of the payslip, read IN THE
// BROWSER, whose lines the person CONFIRMS — kept, corrected or dropped — before
// anything is calculated. The file is not uploaded and not kept; a file that
// cannot be read says so, and the manual entry stays exactly as it was.
const toDa = (minor) => String(minor / 100);

export default function PayslipImport({ kinds, kindLabel, onUse }) {
  const { t } = useTranslation();
  const [state, setState] = useState('idle'); // idle | reading | review | empty | failed
  const [progress, setProgress] = useState(null);
  const [rows, setRows] = useState([]);
  const [net, setNet] = useState('');
  const [period, setPeriod] = useState('');
  const [scanned, setScanned] = useState(false);

  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setState('reading');
    setProgress(null);
    try {
      const { text, scanned: isScanned } = await readPayslipFile(file, { onProgress: setProgress });
      setScanned(isScanned);
      const parsed = parsePayslip(text);
      if (parsed.candidates.length === 0) {
        setState('empty');
        return;
      }
      setRows(parsed.candidates.map((row, index) => ({ id: index, keep: row.kind !== 'unknown', kind: row.kind, label: row.label, value: toDa(row.value), ambiguous: row.ambiguous })));
      setNet(parsed.declaredNet === null ? '' : toDa(parsed.declaredNet));
      setPeriod(parsed.period ?? '');
      setState('review');
    } catch {
      setState('failed');
    }
  }

  const setRow = (id, patch) => setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  const chosen = rows.filter((row) => row.keep && row.value !== '');

  return (
    <section className="payslip-import" aria-labelledby="payslip-import-title">
      <h2 id="payslip-import-title">
        <FileUp size={18} aria-hidden="true" /> {t('payslip.import.title')}
      </h2>
      <p className="fin-hint">{t('payslip.import.privacy')}</p>
      <label htmlFor="payslip-file" className="btn btn-secondary payslip-import-pick">
        {t('payslip.import.choose')}
        <input id="payslip-file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" onChange={choose} disabled={state === 'reading'} />
      </label>

      {state === 'reading' && (
        <p role="status" className="fin-hint">
          {t('payslip.import.reading')} {progress !== null && `${Math.round(progress * 100)} %`}
        </p>
      )}
      {(state === 'empty' || state === 'failed') && (
        <Notice variant="info">{scanned ? t('payslip.import.scannedPdf') : t(state === 'empty' ? 'payslip.import.nothing' : 'payslip.import.failed')}</Notice>
      )}

      {state === 'review' && (
        <div className="payslip-import-review">
          <Notice variant="action-needed">{t('payslip.import.confirm')}</Notice>
          <table className="payslip-import-table">
            <caption className="sr-only">{t('payslip.import.title')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('payslip.import.keep')}</th>
                <th scope="col">{t('payslip.import.kind')}</th>
                <th scope="col">{t('payslip.import.label')}</th>
                <th scope="col">{t('payslip.import.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input type="checkbox" checked={row.keep} onChange={(event) => setRow(row.id, { keep: event.target.checked })} aria-label={t('payslip.import.keep')} />
                  </td>
                  <td>
                    <select value={row.kind} onChange={(event) => setRow(row.id, { kind: event.target.value })} aria-label={t('payslip.import.kind')}>
                      {kinds.map((kind) => (
                        <option key={kind.key} value={kind.key}>
                          {kindLabel(kind)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="text" value={row.label} onChange={(event) => setRow(row.id, { label: event.target.value })} maxLength={80} aria-label={t('payslip.import.label')} />
                    {row.ambiguous && <span className="fin-hint"> {t('payslip.import.ambiguous')}</span>}
                  </td>
                  <td>
                    <input type="text" inputMode="decimal" value={row.value} onChange={(event) => setRow(row.id, { value: event.target.value })} aria-label={t('payslip.import.amount')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="payslip-import-extra">
            <label htmlFor="payslip-import-net">
              {t('payslip.import.net')}
              <input id="payslip-import-net" type="text" inputMode="decimal" value={net} onChange={(event) => setNet(event.target.value)} />
            </label>
            <label htmlFor="payslip-import-period">
              {t('payslip.import.period')}
              <input id="payslip-import-period" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
            </label>
          </div>
          <div className="payslip-import-actions">
            <Button
              type="button"
              disabled={chosen.length === 0}
              onClick={() => {
                onUse({ lines: chosen.map((row) => ({ kind: row.kind, label: row.label, value: row.value })), declaredNet: net, period });
                setState('idle');
              }}
            >
              {t('payslip.import.use', { count: chosen.length })}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setState('idle')}>
              {t('payslip.import.cancel')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
