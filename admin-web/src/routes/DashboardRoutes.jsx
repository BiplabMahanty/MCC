import { Route } from 'react-router-dom';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';

export default function DashboardRoutes() {
  return (
    <>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
    </>
  );
}
