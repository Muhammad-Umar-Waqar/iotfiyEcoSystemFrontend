/**
 * Runtime branding from the hostname (same Vercel build can serve IOTFIY + Inara).
 * IOTFIY: ecosystem.iotfiysolutions.com, iotfiy-ecosystem.vercel.app, localhost
 * Inara:  inara-suprasense.vercel.app
 */
const INARA_HOSTS = ["inara-suprasense.vercel.app"];

const IOTFIY_BRAND = {
  id: "iotfiy",
  name: "IOTFIY",
  legalName: "IOTFIY",
  productName: "EcoSystem",
  documentTitle: "EcoSystem | IOTFIY",
  logo: "/logo.png",
  logoHalf: "/logo-half.png",
  logoPanel: "/iotfiy_logo_rpanel.svg",
  favicon: "/icon-fav.svg",
};

const INARA_BRAND = {
  id: "inara",
  name: "Inara",
  legalName: "Inara SupraSense",
  productName: "EcoSystem",
  documentTitle: "EcoSystem | Inara",
  logo: "/brands/inara/logo.png",
  logoHalf: "/brands/inara/logo-half.png",
  logoPanel: "/brands/inara/logo-panel.png",
  favicon: "/brands/inara/favicon_inara.svg",
};

export function getBrand() {
  const host =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  if (INARA_HOSTS.includes(host)) return INARA_BRAND;
  return IOTFIY_BRAND;
}

export function applyDocumentBrand() {
  const brand = getBrand();
  document.title = brand.documentTitle;
  const icon = document.querySelector("link[rel='icon']");
  if (icon) icon.href = brand.favicon;
}
