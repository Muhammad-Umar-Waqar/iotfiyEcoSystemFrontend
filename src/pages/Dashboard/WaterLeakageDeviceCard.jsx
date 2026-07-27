// src/pages/Dashboard/WaterLeakageDeviceCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { Droplets } from "lucide-react";
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

function getLeakStatus(detected, hasData) {
  if (!hasData) {
    return { label: "No Data", color: "bg-gray-200", textColor: "text-gray-800" };
  }
  if (detected) {
    return { label: "Leak Detected", color: "bg-rose-200", textColor: "text-rose-800" };
  }
  return { label: "Not Detected", color: "bg-emerald-200", textColor: "text-emerald-800" };
}

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
  const leakStatus = getLeakStatus(leakDetected, hasData || waterLeakAlert);
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} flex flex-col`}
    >
      <div className="flex h-full items-center justify-between flex-1 px-4 py-2">
        <div className="h-full flex flex-col justify-around flex-1 min-w-0 pr-3">
          <div title={lastUpdateStr} className="flex flex-col items-start min-w-0">
            <div className="flex items-center">
              <span
                aria-hidden
                className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${
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

          <div className="flex flex-col items-start">
            <div className="text-xs text-gray-500">Status</div>
            <div
              className={`text-base font-semibold ${
                !hasData && !waterLeakAlert
                  ? "text-gray-500"
                  : leakDetected
                    ? "text-rose-600"
                    : "text-emerald-700"
              }`}
            >
              {!hasData && !waterLeakAlert
                ? "—"
                : leakDetected
                  ? "Water Leak Detected"
                  : "Not Detected"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center gap-3 shrink-0">
          <div
            className={`flex items-center justify-center rounded-2xl px-3 py-2 ${
              leakDetected ? "bg-rose-100" : "bg-[#E5EBE4]"
            }`}
          >
            <Droplets
              className={`w-11 h-11 ${
                leakDetected ? "text-sky-600" : "text-emerald-600"
              }`}
              fill="currentColor"
              strokeWidth={0}
              aria-label="Water leak"
            />
          </div>
          <p
            className={`${leakStatus.color} ${leakStatus.textColor} rounded-2xl px-2 text-sm font-semibold py-1`}
          >
            {leakStatus.label}
          </p>
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
