import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getHomePathForUser } from "../utils/authRoutes";

/**
 * Public-only routes: logged-in users are sent to their dashboard.
 * Also unlocks document scroll (global CSS locks overflow for the app shell).
 */

export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    document.documentElement.classList.add("eco-allow-page-scroll");
    return () => {
      document.documentElement.classList.remove("eco-allow-page-scroll");
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to={getHomePathForUser(user)} replace />;
  }

  return children;
}
