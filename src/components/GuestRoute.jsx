import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardPath } from "../utils/authRoutes";

/**
 * Public-only routes: logged-in users are sent to their dashboard.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}
