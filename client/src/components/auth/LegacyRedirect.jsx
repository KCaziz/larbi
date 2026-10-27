import { Navigate, useLocation, useParams } from 'react-router-dom';

// An address of the former connected space, sent to where it lives now
// (P8-02). `prefix` carries the rest of the path along, and the query string
// and the anchor always follow, so a bookmark lands on the same thing.
export default function LegacyRedirect({ to, prefix = false }) {
  const { '*': rest } = useParams();
  const { search, hash } = useLocation();
  const target = prefix && rest ? `${to}/${rest}` : to;
  return <Navigate to={`${target}${search}${hash}`} replace />;
}
