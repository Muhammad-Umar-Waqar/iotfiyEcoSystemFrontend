/** Default landing path per role (ignores subscription). */
export function getDashboardPath(role) {
  if (role === "admin") return "/admin/management";
  return "/management";
}

function subscriptionStatus(user) {
  const sub = user?.currentSubscription;
  if (!sub) return null;
  if (typeof sub === "object" && sub.status) return sub.status;
  return "active";
}

function managerPlanIsActive(user) {
  const status = user?.managerSubscriptionStatus;
  // null = not a sub-user / not loaded — treat as OK for routing helpers
  if (status == null) return true;
  return status === "active";
}

/** Where a logged-in user should land. */
export function getHomePathForUser(user) {
  if (!user) return "/login";
  if (user.role === "admin") return "/admin/management";
  if (user.role === "manager") {
    const status = subscriptionStatus(user);
    if (!status) return "/select-plan";
    if (status !== "active") return "/management/subscription";
    return "/management";
  }
  if (user.role === "user") {
    if (!managerPlanIsActive(user)) return "/management/locked";
    return "/management";
  }
  return "/management";
}
