import { Route } from 'react-router-dom';
import Soon from '../components/Soon';
import FeePlansPage from '../pages/fees/FeePlansPage';
import FeePlanDetailPage from '../pages/fees/FeePlanDetailPage';
import StudentFeePage from '../pages/fees/StudentFeePage';
import SchedulePage from '../pages/schedule/SchedulePage';
import AttendancePage from '../pages/attendance/AttendancePage';
import NotificationsPage from '../pages/notifications/NotificationsPage';

export default function OperationsRoutes() {
  return (
    <>
      <Route path="/fees" element={<FeePlansPage />} />
      <Route path="/fees/students/:studentId" element={<StudentFeePage />} />
      <Route path="/fees/:id" element={<FeePlanDetailPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/reports" element={<Soon name="Reports" />} />
    </>
  );
}
