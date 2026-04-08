import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuth';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'Administrator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
