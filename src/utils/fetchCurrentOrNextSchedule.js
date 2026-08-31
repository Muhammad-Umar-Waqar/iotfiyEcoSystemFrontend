// Soft REST fallback for current/next schedule.
// Backend may not expose this route — never toast/crash on 404.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

/**
 * GET /event/current-next/:deviceId
 * Returns schedule payload or null. 404 / network → null, silent.
 */
export async function fetchCurrentOrNextSchedule(deviceId) {
  if (!deviceId) return null;

  const token = localStorage.getItem("token");
  const url = `${API_BASE}/event/current-next/${deviceId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 404 || res.status === 405 || !res.ok) {
      return null;
    }

    const data = await res.json();
    // Accept either raw shape { type, event } or wrapped { success, ... }
    if (data?.type) return data;
    if (data?.success && data?.type) return data;
    if (data?.schedule) return data.schedule;
    if (data?.data?.type) return data.data;
    return data;
  } catch {
    // Network / CORS / abort — silent
    return null;
  }
}
