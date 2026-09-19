import PublishPanel from '../../../components/cms/PublishPanel.jsx';

// Publication step of a formation: the shared CMS publish panel with the
// formation wording (admin.publish.* / admin.danger.*).
export default function PublishStep({ formation, hasUnsaved, onChanged, onGo }) {
  return (
    <PublishPanel
      entity={formation}
      basePath={`/admin/formations/${formation.id}`}
      listPath="/admin/formations"
      i18n={{ publish: 'admin.publish', danger: 'admin.danger', blocked: 'hasLearners' }}
      hasUnsaved={hasUnsaved}
      onChanged={onChanged}
      onGo={onGo}
    />
  );
}
