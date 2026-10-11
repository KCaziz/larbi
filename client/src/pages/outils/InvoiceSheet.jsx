import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import { formatMoney } from '../../lib/money.js';
import { textDirection } from '../../lib/contentLanguage.js';

// The invoice as the server computed it, laid out for paper (P4-03). Only the
// server's amounts are shown: nothing is recomputed here. What the person typed
// keeps its own reading order (unicode-bidi: plaintext, see Invoice.css).
export default function InvoiceSheet({ invoice }) {
  const { t } = useTranslation();
  const lang = invoice.language;
  const money = (minor) => formatMoney(lang, minor, invoice.currency);
  const number = (text) => new Intl.NumberFormat(lang).format(Number(text));

  return (
    <article className="invoice-sheet" dir={textDirection(lang)} lang={lang}>
      <header className="invoice-sheet-head">
        <h2>
          {t('invoice.sheet.title')} <bdi>{invoice.number}</bdi>
        </h2>
        <dl>
          <div>
            <dt>{t('invoice.sheet.issueDate')}</dt>
            <dd>{formatDate(lang, invoice.issueDate)}</dd>
          </div>
          {invoice.dueDate && (
            <div>
              <dt>{t('invoice.sheet.dueDate')}</dt>
              <dd>{formatDate(lang, invoice.dueDate)}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="invoice-sheet-parties">
        {['seller', 'buyer'].map((who) => (
          <section key={who}>
            <h3>{t(`invoice.${who}`)}</h3>
            <p className="invoice-sheet-name">{invoice[who].name}</p>
            {invoice[who].details && <p className="invoice-sheet-details">{invoice[who].details}</p>}
          </section>
        ))}
      </div>

      <table className="invoice-sheet-table">
        <thead>
          <tr>
            <th scope="col">{t('invoice.description')}</th>
            <th scope="col">{t('invoice.quantity')}</th>
            <th scope="col">{t('invoice.unitPrice')}</th>
            <th scope="col">{t('invoice.vatRate')}</th>
            <th scope="col">{t('invoice.sheet.net')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, i) => (
            <tr key={i}>
              <td>{line.description}</td>
              <td className="num">{number(line.quantity)}</td>
              <td className="num">{money(line.unitPrice)}</td>
              <td className="num">{number(line.vatRate)} %</td>
              <td className="num">{money(line.net)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="invoice-sheet-totals">
        <div>
          <dt>{t('invoice.sheet.net')}</dt>
          <dd>{money(invoice.totals.net)}</dd>
        </div>
        {invoice.totals.byRate.map((group) => (
          <div key={group.vatRate}>
            <dt>{t('invoice.sheet.vatAt', { rate: number(group.vatRate) })}</dt>
            <dd>{money(group.vat)}</dd>
          </div>
        ))}
        <div className="invoice-sheet-gross">
          <dt>{t('invoice.sheet.gross')}</dt>
          <dd>{money(invoice.totals.gross)}</dd>
        </div>
      </dl>

      {invoice.notes && <p className="invoice-sheet-notes">{invoice.notes}</p>}
    </article>
  );
}
