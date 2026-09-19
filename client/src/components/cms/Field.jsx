// Label + control + help text. Wording of the help text is what makes the CMS
// usable by non-technical people: always say what the field is FOR.
export default function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="form-field cms-field">
      <label htmlFor={htmlFor}>{label}</label>
      {hint && (
        <small id={`${htmlFor}-hint`} className="form-hint">
          {hint}
        </small>
      )}
      {children}
      {error && (
        <small className="form-hint form-hint-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
