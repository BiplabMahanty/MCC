import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../auth/useAuth.jsx';
import SplashScreen from './layout/SplashScreen';

export default function ProtectedRoute() {
  const { user, status } = useAuth();
  if (status === 'loading') return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
