import { useId } from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Encodes the raw API key as plain text (not a URL),
 * so camera / Google Lens just shows the key when scanned — works offline.
 */
export default function QRCode({
  apiKey,
  size = 60,
  className = "",
}) {
  const canvasId = useId();
  const value = apiKey ? String(apiKey) : "";

  if (!value) return null;

  return (
    <div className={className}>
      <QRCodeCanvas id={canvasId} value={value} size={size} level="M" />
    </div>
  );
}
