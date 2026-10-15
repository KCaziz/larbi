import { Outlet } from 'react-router-dom';
import JourneyNav from '../components/layout/JourneyNav.jsx';

// Shared shell of the FINCLUDIA screens (today, money, budget, goals…),
// P6-17 follow-up: a persistent nav instead of each screen being a one-off
// destination with nothing to come back from. Each page still renders its
// own <PageHeader>, so this layout stays deliberately empty besides the nav.
export default function FinLayout() {
  return (
    <>
      <JourneyNav />
      <Outlet />
    </>
  );
}
