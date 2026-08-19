import { getBrand } from "./brandConfig";

/**
 * Logo that follows the current hostname brand.
 * Missing Inara image files fall back to the company name (drop files in public/brands/inara/).
 */
export default function BrandMark({
  variant = "full",
  className = "",
  style,
  alt,
  width,
  height,
}) {
  const brand = getBrand();
  const src =
    variant === "half"
      ? brand.logoHalf
      : variant === "panel"
        ? brand.logoPanel
        : brand.logo;

  return (
    <img
      src={src}
      alt={alt || brand.name}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={(e) => {
        const img = e.currentTarget;
        img.style.display = "none";
        const parent = img.parentElement;
        if (!parent || parent.querySelector("[data-brand-fallback]")) return;
        const span = document.createElement("span");
        span.dataset.brandFallback = "1";
        span.textContent = brand.name;
        span.style.fontWeight = "700";
        span.style.fontSize = "16px";
        span.style.letterSpacing = "-0.02em";
        parent.appendChild(span);
      }}
    />
  );
}

export { getBrand };
