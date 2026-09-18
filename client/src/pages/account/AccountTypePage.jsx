import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

export default function AccountTypePage() {
  const [accountType, setAccountType] = useState('auto-entrepreneur');
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    // No backend endpoint exists yet to persist this change (see P1-06 / P2-01+).
    setStatus("L'enregistrement sera activé une fois le backend correspondant en place.");
  };

  return (
    <div>
      <h1>Type de compte</h1>
      <p>
        Votre catégorie détermine certains contenus et fonctionnalités accessibles
        (auto-entrepreneur, PME ou PMI).
      </p>
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="accountType">Catégorie</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(event) => setAccountType(event.target.value)}
          >
            <option value="auto-entrepreneur">Auto-entrepreneur</option>
            <option value="pme">PME</option>
            <option value="pmi">PMI</option>
          </select>
        </div>
        {status && (
          <p className="form-status" role="status">
            {status}
          </p>
        )}
        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
