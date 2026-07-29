// src/pages/Dashboard/WaterLeakageDeviceCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { ShieldCheck, CircleAlert, Activity } from "lucide-react";
import TruncatedText from "../../components/TruncatedText";
import "../../styles/pages/Dashboard/dashboard-styles.css";

function isWaterLeakDetected(espWaterLeak, waterLeakAlert) {
  if (waterLeakAlert === true) return true;
  if (espWaterLeak === true) return true;
  if (espWaterLeak === false) return false;
  if (typeof espWaterLeak === "boolean") return espWaterLeak;
  const n = Number(espWaterLeak);
  if (Number.isFinite(n) && (n === 0 || n === 1)) return n >= 1;
  const s = String(espWaterLeak).toLowerCase();
  return s === "true" || s === "detected" || s === "leak";
}

/** Custom pipe + drop illustration — normal vs leak (light CSS motion) */
function WaterPipeIcon({ leak = false, className = "" }) {
  const arc = leak ? "#F43F5E" : "#38BDF8";
  const drop = leak ? "#0EA5E9" : "#38BDF8";
  const pipe = "#E2E8F0";
  const pipeEdge = "#94A3B8";
  const uid = leak ? "wldLeak" : "wldOk";

  return (
    <svg
      viewBox="0 0 96 100"
      width="128"
      height="128"
      className={`wld-pipe-icon ${leak ? "wld-pipe-icon--leak" : "wld-pipe-icon--ok"} ${className}`}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#7DD3FC" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="12" y="26" width="72" height="14" rx="7" />
        </clipPath>
      </defs>

      {/* Pipe body */}
      <rect x="8" y="22" width="80" height="22" rx="11" fill={pipe} stroke={pipeEdge} strokeWidth="2" />

      {/* Water flow — fills most of the pipe bore */}
      <g clipPath={`url(#${uid}-clip)`}>
        <rect x="12" y="26" width="72" height="14" fill={`url(#${uid}-water)`} />
        <path
          className="wld-pipe-flow"
          d="M10 30 C20 27.5 28 32.5 38 30 C48 27.5 56 32.5 66 30 C76 27.5 84 31.5 88 30 L88 40 L10 40 Z"
          fill="#BAE6FD"
          opacity="0.55"
        />
        <path
          className="wld-pipe-flow wld-pipe-flow--late"
          d="M10 33.5 C22 31 30 36 40 33.5 C50 31 58 36 68 33.5 C78 31 84 35 90 33.5 L90 41 L10 41 Z"
          fill="#E0F2FE"
          opacity="0.4"
        />
      </g>

      {/* Left flange */}
      <rect x="4" y="18" width="10" height="30" rx="3" fill={pipe} stroke={pipeEdge} strokeWidth="2" />
      {/* Right flange */}
      <rect x="82" y="18" width="10" height="30" rx="3" fill={pipe} stroke={pipeEdge} strokeWidth="2" />

      {leak ? (
        <>
          {/* Crack — stays inside pipe body (y ~24–42) */}
          <path
            d="M47 25 L45 28.5 L49 31.5 L46 34.5 L50 37.5 L47 40.5"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M48 25.5 L46.2 28.8 L50 31.8 L47.2 34.8 L51 37.8 L48.2 40.5"
            stroke="#64748B"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          />
          {/* Splash drops */}
          <g className="wld-pipe-splash">
            <path
              className="wld-pipe-drop wld-pipe-drop--main"
              d="M48 48 C48 48 42 56 42 60 C42 63.3 44.7 66 48 66 C51.3 66 54 63.3 54 60 C54 56 48 48 48 48Z"
              fill={drop}
            />
            <path
              className="wld-pipe-drop wld-pipe-drop--left"
              d="M38 52 C38 52 34 58 34 60.5 C34 62.8 35.9 64.5 38 64.5 C40.1 64.5 42 62.8 42 60.5 C42 58 38 52 38 52Z"
              fill={drop}
              opacity="0.85"
            />
            <path
              className="wld-pipe-drop wld-pipe-drop--right"
              d="M58 52 C58 52 55 57.5 55 60 C55 62.2 56.8 64 58.8 64 C60.8 64 62.5 62.2 62.5 60 C62.5 57.5 58 52 58 52Z"
              fill={drop}
              opacity="0.8"
            />
          </g>
          {/* Alert arcs */}
          <path className="wld-pipe-arc wld-pipe-arc--1" d="M30 70 Q48 82 66 70" stroke={arc} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
          <path className="wld-pipe-arc wld-pipe-arc--2" d="M24 74 Q48 90 72 74" stroke={arc} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          <path className="wld-pipe-arc wld-pipe-arc--3" d="M18 78 Q48 98 78 78" stroke={arc} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </>
      ) : (
        <>
          {/* Calm drop */}
          <path
            className="wld-pipe-drop wld-pipe-drop--calm"
            d="M48 46 C48 46 42 54 42 58.5 C42 61.8 44.7 64.5 48 64.5 C51.3 64.5 54 61.8 54 58.5 C54 54 48 46 48 46Z"
            fill={drop}
          />
          {/* Safe arcs */}
          <path className="wld-pipe-arc wld-pipe-arc--1" d="M30 70 Q48 82 66 70" stroke={arc} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
          <path className="wld-pipe-arc wld-pipe-arc--2" d="M24 74 Q48 90 72 74" stroke={arc} strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
          <path className="wld-pipe-arc wld-pipe-arc--3" d="M18 78 Q48 98 78 78" stroke={arc} strokeWidth="2" strokeLinecap="round" opacity="0.28" />
        </>
      )}
    </svg>
  );
}

WaterPipeIcon.propTypes = {
  leak: PropTypes.bool,
  className: PropTypes.string,
};

export default function WaterLeakageDeviceCard({
  deviceName,
  espWaterLeak = null,
  waterLeakAlert = false,
  isSelected = false,
  onCardSelect,
  isOnline = false,
  lastUpdateISO = null,
}) {
  const hasData =
    espWaterLeak !== null && espWaterLeak !== undefined
      ? true
      : waterLeakAlert === true;
  const leakDetected = isWaterLeakDetected(espWaterLeak, waterLeakAlert);
  const showNoData = !hasData && !waterLeakAlert;
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  const statusLabel = showNoData
    ? "—"
    : leakDetected
      ? "Leak Detected"
      : "Not Detected";
  const statusTextClass = showNoData
    ? "text-gray-500"
    : leakDetected
      ? "text-rose-600"
      : "text-emerald-700";

  // Footer copy stays distinct from Status label (avoid repeating “leak detected”)
  const footerTitle = showNoData
    ? "Waiting for data"
    : leakDetected
      ? "Attention needed"
      : "Everything is normal.";
  const footerSubtitle = showNoData
    ? "No reading received from device yet."
    : leakDetected
      ? "Inspect nearby pipes and valves."
      : "Sensors report a dry, clear line.";
  const FooterIcon = leakDetected ? CircleAlert : ShieldCheck;

  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} flex flex-col`}
    >
      <div className="flex flex-1 items-center justify-between px-4 pt-3 pb-2">
        <div className="flex h-full min-w-0 flex-1 flex-col justify-around pr-3">
          <div title={lastUpdateStr} className="flex min-w-0 flex-col items-start">
            <div className="flex items-center">
              <span
                aria-hidden
                className={`mr-2 inline-block h-1.5 w-1.5 rounded-full shadow-sm ${
                  isOnline ? "bg-green-300" : "bg-gray-300"
                }`}
                style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
              />
              <div className="text-xs text-gray-500">Device ID</div>
            </div>
            <TruncatedText
              text={deviceName}
              className="text-lg font-bold text-gray-900"
              maxLines={1}
              tooltipPlacement="top"
            />
          </div>

          <div className="flex items-center justify-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Activity className="h-4 w-4 text-slate-500" aria-hidden />
            </div>
            <div className="flex flex-col items-start">
              <div className="text-xs text-gray-500">Status</div>
              <div className={`text-md font-bold ${statusTextClass}`}>
                {statusLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center py-2">
          <WaterPipeIcon leak={leakDetected} />
        </div>
      </div>

      <div className="px-4 pb-3 pt-1">
        <div className="flex w-full items-start gap-3 border-t border-slate-200 px-1 pt-2.5">
          <FooterIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${
              showNoData
                ? "text-slate-500"
                : leakDetected
                  ? "text-rose-600"
                  : "text-emerald-600"
            }`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-slate-600">
              {footerTitle}
            </p>
            <p className="text-xs leading-snug text-gray-500">{footerSubtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

WaterLeakageDeviceCard.propTypes = {
  deviceName: PropTypes.string,
  espWaterLeak: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
  waterLeakAlert: PropTypes.bool,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
