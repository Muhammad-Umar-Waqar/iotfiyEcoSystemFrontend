/**
 * Fetch AC brand names directly from Ackit (CORS allowed for our frontend).
 * GET {ACKIT}/api/brand/all
 */
const DEFAULT_ACKIT_API_URL = "https://api.ackit.iotfiysolutions.com";

export function getAckitApiBase() {
  return String(import.meta.env.VITE_ACKIT_API_URL || DEFAULT_ACKIT_API_URL).replace(
    /\/+$/,
    ""
  );
}

/** @returns {Promise<{ brandName: string }[]>} */
export async function fetchAckitBrandOptions() {
  const res = await fetch(`${getAckitApiBase()}/api/brand/all`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Ackit brands failed (${res.status})`);
  }

  const brands = data.brands || [];
  const seen = new Set();
  const options = [];

  for (const b of brands) {
    const name = String(b.brandName || "")
      .trim()
      .toLowerCase();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    options.push({ brandName: name });
  }

  options.sort((a, b) => a.brandName.localeCompare(b.brandName));
  return options;
}
