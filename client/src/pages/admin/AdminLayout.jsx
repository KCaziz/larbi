import CmsShell from '../../components/cms/CmsShell.jsx';
import RegulatoryConfirm from '../../components/cms/RegulatoryConfirm.jsx';

// The administration's content frame; its menu is the window's sidebar
// (layouts/AdminShell.jsx).
export default function AdminLayout() {
  return (
    <>
      <CmsShell />
      {/* P13-05: the regulatory values the client is asked to confirm. */}
      <RegulatoryConfirm />
    </>
  );
}
