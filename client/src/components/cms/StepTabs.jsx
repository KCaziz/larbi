import { Check } from 'lucide-react';

// Numbered steps the author moves through ("Informations", "Cours", ...).
// A check mark shows which steps are complete. Accessible tab pattern; the
// caller renders the matching panel with role="tabpanel".
export default function StepTabs({ steps, active, onChange, label }) {
  return (
    <div className="cms-steps" role="tablist" aria-label={label}>
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          role="tab"
          id={`step-tab-${step.id}`}
          aria-selected={active === step.id}
          aria-controls={`step-panel-${step.id}`}
          className={`cms-step ${active === step.id ? 'active' : ''} ${step.done ? 'done' : ''}`}
          onClick={() => onChange(step.id)}
        >
          <span className="cms-step-number" aria-hidden="true">
            {step.done ? <Check size={14} strokeWidth={2.5} /> : index + 1}
          </span>
          {step.label}
        </button>
      ))}
    </div>
  );
}
