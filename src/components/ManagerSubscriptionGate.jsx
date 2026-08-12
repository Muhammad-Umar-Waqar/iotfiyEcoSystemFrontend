import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Subscription gate for management shell:
 * - manager: no plan → /select-plan; expired → /management/subscription
 * - sub-user (role user): manager plan not active → /management/locked
 * - admin: skip (not used on this tree)
 */
export default function ManagerSubscriptionGate({ children }) {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) return children;
  if (!user) return children;

  const path = location.pathname.replace(/\/+$/, "") || "/";

  // ── Sub-user inherits manager plan ──
  if (user.role === "user") {
    const status = user.managerSubscriptionStatus;
    const locked = status != null && status !== "active";
    if (!locked) return children;
    if (path === "/management/locked") return children;
    return (
      <Navigate
        to="/management/locked"
        replace
        state={{ from: location, reason: status }}
      />
    );
  }

  if (user.role !== "manager") return children;

  const sub = user.currentSubscription;
  const status = typeof sub === "object" ? sub?.status : undefined;
  const hasSub = Boolean(sub);
  const onSubscriptionPage = path === "/management/subscription";
  const onSelectPlan = path === "/select-plan";

  if (!hasSub) {
    if (onSelectPlan) return children;
    return <Navigate to="/select-plan" replace state={{ from: location }} />;
  }

  if (status && status !== "active") {
    if (onSubscriptionPage) return children;
    return (
      <Navigate
        to="/management/subscription"
        replace
        state={{ from: location, reason: "expired" }}
      />
    );
  }

  return children;
}
