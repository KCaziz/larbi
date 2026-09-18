import './LockedContent.css';

// Visual pattern for "this needs a higher access level" — purely a UI cue.
// The real enforcement always happens server-side (see TASKS.md règle #2) :
// this component never decides access, it only reflects a decision already
// made by the API. The blurred bars are decorative placeholders, not real
// (hidden) content.
export default function LockedContent({ title, children }) {
  return (
    <div className="locked-content">
      <div className="locked-preview" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="locked-overlay">
        <span className="locked-icon" aria-hidden="true">
          🔒
        </span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
