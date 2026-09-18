import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

const initialForm = { email: '', password: '' };

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setStatus({ type: 'error', text: 'Merci de renseigner votre email et votre mot de passe.' });
      return;
    }

    // No auth backend exists yet (P1-06). We never fake a successful login.
    setStatus({
      type: 'info',
      text: "La connexion sera activée avec l'authentification (tâche P1-06) puis son intégration au frontend (P1-07).",
    });
  };

  return (
    <section className="auth-page">
      <h1>Connexion</h1>
      <p>Accédez à vos formations, outils et contenus premium.</p>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}

        <Button type="submit">Se connecter</Button>

        <div className="form-links">
          <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          <Link to="/inscription">Créer un compte</Link>
        </div>
      </form>

      <Notice variant="info">
        Formulaire fonctionnel côté interface, non encore relié à un vrai compte (voir
        P1-06 / P1-07).
      </Notice>
    </section>
  );
}
