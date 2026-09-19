import CmsShell from '../../components/cms/CmsShell.jsx';
import { adminNavItems } from '../../config/adminNav.js';

export default function AdminLayout() {
  return <CmsShell items={adminNavItems} />;
}
