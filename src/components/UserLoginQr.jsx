import { useId } from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Permanent user login QR (URL → /q/:token).
 */
export default function UserLoginQr({
  url,
  size = 200,
  className = "",
  canvasId,
}) {
  const autoId = useId();
  const id = canvasId || autoId;
  const value = url ? String(url) : "";

  if (!value) return null;

  return (
    <div className={className}>
      <QRCodeCanvas id={id} value={value} size={size} level="M" includeMargin />
    </div>
  );
}

export function downloadQrPng(canvasId, filename = "ecosystem-login-qr.png") {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof canvas.toDataURL !== "function") return false;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
  return true;
}
