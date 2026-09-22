import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../ui/Button.jsx';

// Previous/next buttons at the bottom of a CMS step, so the author does not
// have to scroll back up to the tabs to move on. Hidden at the first/last step.
export default function StepNav({ steps, active, onChange }) {
  const index = steps.findIndex((s) => s.id === active);
  if (index === -1) return null;
  const prev = steps[index - 1];
  const next = steps[index + 1];
  if (!prev && !next) return null;

  const go = (id) => {
    onChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cms-step-nav">
      <div>
        {prev && (
          <Button variant="secondary" onClick={() => go(prev.id)}>
            <ArrowLeft className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
            {prev.label}
          </Button>
        )}
      </div>
      <div>
        {next && (
          <Button onClick={() => go(next.id)}>
            {next.label}
            <ArrowRight className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
