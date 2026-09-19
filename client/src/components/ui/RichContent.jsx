import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import './RichContent.css';

// Shows rich text written in the CMS (lessons now, articles later).
// The server already sanitises on save; this second pass, with the SAME
// allow-list, means a bad value in the database still cannot run script here.
const OPTIONS = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'hr'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
};

export default function RichContent({ html, className = '' }) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? '', OPTIONS), [html]);
  // eslint-disable-next-line react/no-danger
  return <div className={`rich-content ${className}`.trim()} dangerouslySetInnerHTML={{ __html: clean }} />;
}
