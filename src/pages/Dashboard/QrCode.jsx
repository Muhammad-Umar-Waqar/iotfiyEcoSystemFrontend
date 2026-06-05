//QRCode.jsx

import  { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCode({
  apiKey,
  size = 60,
  className = "",
  baseUrl = undefined, // example: process.env.NEXT_PUBLIC_BASE_URL or window.location.origin
  simple = true,
}) {
  const [encodeAsUrl, setEncodeAsUrl] = useState(true);
  const shortId = Math.random().toString(36).slice(2, 9);
  const canvasId = `qr-canvas-${shortId}`;

  // build the URL that the QR will point to (for auto-copy on scan).
  // If baseUrl isn't provided, we fallback to window.location.origin when available.
  const origin =
    baseUrl ||
    (typeof window !== "undefined" && window.location && window.location.origin) ||
    "";
  const copyUrl = origin ? `${origin.replace(/\/$/, "")}/qr-copy.html?key=${encodeURIComponent(apiKey)}` : "";

  const value = apiKey ? (encodeAsUrl && origin ? copyUrl : apiKey) : "";

  // async function downloadPNG() {
  //   try {
  //     const canvas = document.getElementById(canvasId);
  //     if (!canvas) throw new Error("QR canvas not found");
  //     const dataUrl = canvas.toDataURL("image/png");
  //     const a = document.createElement("a");
  //     a.href = dataUrl;
  //     a.download = `api-key-qr.png`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Unable to download QR image.");
  //   }
  // }

  // async function copyApiToClipboard() {
  //   if (!apiKey) return;
  //   try {
  //     await navigator.clipboard.writeText(apiKey);
  //     alert("API key copied to clipboard.");
  //   } catch (err) {
  //     // fallback: show the key in prompt so user can copy
  //     // (useful for insecure contexts)
  //     window.prompt("Copy API key:", apiKey);
  //   }
  // }

  //  const wrapperStyle = { display: "inline-block", lineHeight: 0 }

  return (
    <div className={`${className}`}>
          <QRCodeCanvas
            id={canvasId}
            value={value}
            size={size}
            level="L"
          />
    </div>
  );
}
