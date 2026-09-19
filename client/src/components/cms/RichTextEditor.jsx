import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Simple word-processor style editor (no HTML knowledge needed).
// Only formats the server also allows (see sanitize.service.js on the API):
// bold, italic, underline, two heading levels, lists, quote, links.
// The server sanitises again on save — this editor is a convenience, not the
// security boundary.
export default function RichTextEditor({ id, value, onChange, resetKey, describedBy }) {
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow' } },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': t('admin.rte.label'),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        class: 'cms-rte-content',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Replace the content only when the parent says the source changed
  // (another item loaded / changes discarded), never on every keystroke.
  useEffect(() => {
    if (editor && resetKey !== undefined) editor.commands.setContent(value || '', { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, editor]);

  if (!editor) return null;

  const promptLink = () => {
    const previous = editor.getAttributes('link').href ?? 'https://';
    const url = window.prompt(t('admin.rte.linkPrompt'), previous);
    if (url === null) return;
    if (url.trim() === '' || url.trim() === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  };

  const buttons = [
    { key: 'bold', icon: Bold, label: 'admin.rte.bold', run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { key: 'italic', icon: Italic, label: 'admin.rte.italic', run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { key: 'underline', icon: UnderlineIcon, label: 'admin.rte.underline', run: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    { key: 'h2', icon: Heading2, label: 'admin.rte.h2', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { key: 'h3', icon: Heading3, label: 'admin.rte.h3', run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    { key: 'bullet', icon: List, label: 'admin.rte.bullet', run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { key: 'ordered', icon: ListOrdered, label: 'admin.rte.ordered', run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { key: 'quote', icon: Quote, label: 'admin.rte.quote', run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { key: 'link', icon: Link2, label: 'admin.rte.link', run: promptLink, active: editor.isActive('link') },
    { key: 'undo', icon: Undo2, label: 'admin.rte.undo', run: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
    { key: 'redo', icon: Redo2, label: 'admin.rte.redo', run: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
  ];

  return (
    <div className="cms-rte">
      <div className="cms-rte-toolbar" role="toolbar" aria-label={t('admin.rte.label')}>
        {buttons.map(({ key, icon: Icon, label, run, active, disabled }) => (
          <button
            key={key}
            type="button"
            className={`cms-rte-button ${active ? 'active' : ''}`}
            // Keep the caret / selection in the text when a toolbar button is pressed.
            onMouseDown={(event) => event.preventDefault()}
            onClick={run}
            disabled={disabled}
            aria-pressed={active === undefined ? undefined : active}
            aria-label={t(label)}
            title={t(label)}
          >
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
