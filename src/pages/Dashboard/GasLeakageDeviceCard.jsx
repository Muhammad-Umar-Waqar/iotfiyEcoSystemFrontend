// src/pages/Dashboard/GasLeakageDeviceCard.jsx

import React, { useMemo, useState } from "react";
import TruncatedText from "../../components/TruncatedText";
import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { Wind, CalendarDays, TimerIcon, CirclePlus, CalendarClock } from "lucide-react";
import PropTypes from "prop-types";
import PowerToggle from "../../components/PowerToggle";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";
import { resolveAlertState } from "../../utils/triggerAlertUtils";
import { handleCreateEventPlusClick } from "../../utils/schedulingCardUtils";

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function GasMetricItem({ label, value, hasAlert, icon }) {
  return (
    <div className="flex items-center">
      {icon}
      <div className="freezer-temp-info">
        <span className="freezer-label">{label}</span>
        <span className="responsive-value font-bold">{value}</span>
        <p className={`h-2 w-[2.7rem] rounded-full ${hasAlert ? "bg-rose-300" : "bg-[#BAEACC]"}`} />
      </div>
    </div>
  );
}

function TempHumidityGasMetrics({
  displayHumidity,
  displayTemp,
  displayGas,
  humidityAlert,
  temperatureAlert,
  glAlert,
}) {
  return (
    <div className="freezer-temp-section flex justify-between gap-2">
      <GasMetricItem
        label="Humidity"
        value={displayHumidity !== null ? `${displayHumidity}%` : "--"}
        hasAlert={humidityAlert}
        icon={<img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-1" />}
      />
      <GasMetricItem
        label="Temperature"
        value={displayTemp !== null ? `${displayTemp}°C` : "--"}
        hasAlert={temperatureAlert}
        icon={<img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-1" />}
      />
      <GasMetricItem
        label="Gas"
        value={displayGas !== null ? `${displayGas}%` : "--"}
        hasAlert={glAlert}
        icon={
          <div className="px-1 mr-1">
            <Wind size={20} className="text-orange-500" />
          </div>
        }
      />
    </div>
  );
}

export default function GasLeakageDeviceCard({
  deviceId,
  deviceName,
  isSelected = false,
  onCardSelect,
  espGL = null,
  glAlert = false,
  espHumidity = null,
  espTemprature = null,
  temperatureAlert = false,
  humidityAlert = false,
  isOnline = false,
  lastUpdateISO = null,
  category = "monitoring",
  onRefreshScheduler,
  deviceState = "OFF",
  scheduleData = null,
  triggeredAlerts = [],
  onCreateEventClick,
}) {
  const { triggerDevice, triggerDeviceManual, toggleMap } = useScheduler();

  const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";
  const [loading, setLoading] = useState(false);

  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  const displayState = toggleState;
  const isDisabled =
    category === "trigger" ? !isOnline :
    category === "scheduling" ? !!wsRunningEvent || !isOnline :
    false;

  const displayGas = toInt(espGL);
  const displayHumidity = toInt(espHumidity);
  const displayTemp = toInt(espTemprature);

  const effectiveGlAlert = resolveAlertState(category, triggeredAlerts, "gass", glAlert);
  const effectiveTemperatureAlert = resolveAlertState(category, triggeredAlerts, "temperature", temperatureAlert);
  const effectiveHumidityAlert = resolveAlertState(category, triggeredAlerts, "humidity", humidityAlert);

  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  const selectedClass = isSelected
    ? "shadow-lg transition-transform duration-300 ease-out"
    : "transition-transform duration-300";

  const handleToggleClick = async (e) => {
    e.stopPropagation();

    if (!isOnline) {
      await Swal.fire({
        title: "Device Offline",
        html: `
          <b>${deviceName}</b> is currently offline.<br/>
          <span style="color:#64748b;font-size:13px">
            Please ensure the device is connected and try again.
          </span>
        `,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#EF4444",
      });
      return;
    }

    if (category === "scheduling" && wsRunningEvent) {
      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `The <b>${wsRunningEvent.command || "Scheduled"}</b> event is active.<br/>
               <span style="color:#64748b;font-size:13px">${wsRunningEvent.startTime} → ${wsRunningEvent.endTime}</span><br/><br/>
               Do you want to disable this event?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Disable Event",
        cancelButtonText: "Close",
        confirmButtonColor: "#EF4444",
      });

      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/event/${wsRunningEvent._id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ status: "INACTIVE" }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to disable event");
          }

          await response.json();
          await onRefreshScheduler?.();

          Swal.fire({
            icon: "success",
            title: "Event Disabled",
            text: "The event has been successfully disabled.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not disable event" });
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    const nextAction = toggleState === "on" ? "OFF" : "ON";

    try {
      setLoading(true);
      if (category === "trigger") {
        await triggerDeviceManual(deviceId, nextAction);
      } else {
        await triggerDevice(deviceId, nextAction);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.message || "Command failed" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(h, m, 0);
    const localHours = date.getHours();
    const localMinutes = date.getMinutes();
    const hour12 = localHours % 12 || 12;
    const ampm = localHours >= 12 ? "PM" : "AM";
    return `${String(hour12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")} ${ampm}`;
  };

  const wsEvent = scheduleData?.event;
  const wsEventType = scheduleData?.type;
  const wsDuration = scheduleData?.totalDurationText;
  const displayStart = wsEvent?.startTime ? formatTime(wsEvent.startTime) : "--";
  const displayDuration = wsDuration || (wsEvent?.duration ?? "--");
  const displayEventType = wsEventType && wsEventType !== "NO_EVENT" ? wsEventType : "--";
  const hasScheduleEvent =
    Boolean(wsEvent) && wsEventType !== "NO_EVENT" && displayEventType !== "--";

  const deviceIdHeader = (
    <div title={lastUpdateStr} className="flex flex-col items-start flex-1 min-w-0">
      <div className="w-full">
        <div className="flex items-center">
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
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
    </div>
  );

  const powerToggle = (
    <PowerToggle
      displayState={displayState}
      isLocked={isDisabled}
      loading={loading}
      onClick={handleToggleClick}
    />
  );

  const schedulingFooter = (
    <div className="pt-2 border-t border-gray-200">
      {hasScheduleEvent ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center gap-2">
            <CalendarDays className="w-6 h-6 text-gray-600" />
            <div className="flex flex-col">
              <p className="text-xs text-gray-500 font-semibold">Starting</p>
              <div className="text-xs font-bold text-[#178D8F]">{displayStart}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
              <TimerIcon className="w-3 h-3" /> Duration
            </div>
            <div className="text-xs font-bold text-[#178D8F]">{displayDuration}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 font-semibold">Event Type</div>
            <div className={`text-xs font-bold ${displayEventType === "CURRENT" ? "text-emerald-600" : "text-gray-500"}`}>
              {displayEventType}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-3">
          <CalendarClock size={24} className="text-gray-600" />
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <p className="text-xs font-normal">No Event Found!</p>
              <p className="text-xs font-thin text-gray-500">Schedule your upcoming event.</p>
            </div>
            <CirclePlus
              size={24}
              className="text-gray-600 cursor-pointer"
              onClick={(e) => handleCreateEventPlusClick(e, onCardSelect, onCreateEventClick)}
            />
          </div>
        </div>
      )}
    </div>
  );

  // ── Monitoring ───────────────────────────────────────────────────────────
  if (category === "monitoring") {
    return (
      <div
        onClick={() => onCardSelect?.()}
        className={`freezer-card-container bg-white h-full px-4 py-2 flex flex-col justify-between ${selectedClass}`}
        style={isSelected ? { transform: "scale(1.01)" } : {}}
      >
        <div className="device-id-section flex justify-between items-start">
          {deviceIdHeader}
          <div className={`ambient-pill ${glAlert ? "bg-rose-700/20" : "bg-white/20"} border border-white/30 flex items-center`}>
            <div className="px-2">
              <Wind size={24} className="text-orange-500 my-1" />
            </div>
            <p className="responsive-value-status">
              {displayGas !== null ? `${displayGas}%` : "--"}
            </p>
          </div>
        </div>

        <div className="freezer-temp-section mb-3 flex justify-between">
          <GasMetricItem
            label="Humidity"
            value={displayHumidity !== null ? `${displayHumidity}%` : "--"}
            hasAlert={humidityAlert}
            icon={<img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-1" />}
          />
          <GasMetricItem
            label="Temperature"
            value={displayTemp !== null ? `${displayTemp}°C` : "--"}
            hasAlert={temperatureAlert}
            icon={<img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-1" />}
          />
        </div>
      </div>
    );
  }

  // ── Trigger ──────────────────────────────────────────────────────────────
  if (category === "trigger") {
    return (
      <div
        onClick={() => onCardSelect?.()}
        className={`freezer-card-container bg-white h-full px-4 py-2 flex flex-col justify-between gap-3 ${selectedClass}`}
        style={isSelected ? { transform: "scale(1.01)" } : {}}
      >
        <div className="device-id-section flex justify-between items-start">
          {deviceIdHeader}
          {powerToggle}
        </div>

        <TempHumidityGasMetrics
          displayHumidity={displayHumidity}
          displayTemp={displayTemp}
          displayGas={displayGas}
          humidityAlert={effectiveHumidityAlert}
          temperatureAlert={effectiveTemperatureAlert}
          glAlert={effectiveGlAlert}
        />
      </div>
    );
  }

  // ── Scheduling ─────────────────────────────────────────────────────────────
  return (
    <div
      onClick={() => onCardSelect?.()}
      className={`freezer-card-container bg-white h-full px-4 py-2 flex flex-col justify-between gap-3 ${selectedClass}`}
      style={isSelected ? { transform: "scale(1.01)" } : {}}
    >
      <div className="flex flex-col gap-3 flex-1">
        <div className="device-id-section flex justify-between items-start">
          {deviceIdHeader}
          {powerToggle}
        </div>

        <TempHumidityGasMetrics
          displayHumidity={displayHumidity}
          displayTemp={displayTemp}
          displayGas={displayGas}
          humidityAlert={effectiveHumidityAlert}
          temperatureAlert={effectiveTemperatureAlert}
          glAlert={effectiveGlAlert}
        />
      </div>

      {schedulingFooter}
    </div>
  );
}

GasLeakageDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  deviceName: PropTypes.string,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  espGL: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  glAlert: PropTypes.bool,
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  category: PropTypes.string,
  onRefreshScheduler: PropTypes.func,
  deviceState: PropTypes.string,
  scheduleData: PropTypes.object,
  triggeredAlerts: PropTypes.array,
  onCreateEventClick: PropTypes.func,
};
