import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function BlogListPage() {
  return (
    <section className="page-section">
      <h1>Blog</h1>
      <p>Articles et tutoriels en accès public, avec des contenus premium selon votre profil.</p>
      <Notice variant="info">
        Aucun article n'est encore publié : le CMS et la liste réelle des articles
        arrivent en Phase 3 (tâches P3-01 à P3-03).
      </Notice>
    </section>
  );
}
