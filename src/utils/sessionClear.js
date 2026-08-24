const ORG_VENUE_KEY = "iotifiy:org-venue";

/** Fired so OrgVenueContext can drop in-memory org/venue (provider does not remount). */
export const SESSION_CLEARED_EVENT = "iotifiy:session-cleared";

/**
 * Clear previous session data (token, org/venue selection, redux-persist).
 * Used by logout, QR login, and 401 (token expired) kick to /login.
 */
export function clearPriorSessionStorage() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem(ORG_VENUE_KEY);
    sessionStorage.removeItem(ORG_VENUE_KEY);
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("persist:")) localStorage.removeItem(key);
    });
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
  } catch {
    /* ignore (SSR / tests) */
  }
}
