import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Notice from '../components/ui/Notice.jsx';
import './Pages.css';

const initialForm = { name: '', email: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: 'Merci de remplir tous les champs.' });
      return;
    }

    // No backend endpoint exists yet for this form: real submission is
    // wired up during P1-07 (intégration frontend/backend). We deliberately
    // do not fake a "message sent" confirmation here.
    setStatus({
      type: 'info',
      text: "L'envoi de ce formulaire sera activé lors de l'intégration backend (tâche P1-07). Votre message n'a pas encore été transmis.",
    });
  };

  return (
    <section className="page-section contact-layout">
      <div className="contact-details">
        <h1>Contact</h1>
        <p>
          Une question sur les formations, le blog ou les outils ? Écrivez-nous via le
          formulaire ci-contre.
        </p>
        <Notice variant="action-needed">
          Coordonnées de contact (email, téléphone, adresse) à fournir par le client
          avant mise en ligne — non affichées pour éviter de publier des informations
          inventées.
        </Notice>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
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
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={form.message}
            onChange={handleChange}
          />
        </div>
        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}
        <Button type="submit">Envoyer</Button>
      </form>
    </section>
  );
}
