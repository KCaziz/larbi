import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import DataTable from './DataTable.jsx';
import EmptyState from './EmptyState.jsx';
import Field from './Field.jsx';
import PageToolbar from './PageToolbar.jsx';

// Generic "list of contents + create from a title" page of the CMS. Formations
// and articles both use it (P2-02 / P3-02): the caller gives the API paths, the
// columns and its own (already translated) texts.
//   listPath / listKey : GET path and the key of the array in the response
//   createPath / createKey : POST path (body { title }) and the key of the new item
//   editPath(item)     : where "Modify" leads
//   texts : { title, subtitle, newLabel, emptyTitle, emptyBody, loadError,
//             dialog: { title, body, label, placeholder, create, required } }
export default function ContentList({ listPath, listKey, createPath, createKey, editPath, icon, columns, texts }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [createError, setCreateError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get(listPath, { signal: controller.signal })
      .then((data) => setState({ status: 'ready', items: data[listKey] }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', items: [] });
      });
    return () => controller.abort();
  }, [listPath, listKey, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading', items: [] });
    setAttempt((n) => n + 1);
  }, []);

  const openDialog = () => {
    setTitle('');
    setCreateError(null);
    setCreating(true);
  };

  const create = async () => {
    if (!title.trim()) {
      setCreateError(texts.dialog.required);
      return;
    }
    setBusy(true);
    setCreateError(null);
    try {
      const created = await api.post(createPath, { title });
      navigate(editPath(created[createKey]));
    } catch (err) {
      setCreateError(t(errorKey(err)));
      setBusy(false);
    }
  };

  return (
    <>
      <PageToolbar title={texts.title} subtitle={texts.subtitle}>
        <Button onClick={openDialog}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          {texts.newLabel}
        </Button>
      </PageToolbar>

      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message={texts.loadError} onRetry={retry} />}
      {state.status === 'ready' && state.items.length === 0 && (
        <EmptyState icon={icon} title={texts.emptyTitle}>
          <p>{texts.emptyBody}</p>
          <Button onClick={openDialog}>{texts.newLabel}</Button>
        </EmptyState>
      )}
      {state.status === 'ready' && state.items.length > 0 && <DataTable columns={columns} rows={state.items} />}

      <ConfirmDialog
        open={creating}
        title={texts.dialog.title}
        confirmLabel={texts.dialog.create}
        busy={busy}
        onConfirm={create}
        onCancel={() => !busy && setCreating(false)}
      >
        <p>{texts.dialog.body}</p>
        <Field label={texts.dialog.label} htmlFor="new-content-title" error={createError}>
          <input
            id="new-content-title"
            type="text"
            maxLength={150}
            value={title}
            placeholder={texts.dialog.placeholder}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </Field>
      </ConfirmDialog>
    </>
  );
}
