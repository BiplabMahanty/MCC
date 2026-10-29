import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import AuthProvider from './auth/AuthProvider.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/layout/SplashScreen';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import useAuth from './auth/useAuth.jsx';
import DashboardRoutes from './routes/DashboardRoutes';
import PeopleRoutes from './routes/PeopleRoutes';
import AcademicRoutes from './routes/AcademicRoutes';
import ExamRoutes from './routes/ExamRoutes';
import OperationsRoutes from './routes/OperationsRoutes';

function AppRoutes() {
  const { status } = useAuth();
  if (status === 'loading') return <SplashScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {DashboardRoutes()}
          {PeopleRoutes()}
          {AcademicRoutes()}
          {ExamRoutes()}
          {OperationsRoutes()}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
