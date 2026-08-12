import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, fetchCurrentUser } from "../../slices/authSlice";

/**
 * Full-page lock for sub-users when their manager's plan is not active.
 * Session stays; product APIs are blocked server-side.
 */
export default function SubscriptionLocked() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const status = user?.managerSubscriptionStatus;

  const handleRefresh = async () => {
    try {
      const data = await dispatch(fetchCurrentUser()).unwrap();
      const next = data?.user?.managerSubscriptionStatus;
      if (!next || next === "active") {
        navigate("/management", { replace: true });
      }
    } catch {
      /* stay on lock screen */
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      localStorage.clear();
    }
    navigate("/login", { replace: true });
  };

  const title =
    status === "missing" || status === null
      ? "Manager’s plan is not active"
      : "Manager’s subscription has expired";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--eco-page-bg, #F5F6FA)" }}
    >
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-[#0D5CA4] mb-2">EcoSystem</p>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Access is paused because your manager’s subscription is not active.
          Ask them to renew the plan. You do not need to log out — once they
          renew, use Refresh below.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg bg-[#0D5CA4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#07518D]"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
