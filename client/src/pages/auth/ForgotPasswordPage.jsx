import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email) {
      setStatus({ type: 'error', text: 'Merci de renseigner votre email.' });
      return;
    }

    // No auth/email backend exists yet (P1-06). We never fake a "reset link sent" message.
    setStatus({
      type: 'info',
      text: "L'envoi d'un lien de réinitialisation sera activé avec l'authentification (tâche P1-06).",
    });
  };

  return (
    <section className="auth-page">
      <h1>Mot de passe oublié</h1>
      <p>Indiquez votre email pour recevoir un lien de réinitialisation.</p>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}

        <Button type="submit">Envoyer le lien</Button>

        <div className="form-links">
          <Link to="/connexion">Retour à la connexion</Link>
        </div>
      </form>

      <Notice variant="info">
        Formulaire fonctionnel côté interface, non encore relié à un envoi d'email réel
        (voir P1-06).
      </Notice>
    </section>
  );
}
