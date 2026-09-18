import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

// Route template for /blog/:slug. No article data exists before the CMS
// (P3-01/P3-02) is built, so every slug currently resolves to this honest
// "not available yet" state instead of fabricated article content.
export default function ArticlePage() {
  const { slug } = useParams();

  return (
    <section className="page-section page-status">
      <p className="code">Article</p>
      <h1>« {slug} » n'est pas encore disponible</h1>
      <Notice variant="info">
        La lecture d'articles réels sera disponible une fois le CMS du blog livré
        (Phase 3, tâches P3-01 à P3-03).
      </Notice>
      <Button to="/blog">Retour au blog</Button>
    </section>
  );
}
