import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CircleAlert,
  CircleCheck,
  Code,
  Copy,
  Eye,
  FileText,
  GripVertical,
  History,
  Image as ImageIcon,
  Info,
  Link2,
  LoaderCircle,
  Pencil,
  Plus,
  Quote,
  Table2,
  Trash2,
  Type,
  Video,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../cms/ConfirmDialog.jsx';
import BlockRenderer from './BlockRenderer.jsx';
import BlockForm from './BlockForms.jsx';
import { NEW_BLOCK_DATA } from './blockDefaults.js';
import RevisionsPanel from './RevisionsPanel.jsx';
import './BlockEditor.css';

// Editor of the content of ONE lesson: a list of blocks (text, image, video, file, code,
// table, quote, callout, resources) that the author adds, edits, reorders by drag and drop
// and deletes. Everything is saved by itself a moment after the last keystroke (each block on
// its own), and the state of the saving is always visible. The server validates and cleans
// every block again: this editor is a convenience, not the security boundary.

const TYPES = [
  { type: 'text', icon: Type },
  { type: 'image', icon: ImageIcon, file: 'image/png,image/jpeg,image/webp' },
  { type: 'video', icon: Video, file: 'video/mp4,video/webm' },
  { type: 'file', icon: FileText, file: 'application/pdf' },
  { type: 'code', icon: Code },
  { type: 'table', icon: Table2 },
  { type: 'quote', icon: Quote },
  { type: 'callout', icon: Info },
  { type: 'resources', icon: Link2 },
];
const ICON = Object.fromEntries(TYPES.map((x) => [x.type, x.icon]));
const AUTOSAVE_DELAY_MS = 900;
const isMedia = (type) => type === 'image' || type === 'video' || type === 'file';

// What is sent to the server: a link without a real address is not saved yet (the server
// refuses it); it stays on screen so the author can finish typing it.
function payloadOf(block) {
  if (block.type !== 'resources') return block.data;
  return { ...block.data, items: block.data.items.filter((item) => /^https?:\/\//i.test(item.url.trim())).map((item) => ({ ...item, url: item.url.trim() })) };
}

function Palette({ onPick, onUpload, compact }) {
  const { t } = useTranslation();
  const inputs = useRef({});
  const [busy, setBusy] = useState(false);
  return (
    <div className={`cms-palette ${compact ? 'compact' : ''}`} role="group" aria-label={t('admin.blocks.palette')}>
      {TYPES.map(({ type, icon: Icon, file }) => (
        <span key={type}>
          {file && (
            <input
              ref={(el) => {
                inputs.current[type] = el;
              }}
              type="file"
              hidden
              accept={file}
              onChange={async (event) => {
                const chosen = event.target.files?.[0];
                event.target.value = '';
                if (!chosen) return;
                setBusy(true);
                try {
                  await onUpload(chosen);
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          <button
            type="button"
            className="cms-palette-button"
            disabled={busy}
            onClick={() => (file ? inputs.current[type]?.click() : onPick(type))}
          >
            <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
            {t(`admin.blocks.types.${type}`)}
          </button>
        </span>
      ))}
    </div>
  );
}

function SortableBlock({ block, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const { t } = useTranslation();
  const Icon = ICON[block.type];
  return (
    <div ref={setNodeRef} className={`cms-block ${isDragging ? 'dragging' : ''}`} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <div className="cms-block-head">
        <button type="button" className="cms-grip" {...attributes} {...listeners} aria-label={t('admin.blocks.drag')} title={t('admin.blocks.drag')}>
          <GripVertical size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="cms-block-icon" />
        <span className="cms-block-type">{t(`admin.blocks.types.${block.type}`)}</span>
        {children.actions}
      </div>
      <div className="cms-block-body">{children.body}</div>
    </div>
  );
}

export default function BlockEditor({ course, onContentChange, onPendingChange }) {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState(course.blocks);
  const [status, setStatus] = useState('saved'); // saved | saving | error
  const [error, setError] = useState(null);
  const [insertAfter, setInsertAfter] = useState(null); // block id under which the palette is open
  const [preview, setPreview] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const timers = useRef(new Map()); // blockId -> autosave timeout
  const latest = useRef(new Map()); // blockId -> payload waiting to be saved
  const inFlight = useRef(0);
  const contentTimer = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const refreshStatus = useCallback(() => {
    const pending = latest.current.size > 0 || inFlight.current > 0;
    setStatus((current) => (current === 'error' && latest.current.size > 0 ? 'error' : pending ? 'saving' : 'saved'));
    onPendingChange?.(pending);
  }, [onPendingChange]);

  // The parent re-reads the formation (readiness checklist) a moment after things settle.
  const contentChanged = useCallback(() => {
    clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => onContentChange?.(), 1200);
  }, [onContentChange]);

  const flush = useCallback(
    async (id) => {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
      const data = latest.current.get(id);
      if (data === undefined) return;
      latest.current.delete(id);
      inFlight.current += 1;
      try {
        await api.patch(`/admin/blocks/${id}`, { data });
        setError(null);
        setStatus('saving');
      } catch (err) {
        // Keep what could not be saved (unless something newer arrived meanwhile) so it can be retried.
        if (!latest.current.has(id)) latest.current.set(id, data);
        setError(t(errorKey(err)));
        setStatus('error');
      } finally {
        inFlight.current -= 1;
        refreshStatus();
        contentChanged();
      }
    },
    [contentChanged, refreshStatus, t],
  );

  const flushAll = useCallback(() => Promise.all([...latest.current.keys()].map((id) => flush(id))), [flush]);

  // Leaving the lesson (or the page) never loses the last words typed.
  useEffect(() => {
    const currentTimers = timers.current;
    const waiting = latest.current;
    const currentContentTimer = contentTimer;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      clearTimeout(currentContentTimer.current);
      // Whatever was typed but not yet saved is sent now (best effort, nobody waits for it).
      waiting.forEach((data, id) => api.patch(`/admin/blocks/${id}`, { data }).catch(() => {}));
    };
  }, []);

  const edit = (id, data) => {
    setBlocks((list) => list.map((b) => (b.id === id ? { ...b, data } : b)));
    const block = { ...blocks.find((b) => b.id === id), data };
    latest.current.set(id, payloadOf(block));
    clearTimeout(timers.current.get(id));
    timers.current.set(id, setTimeout(() => flush(id), AUTOSAVE_DELAY_MS));
    setStatus('saving');
    onPendingChange?.(true);
  };

  const guarded = async (action) => {
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(t(errorKey(err)));
      setStatus('error');
      return undefined;
    }
  };

  const insertLocal = (block, afterId) =>
    setBlocks((list) => {
      const index = afterId ? list.findIndex((b) => b.id === afterId) : list.length - 1;
      const next = [...list];
      next.splice(index + 1, 0, block);
      return next;
    });

  const addBlock = (type, afterId) =>
    guarded(async () => {
      const { block } = await api.post(`/admin/courses/${course.id}/blocks`, { type, data: NEW_BLOCK_DATA[type], ...(afterId ? { afterId } : {}) });
      insertLocal(block, afterId);
      setInsertAfter(null);
      contentChanged();
    });

  const uploadFile = (file, afterId) =>
    guarded(async () => {
      const { block } = await api.upload(`/admin/courses/${course.id}/blocks/upload`, file, { fields: afterId ? { afterId } : {} });
      insertLocal(block, afterId);
      setInsertAfter(null);
      contentChanged();
    });

  const duplicate = (id) =>
    guarded(async () => {
      await flush(id);
      const { block } = await api.post(`/admin/blocks/${id}/duplicate`);
      insertLocal(block, id);
      contentChanged();
    });

  const confirmDelete = async () => {
    setDeleting(true);
    await guarded(async () => {
      clearTimeout(timers.current.get(toDelete.id));
      timers.current.delete(toDelete.id);
      latest.current.delete(toDelete.id);
      await api.delete(`/admin/blocks/${toDelete.id}`);
      setBlocks((list) => list.filter((b) => b.id !== toDelete.id));
      contentChanged();
    });
    setToDelete(null);
    setDeleting(false);
    refreshStatus();
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    const next = arrayMove(blocks, from, to);
    setBlocks(next);
    guarded(async () => {
      await api.put(`/admin/courses/${course.id}/blocks/order`, { blockIds: next.map((b) => b.id) });
      contentChanged();
    });
  };

  const restored = (restoredBlocks) => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    latest.current.clear();
    // The restored blocks are new rows with new ids: their forms are created afresh by themselves.
    setBlocks(restoredBlocks);
    refreshStatus();
    contentChanged();
  };

  const statusView = useMemo(() => {
    if (status === 'error') return { icon: CircleAlert, tone: 'error', text: t('admin.blocks.status.error') };
    if (status === 'saving') return { icon: LoaderCircle, tone: 'busy', text: t('admin.blocks.status.saving') };
    return { icon: CircleCheck, tone: 'ok', text: t('admin.blocks.status.saved') };
  }, [status, t]);
  const StatusIcon = statusView.icon;

  return (
    <div className="cms-blocks">
      <div className="cms-blocks-bar">
        <span className={`cms-blocks-status ${statusView.tone}`} role="status" aria-live="polite">
          <StatusIcon size={15} strokeWidth={2} aria-hidden="true" className={status === 'saving' ? 'loading-spinner' : undefined} />
          {statusView.text}
        </span>
        {status === 'error' && (
          <Button variant="secondary" onClick={flushAll}>
            {t('admin.blocks.retry')}
          </Button>
        )}
        <span className="cms-blocks-bar-spacer" />
        <Button variant="secondary" onClick={() => setPreview((v) => !v)} aria-pressed={preview}>
          {preview ? <Pencil size={16} strokeWidth={1.9} aria-hidden="true" /> : <Eye size={16} strokeWidth={1.9} aria-hidden="true" />}
          {preview ? t('admin.blocks.edit') : t('admin.blocks.preview')}
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await flushAll();
            setHistoryOpen((v) => !v);
          }}
          aria-expanded={historyOpen}
        >
          <History size={16} strokeWidth={1.9} aria-hidden="true" />
          {t('admin.blocks.history')}
        </Button>
      </div>

      {error && (
        <p className="cms-inline-message error" role="alert">
          {error}
        </p>
      )}

      {historyOpen && <RevisionsPanel courseId={course.id} onRestored={restored} />}

      {preview ? (
        <div className="cms-block-preview-pane" aria-label={t('admin.blocks.previewLabel')}>
          <p className="cms-muted">{t('admin.blocks.previewHint')}</p>
          {blocks.length === 0 ? <p className="cms-muted">{t('admin.blocks.empty')}</p> : <BlockRenderer blocks={blocks} />}
        </div>
      ) : (
        <>
          {blocks.length === 0 && <p className="cms-muted">{t('admin.blocks.empty')}</p>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ screenReaderInstructions: { draggable: t('admin.blocks.instructions') } }}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="cms-block-list">
                {blocks.map((block) => (
                  <div key={block.id}>
                    <SortableBlock block={block}>
                      {{
                        actions: (
                          <span className="cms-block-actions">
                            {!isMedia(block.type) && (
                              <button type="button" className="cms-icon-button" onClick={() => duplicate(block.id)} aria-label={t('admin.blocks.duplicate')} title={t('admin.blocks.duplicate')}>
                                <Copy size={16} strokeWidth={1.8} aria-hidden="true" />
                              </button>
                            )}
                            <button type="button" className="cms-icon-button danger" onClick={() => setToDelete(block)} aria-label={t('admin.blocks.delete')} title={t('admin.blocks.delete')}>
                              <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                            </button>
                          </span>
                        ),
                        body: <BlockForm block={block} onChange={(data) => edit(block.id, data)} />,
                      }}
                    </SortableBlock>
                    {insertAfter === block.id ? (
                      <Palette compact onPick={(type) => addBlock(type, block.id)} onUpload={(file) => uploadFile(file, block.id)} />
                    ) : (
                      <button type="button" className="cms-insert" onClick={() => setInsertAfter(block.id)} aria-label={t('admin.blocks.insertBelow')}>
                        <Plus size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="cms-muted cms-blocks-add-title">{blocks.length === 0 ? t('admin.blocks.start') : t('admin.blocks.addAtEnd')}</p>
          <Palette onPick={(type) => addBlock(type)} onUpload={(file) => uploadFile(file)} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={t('admin.blocks.deleteTitle')}
        confirmLabel={t('admin.courses.deleteConfirm')}
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        <p>{toDelete && isMedia(toDelete.type) ? t('admin.blocks.deleteFileBody') : t('admin.blocks.deleteBody')}</p>
      </ConfirmDialog>
    </div>
  );
}
