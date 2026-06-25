/** Default landing path per role */
export function getDashboardPath(role) {
  if (role === "admin") return "/admin/management";
  return "/management";
}
