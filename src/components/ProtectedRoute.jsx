import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDashboardPath } from '../utils/authRoutes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, token, bootstrapping, loading } = useSelector(
    (state) => state.auth
  );

  // QR / session bootstrap: wait — don't bounce to /login mid-login
  if (bootstrapping || (loading && token)) {
    return null;
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Token present but user not hydrated yet (SessionRestoration /me in flight)
  if (!isAuthenticated && token) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
