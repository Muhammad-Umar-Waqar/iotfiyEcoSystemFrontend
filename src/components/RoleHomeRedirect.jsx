import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardPath } from "../utils/authRoutes";

/** Send authenticated users to their dashboard; guests to login. */
export default function RoleHomeRedirect({ fallback = "/login" }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  return <Navigate to={getDashboardPath(user?.role)} replace />;
}
