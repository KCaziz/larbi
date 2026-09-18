import './Pages.css';

// Generic stand-in used for site sections whose real content is built in a
// later task (P1-03 pages publiques, P1-04 pages utilisateurs, ...). Keeps
// routing/navigation fully functional now without inventing page content.
export default function PlaceholderPage({ title, task }) {
  return (
    <section className="page-section page-status">
      <p className="code">Contenu à venir{task ? ` — ${task}` : ''}</p>
      <h1>{title}</h1>
      <p>Cette page sera développée dans une prochaine tâche du projet.</p>
    </section>
  );
}
