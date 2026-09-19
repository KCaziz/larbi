import { useRef, useState } from 'react';
import { LoaderCircle, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { errorKey } from '../../lib/api.js';
import Button from '../ui/Button.jsx';

// One "choose a file" button that uploads immediately through `onUpload(file)`
// (returns a promise) and reports problems in plain language.
// Used for cover images and course files now, article images later.
export default function FileUpload({ label, accept, onUpload, variant = 'secondary' }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cms-upload">
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} hidden data-testid="file-input" />
      <Button variant={variant} onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? (
          <LoaderCircle size={16} strokeWidth={2} className="loading-spinner" aria-hidden="true" />
        ) : (
          <Upload size={16} strokeWidth={1.9} aria-hidden="true" />
        )}
        {busy ? t('admin.upload.uploading') : label}
      </Button>
      {error && (
        <small className="form-hint form-hint-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
