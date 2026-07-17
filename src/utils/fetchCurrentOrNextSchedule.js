// Soft REST fallback for current/next schedule.
// Backend may not expose this route — never toast/crash on 404.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

/**
 * Try GET /event/current-next/:deviceId (and a couple aliases).
 * Returns schedule payload or null. 404 / network → null, silent.
 */
export async function fetchCurrentOrNextSchedule(deviceId) {
  if (!deviceId) return null;

  const token = localStorage.getItem("token");
  // Same helper shape as backend getCurrentOrNextScheduleData — try known paths
  const paths = [
    `${API_BASE}/event/current-next/${deviceId}`,
    `${API_BASE}/event/current-or-next/${deviceId}`,
  ];

  for (const url of paths) {
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // Route missing / not found → try next alias or give up quietly
      if (res.status === 404 || res.status === 405) {
        continue;
      }

      if (!res.ok) {
        continue;
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
    }
  }

  return null;
}
