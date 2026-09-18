import './LockedContent.css';

// Visual pattern for "this needs a higher access level" — purely a UI cue.
// The real enforcement always happens server-side (see TASKS.md règle #2) :
// this component never decides access, it only reflects a decision already
// made by the API.
export default function LockedContent({ title, children }) {
  return (
    <div className="locked-content">
      <span className="locked-icon" aria-hidden="true">
        🔒
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
