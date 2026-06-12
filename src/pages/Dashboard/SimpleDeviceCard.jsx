// Simple Device Card - Phase 1: Display only deviceId
// Will be enhanced with websocket data later

import React from "react";
import "../../styles/pages/Dashboard/dashboard-styles.css";

export default function SimpleDeviceCard({ device, onCardSelect, isSelected }) {
  const deviceId = device?.deviceId || "N/A";
  const deviceType = device?.deviceType || "Unknown";
  const venueName = device?.venue?.name || device?.venueName || "N/A";

  return (
    <div
      className={`device-card ${isSelected ? "selected" : ""} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={() => onCardSelect && onCardSelect(device._id || device.id)}
    >
      <div className="device-card-header">
        <div className="device-icon">
          <span className="text-2xl">📟</span>
        </div>
        <div className="device-status-badge">
          <span className="status-dot bg-gray-400"></span>
          <span className="text-xs">Offline</span>
        </div>
      </div>

      <div className="device-card-body">
        <h3 className="device-title text-lg font-bold text-gray-900 mb-2">
          Device ID: {deviceId}
        </h3>

        <div className="device-info space-y-2">
          <div className="info-row flex justify-between">
            <span className="text-gray-600 text-sm">Type:</span>
            <span className="text-gray-900 text-sm font-medium">{deviceType}</span>
          </div>

          <div className="info-row flex justify-between">
            <span className="text-gray-600 text-sm">Venue:</span>
            <span className="text-gray-900 text-sm font-medium">{venueName}</span>
          </div>

          {device?.category && (
            <div className="info-row flex justify-between">
              <span className="text-gray-600 text-sm">Category:</span>
              <span className="text-gray-900 text-sm font-medium capitalize">
                {device.category}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="device-card-footer mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Waiting for real-time data...
        </p>
      </div>
    </div>
  );
}
