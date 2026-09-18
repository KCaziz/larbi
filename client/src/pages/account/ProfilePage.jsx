import '../Pages.css';

const fields = [
  { label: 'Nom', value: '—' },
  { label: 'Email', value: '—' },
  { label: 'Type de compte', value: '—' },
  { label: "Niveau d'accès", value: '—' },
];

export default function ProfilePage() {
  return (
    <div>
      <h1>Profil</h1>
      <p>Vos informations personnelles apparaîtront ici une fois connecté.</p>
      <div className="skeleton-grid">
        {fields.map((field) => (
          <div className="skeleton-item" key={field.label}>
            <div className="label">{field.label}</div>
            <div className="value">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
