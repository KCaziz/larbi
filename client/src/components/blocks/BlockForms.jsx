import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';
import RichTextEditor from '../cms/RichTextEditor.jsx';

// One small form per type of block. Each receives the block and `onChange(data)` with the
// COMPLETE new `data` of the block; the server validates and cleans it again on save.
const CODE_LANGUAGES = ['plaintext', 'javascript', 'typescript', 'python', 'sql', 'html', 'css', 'json', 'bash', 'java', 'csharp', 'php', 'xml', 'yaml'];
const CODE_LANGUAGE_LABEL = { plaintext: 'Texte brut', csharp: 'C#', html: 'HTML', css: 'CSS', sql: 'SQL', json: 'JSON', php: 'PHP', xml: 'XML', yaml: 'YAML' };

function Row({ label, htmlFor, hint, children }) {
  return (
    <div className="form-field cms-field">
      <label htmlFor={htmlFor}>{label}</label>
      {hint && <small className="form-hint">{hint}</small>}
      {children}
    </div>
  );
}

function TextForm({ block, onChange, id }) {
  const { t } = useTranslation();
  return (
    <div className="form-field cms-field">
      <label htmlFor={id}>{t('admin.blocks.text.label')}</label>
      <RichTextEditor id={id} value={block.data.html} onChange={(html) => onChange({ html })} />
    </div>
  );
}

function ImageForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      {block.media && <img className="cms-block-preview" src={block.media.url} alt={d.alt} />}
      <Row label={t('admin.blocks.image.alt')} htmlFor={`${id}-alt`} hint={t('admin.blocks.image.altHint')}>
        <input id={`${id}-alt`} type="text" maxLength={200} value={d.alt} onChange={(e) => onChange({ ...d, alt: e.target.value })} />
      </Row>
      <Row label={t('admin.blocks.caption')} htmlFor={`${id}-caption`}>
        <input id={`${id}-caption`} type="text" maxLength={300} value={d.caption} onChange={(e) => onChange({ ...d, caption: e.target.value })} />
      </Row>
    </>
  );
}

function VideoForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      {block.media && <video className="cms-block-preview" controls preload="metadata" src={block.media.url} aria-label={block.media.originalName} />}
      <Row label={t('admin.blocks.caption')} htmlFor={`${id}-caption`}>
        <input id={`${id}-caption`} type="text" maxLength={300} value={d.caption} onChange={(e) => onChange({ ...d, caption: e.target.value })} />
      </Row>
    </>
  );
}

function FileForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      {block.media && <p className="cms-muted">{block.media.originalName}</p>}
      <Row label={t('admin.blocks.file.label')} htmlFor={`${id}-label`}>
        <input id={`${id}-label`} type="text" maxLength={150} value={d.label} onChange={(e) => onChange({ ...d, label: e.target.value })} />
      </Row>
      <Row label={t('admin.blocks.file.description')} htmlFor={`${id}-description`}>
        <input id={`${id}-description`} type="text" maxLength={300} value={d.description} onChange={(e) => onChange({ ...d, description: e.target.value })} />
      </Row>
    </>
  );
}

function CodeForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      <Row label={t('admin.blocks.code.language')} htmlFor={`${id}-language`}>
        <select id={`${id}-language`} value={d.language} onChange={(e) => onChange({ ...d, language: e.target.value })}>
          {CODE_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {CODE_LANGUAGE_LABEL[language] ?? language.charAt(0).toUpperCase() + language.slice(1)}
            </option>
          ))}
        </select>
      </Row>
      <Row label={t('admin.blocks.code.code')} htmlFor={`${id}-code`} hint={t('admin.blocks.code.hint')}>
        <textarea
          id={`${id}-code`}
          className="cms-code-input"
          rows={8}
          maxLength={20000}
          spellCheck={false}
          dir="ltr"
          value={d.code}
          onChange={(e) => onChange({ ...d, code: e.target.value })}
        />
      </Row>
      <Row label={t('admin.blocks.caption')} htmlFor={`${id}-caption`}>
        <input id={`${id}-caption`} type="text" maxLength={200} value={d.caption} onChange={(e) => onChange({ ...d, caption: e.target.value })} />
      </Row>
    </>
  );
}

function TableForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  const setHeader = (c, value) => onChange({ ...d, headers: d.headers.map((h, i) => (i === c ? value : h)) });
  const setCell = (r, c, value) => onChange({ ...d, rows: d.rows.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? value : cell)) : row)) });
  const addRow = () => onChange({ ...d, rows: [...d.rows, d.headers.map(() => '')] });
  const addColumn = () => onChange({ ...d, headers: [...d.headers, ''], rows: d.rows.map((row) => [...row, '']) });
  const removeRow = (r) => onChange({ ...d, rows: d.rows.filter((_, i) => i !== r) });
  const removeColumn = (c) => onChange({ ...d, headers: d.headers.filter((_, i) => i !== c), rows: d.rows.map((row) => row.filter((_, j) => j !== c)) });

  return (
    <>
      <p className="cms-muted">{t('admin.blocks.table.hint')}</p>
      <div className="cms-grid-scroll">
        <table className="cms-grid">
          <thead>
            <tr>
              {d.headers.map((header, c) => (
                <th key={c} scope="col">
                  <input type="text" maxLength={100} aria-label={t('admin.blocks.table.header', { n: c + 1 })} value={header} onChange={(e) => setHeader(c, e.target.value)} />
                  {d.headers.length > 1 && (
                    <button type="button" className="cms-icon-button danger" onClick={() => removeColumn(c)} aria-label={t('admin.blocks.table.removeColumn', { n: c + 1 })} title={t('admin.blocks.table.removeColumnShort')}>
                      <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>
                    <input type="text" maxLength={300} aria-label={t('admin.blocks.table.cell', { row: r + 1, column: c + 1 })} value={cell} onChange={(e) => setCell(r, c, e.target.value)} />
                  </td>
                ))}
                <td className="cms-grid-action">
                  <button type="button" className="cms-icon-button danger" onClick={() => removeRow(r)} aria-label={t('admin.blocks.table.removeRow', { n: r + 1 })} title={t('admin.blocks.table.removeRowShort')}>
                    <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cms-inline-add">
        <Button variant="secondary" onClick={addRow} disabled={d.rows.length >= 50}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.blocks.table.addRow')}
        </Button>
        <Button variant="secondary" onClick={addColumn} disabled={d.headers.length >= 8}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {t('admin.blocks.table.addColumn')}
        </Button>
      </div>
      <Row label={t('admin.blocks.caption')} htmlFor={`${id}-caption`}>
        <input id={`${id}-caption`} type="text" maxLength={200} value={d.caption} onChange={(e) => onChange({ ...d, caption: e.target.value })} />
      </Row>
    </>
  );
}

function QuoteForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      <Row label={t('admin.blocks.quote.text')} htmlFor={`${id}-text`}>
        <textarea id={`${id}-text`} rows={3} maxLength={1000} value={d.text} onChange={(e) => onChange({ ...d, text: e.target.value })} />
      </Row>
      <Row label={t('admin.blocks.quote.author')} htmlFor={`${id}-author`}>
        <input id={`${id}-author`} type="text" maxLength={100} value={d.author} onChange={(e) => onChange({ ...d, author: e.target.value })} />
      </Row>
    </>
  );
}

function CalloutForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  return (
    <>
      <Row label={t('admin.blocks.callout.variant')} htmlFor={`${id}-variant`}>
        <select id={`${id}-variant`} value={d.variant} onChange={(e) => onChange({ ...d, variant: e.target.value })}>
          {['info', 'tip', 'warning'].map((variant) => (
            <option key={variant} value={variant}>
              {t(`admin.blocks.callout.${variant}`)}
            </option>
          ))}
        </select>
      </Row>
      <Row label={t('admin.blocks.callout.title')} htmlFor={`${id}-title`}>
        <input id={`${id}-title`} type="text" maxLength={100} value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
      </Row>
      <div className="form-field cms-field">
        <label htmlFor={`${id}-html`}>{t('admin.blocks.callout.text')}</label>
        <RichTextEditor id={`${id}-html`} value={d.html} onChange={(html) => onChange({ ...d, html })} />
      </div>
    </>
  );
}

function ResourcesForm({ block, onChange, id }) {
  const { t } = useTranslation();
  const d = block.data;
  const setItem = (i, patch) => onChange({ ...d, items: d.items.map((item, j) => (j === i ? { ...item, ...patch } : item)) });
  return (
    <>
      <Row label={t('admin.blocks.resources.title')} htmlFor={`${id}-title`}>
        <input id={`${id}-title`} type="text" maxLength={100} value={d.title} onChange={(e) => onChange({ ...d, title: e.target.value })} />
      </Row>
      <ul className="cms-resource-list">
        {d.items.map((item, i) => (
          <li key={i}>
            <input type="text" maxLength={150} aria-label={t('admin.blocks.resources.label', { n: i + 1 })} placeholder={t('admin.blocks.resources.labelPlaceholder')} value={item.label} onChange={(e) => setItem(i, { label: e.target.value })} />
            <input type="url" maxLength={500} dir="ltr" aria-label={t('admin.blocks.resources.url', { n: i + 1 })} placeholder="https://" value={item.url} onChange={(e) => setItem(i, { url: e.target.value })} />
            <input type="text" maxLength={300} aria-label={t('admin.blocks.resources.description', { n: i + 1 })} placeholder={t('admin.blocks.resources.descriptionPlaceholder')} value={item.description} onChange={(e) => setItem(i, { description: e.target.value })} />
            <button type="button" className="cms-icon-button danger" onClick={() => onChange({ ...d, items: d.items.filter((_, j) => j !== i) })} aria-label={t('admin.blocks.resources.remove', { n: i + 1 })} title={t('admin.blocks.resources.removeShort')}>
              <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={() => onChange({ ...d, items: [...d.items, { label: '', url: '', description: '' }] })} disabled={d.items.length >= 20}>
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        {t('admin.blocks.resources.add')}
      </Button>
    </>
  );
}

const FORMS = { text: TextForm, image: ImageForm, video: VideoForm, file: FileForm, code: CodeForm, table: TableForm, quote: QuoteForm, callout: CalloutForm, resources: ResourcesForm };

export default function BlockForm({ block, onChange }) {
  const Form = FORMS[block.type];
  return Form ? <Form block={block} onChange={onChange} id={`block-${block.id}`} /> : null;
}
