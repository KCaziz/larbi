import { useState } from 'react';
import { Check, Copy, Download, ExternalLink, FileText, Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RichContent from '../ui/RichContent.jsx';
import './Blocks.css';

// Shows the blocks of a lesson. ONE component for the learner's reader and for the editor's
// preview ("what the student sees"), so what an author previews is what is published.
// `blocks`: [{ id, type, data, media: { url, originalName, sizeBytes } | null }]

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const CALLOUT_ICON = { info: Info, tip: Lightbulb, warning: TriangleAlert };
// Links written by an author: only http(s) is ever turned into a real link.
const safeHref = (url) => (/^https?:\/\//i.test(url ?? '') ? url : undefined);

function CodeBlock({ data }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused (insecure context): the text stays selectable */
    }
  };
  return (
    <figure className="block-code">
      <div className="block-code-bar">
        <span className="block-code-language">{data.language}</span>
        <button type="button" className="block-code-copy" onClick={copy} aria-label={t('blocks.copy')}>
          {copied ? <Check size={15} strokeWidth={2} aria-hidden="true" /> : <Copy size={15} strokeWidth={1.9} aria-hidden="true" />}
          {copied ? t('blocks.copied') : t('blocks.copy')}
        </button>
      </div>
      {/* Plain text only: never interpreted as HTML. */}
      <pre tabIndex={0}>
        <code>{data.code}</code>
      </pre>
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  );
}

function Block({ block }) {
  const { t } = useTranslation();
  const { type, data, media } = block;

  switch (type) {
    case 'text':
      return data.html ? <RichContent html={data.html} /> : null;

    case 'image':
      return media ? (
        <figure className="block-figure">
          <img src={media.url} alt={data.alt || ''} loading="lazy" />
          {data.caption && <figcaption>{data.caption}</figcaption>}
        </figure>
      ) : null;

    case 'video':
      return media ? (
        <figure className="block-figure">
          {/* "nodownload" only hides the browser's button: a convenience, NOT a protection. The real
              protection is that this URL needs an enrolled, authorised session. */}
          <video controls preload="metadata" controlsList="nodownload" aria-label={data.caption || media.originalName} src={media.url} />
          {data.caption && <figcaption>{data.caption}</figcaption>}
        </figure>
      ) : null;

    case 'file':
      return media ? (
        <a className="block-file" href={media.url} download>
          <FileText size={22} strokeWidth={1.6} aria-hidden="true" />
          <span>
            <strong>{data.label || media.originalName}</strong>
            {data.description && <small>{data.description}</small>}
            <small>{formatSize(media.sizeBytes)}</small>
          </span>
          <Download size={18} strokeWidth={1.8} aria-label={t('blocks.download')} />
        </a>
      ) : null;

    case 'code':
      return data.code ? <CodeBlock data={data} /> : null;

    case 'table':
      return data.headers?.length ? (
        <figure className="block-table">
          <div className="block-table-scroll" tabIndex={0} role="region" aria-label={data.caption || t('blocks.table')}>
            <table>
              <thead>
                <tr>
                  {data.headers.map((header, i) => (
                    <th key={i} scope="col">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.caption && <figcaption>{data.caption}</figcaption>}
        </figure>
      ) : null;

    case 'quote':
      return data.text ? (
        <figure className="block-quote">
          <blockquote>
            <p>{data.text}</p>
          </blockquote>
          {data.author && <figcaption>— {data.author}</figcaption>}
        </figure>
      ) : null;

    case 'callout': {
      const Icon = CALLOUT_ICON[data.variant] ?? Info;
      return (
        <aside className={`block-callout block-callout-${data.variant}`} role="note">
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
          <div>
            {data.title && <strong>{data.title}</strong>}
            {data.html && <RichContent html={data.html} />}
          </div>
        </aside>
      );
    }

    case 'resources':
      return data.items?.length ? (
        <section className="block-resources">
          {data.title && <h3>{data.title}</h3>}
          <ul>
            {data.items.map((item, i) => (
              <li key={i}>
                <a href={safeHref(item.url)} target="_blank" rel="noopener noreferrer nofollow">
                  {item.label || item.url}
                  <ExternalLink size={14} strokeWidth={1.9} aria-label={t('blocks.external')} />
                </a>
                {item.description && <small>{item.description}</small>}
              </li>
            ))}
          </ul>
        </section>
      ) : null;

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks }) {
  return (
    <div className="blocks">
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}
