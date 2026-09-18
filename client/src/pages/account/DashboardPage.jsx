import '../Pages.css';

const widgets = [
  { label: 'Formations en cours', value: '—' },
  { label: 'Certificats obtenus', value: '—' },
  { label: 'Derniers articles lus', value: '—' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1>Tableau de bord</h1>
      <p>Vue d'ensemble de votre activité une fois vos formations et certifications en place.</p>
      <div className="skeleton-grid">
        {widgets.map((widget) => (
          <div className="skeleton-item" key={widget.label}>
            <div className="label">{widget.label}</div>
            <div className="value">{widget.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
