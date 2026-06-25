import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardPath } from "../utils/authRoutes";

export default function NotFound() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const homeTo = isAuthenticated ? getDashboardPath(user?.role) : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <h1 className="mt-2 text-lg font-semibold text-gray-800">Page not found</h1>
        <p className="mt-1 text-sm text-gray-500">
          The page you are looking for does not exist.
        </p>
        <Link
          to={homeTo}
          className="inline-block mt-6 rounded-lg bg-[#178D8F] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
