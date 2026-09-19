export default function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="cms-empty">
      {Icon && (
        <span className="cms-empty-icon" aria-hidden="true">
          <Icon size={26} strokeWidth={1.5} />
        </span>
      )}
      <h2>{title}</h2>
      {children}
    </div>
  );
}
