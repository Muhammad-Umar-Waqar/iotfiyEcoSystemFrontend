const ORG_VENUE_KEY = "iotifiy:org-venue";

/** Fired so OrgVenueContext can drop in-memory org/venue (provider does not remount). */
export const SESSION_CLEARED_EVENT = "iotifiy:session-cleared";

const AUTH_PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/set-password",
  "/q/",
];

const AUTH_PUBLIC_API = [
  "/auth/login",
  "/auth/qr-login",
  "/auth/verify-otp",
  "/auth/set-password",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function requestUrlString(input) {
  if (typeof input === "string") return input;
  if (input instanceof Request) return input.url;
  if (input && typeof input.url === "string") return input.url;
  return "";
}

function isOurApiUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
    const apiOrigin = new URL(apiBase, window.location.origin).origin;
    return u.origin === apiOrigin || u.origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Don't treat expected auth failures (wrong password) as session expiry. */
export function shouldSkip401Logout(url = "") {
  const path = typeof window !== "undefined" ? window.location.pathname || "" : "";
  if (AUTH_PUBLIC_PATHS.some((p) => path.startsWith(p))) return true;
  const href = String(url);
  return AUTH_PUBLIC_API.some((p) => href.includes(p));
}

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

/**
 * Token expired / unauthorized — wipe session and go to login.
 * @returns {true} if redirected
 */
export function handleUnauthorizedSession(url = "") {
  if (shouldSkip401Logout(url)) return false;
  clearPriorSessionStorage();
  window.location.href = "/login";
  return true;
}

/**
 * Same as axios 401 interceptor — for a Response from fetch.
 */
export function redirectToLoginIfUnauthorized(response, requestUrl = "") {
  if (!response || response.status !== 401) return false;
  return handleUnauthorizedSession(requestUrl);
}

/** Optional: explicit wrapper. After installGlobalFetch401Handler, plain fetch is enough. */
export async function authFetch(url, options = {}) {
  const res = await fetch(url, options);
  redirectToLoginIfUnauthorized(res, requestUrlString(url));
  return res;
}

/**
 * Patch window.fetch once so every API fetch 401 logs out.
 * External hosts (OpenAI, etc.) are ignored.
 */
export function installGlobalFetch401Handler() {
  if (typeof window === "undefined" || window.__ecoFetch401Installed) return;
  window.__ecoFetch401Installed = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const res = await nativeFetch(input, init);
    const url = requestUrlString(input);
    if (res.status === 401 && isOurApiUrl(url)) {
      handleUnauthorizedSession(url);
    }
    return res;
  };
}
