import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

const initialForm = { name: '', email: '', password: '', accountType: 'auto-entrepreneur' };

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setStatus({ type: 'error', text: 'Merci de remplir tous les champs.' });
      return;
    }

    // No auth backend exists yet (P1-06). We never fake account creation.
    setStatus({
      type: 'info',
      text: "La création de compte sera activée avec l'authentification (tâche P1-06) puis son intégration au frontend (P1-07).",
    });
  };

  return (
    <section className="auth-page">
      <h1>Créer un compte</h1>
      <p>Choisissez la catégorie qui correspond à votre activité.</p>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Nom</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="accountType">Type de compte</label>
          <select id="accountType" name="accountType" value={form.accountType} onChange={handleChange}>
            <option value="auto-entrepreneur">Auto-entrepreneur</option>
            <option value="pme">PME</option>
            <option value="pmi">PMI</option>
          </select>
        </div>

        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}

        <Button type="submit">Créer mon compte</Button>

        <div className="form-links">
          <span>Déjà un compte ?</span>
          <Link to="/connexion">Se connecter</Link>
        </div>
      </form>

      <Notice variant="info">
        Formulaire fonctionnel côté interface, non encore relié à un vrai compte (voir
        P1-06 / P1-07).
      </Notice>
    </section>
  );
}
