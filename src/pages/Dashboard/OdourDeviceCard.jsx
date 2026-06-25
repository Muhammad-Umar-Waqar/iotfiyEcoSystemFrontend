// src/pages/Dashboard/OdourDeviceCard.jsx
import React, { useMemo, useState } from "react";
import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import PropTypes from "prop-types";
import { CalendarDays, TimerIcon, CirclePlus, CalendarClock } from "lucide-react";
import PowerToggle from "../../components/PowerToggle";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";
import TruncatedText from "../../components/TruncatedText";
import { resolveAlertState } from "../../utils/triggerAlertUtils";
import { handleCreateEventPlusClick } from "../../utils/schedulingCardUtils";

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function MonitoringMetricItem({ icon, iconAlt, label, value, hasAlert }) {
  return (
    <div className="flex items-center">
      <img src={icon} alt={iconAlt} className="freezer-icon mr-1" />
      <div className="freezer-temp-info">
        <span className="freezer-label">{label}</span>
        <span className="responsive-value font-bold">{value}</span>
        <p className={`h-2 w-[2.7rem] rounded-full ${hasAlert ? "bg-rose-300" : "bg-[#BAEACC]"}`} />
      </div>
    </div>
  );
}

function OdourMetricItem({ icon, iconAlt, label, value, hasAlert }) {
  return (
    <div className="flex items-center justify-center bg-[#F5F4ED]/60 100 rounded-md w-full"> 
      <div className="flex flex-col items-center justify-center py-2">
        <div className="flex flex-col items-center justify-center">
          <img src={icon} alt={iconAlt} className="h-5 w-5 mr-1" />
        <span className="text-gray-500 text-xs ">
          {label}
          </span>
        </div>
        <span className="text-lg font-bold">{value}</span>
        <p className={`h-2 w-[2.7rem] rounded-full ${hasAlert ? "bg-rose-300" : "bg-[#BAEACC]"}`} />
      </div>
    </div>
  );
}

function TempHumidityOdourMetrics({
  displayHumidity,
  displayTemp,
  displayOdour,
  humidityAlert,
  temperatureAlert,
  odourAlert,
}) {
  const odourIcon = odourAlert ? "/anti-odour.png" : "/odour-alert.svg";

  return (
    // <div className="freezer-temp-section flex justify-between gap-2">
    <div className="freezer-temp-section flex space-x-2 w-full">
      <OdourMetricItem
        icon="/card-humidity-icon.svg"
        iconAlt="Humidity"
        label="Humidity"
        value={displayHumidity !== null ? `${displayHumidity}%` : "--"}
        hasAlert={humidityAlert}
      />
      <OdourMetricItem
        icon="/temperature-icon.svg"
        iconAlt="Temperature"
        label="Temperature"
        value={displayTemp !== null ? `${displayTemp}°C` : "0°C"}
        hasAlert={temperatureAlert}
      />
      <OdourMetricItem
        icon="/anti-odour.png"
        iconAlt="Odour"
        label="Odour"
        value={displayOdour !== null ? `${displayOdour}%` : "0%"}
        hasAlert={odourAlert}
      />
    </div>
  );
}

export default function OdourDeviceCard({
  deviceId,
  deviceName,
  isSelected = false,
  onCardSelect,
  espTemprature = null,
  espHumidity = null,
  temperatureAlert = false,
  humidityAlert = false,
  espOdour = null,
  odourAlert = false,
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

  const displayTemp = toInt(espTemprature);
  const displayHumidity = toInt(espHumidity);
  const displayOdour = toInt(espOdour);

  const effectiveTemperatureAlert = resolveAlertState(category, triggeredAlerts, "temperature", temperatureAlert);
  const effectiveHumidityAlert = resolveAlertState(category, triggeredAlerts, "humidity", humidityAlert);
  const effectiveOdourAlert = resolveAlertState(category, triggeredAlerts, "odour", odourAlert);

  const lastUpdateTitle = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  const devicePill = {
    label: `${displayOdour !== null ? displayOdour : 0}%`,
    img: odourAlert ? "/anti-odour.png" : "/odour-alert.svg",
    alt: "Odour",
  };

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

  const selectedClass = isSelected
    ? "shadow-lg transition-transform duration-300 ease-out"
    : "transition-transform duration-300";

  const deviceIdHeader = (
    <div title={lastUpdateTitle} className="flex flex-col items-start flex-1 min-w-0">
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
    <div className="px-4 pb-3">
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
    </div>
  );

  // ── Monitoring (unchanged) ─────────────────────────────────────────────
  if (category === "monitoring") {
    return (
      <div
        onClick={() => onCardSelect?.()}
        className={`freezer-card-container bg-white ${selectedClass} h-auto min-h-[180px] sm:h-auto`}
        style={isSelected ? { transform: "scale(1.01)" } : {}}
      >
        <div className="relative w-full h-full">
          <div className="flex flex-col justify-around h-full py-2 px-4">
            <div className="device-id-section flex justify-between items-start">
              {deviceIdHeader}
              <div className={`ambient-pill ${odourAlert ? "bg-rose-700/20" : "bg-white/20"} border border-white/30 flex items-center`}>
                <img src={devicePill.img} alt={devicePill.alt} className="h-[2rem] w-[2rem] py-1" />
                <div>
                  <p className="responsive-value-status">{devicePill.label}</p>
                </div>
              </div>
            </div>

            <div className="freezer-temp-section mb-3 flex justify-between">
              <MonitoringMetricItem
                icon="/card-humidity-icon.svg"
                iconAlt="Humidity"
                label="Humidity"
                value={displayHumidity !== null ? `${displayHumidity}%` : "--"}
                hasAlert={humidityAlert}
              />
              <MonitoringMetricItem
                icon="/temperature-icon.svg"
                iconAlt="Temperature"
                label="Temperature"
                value={displayTemp !== null ? `${displayTemp}°C` : "0°C"}
                hasAlert={temperatureAlert}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Trigger ────────────────────────────────────────────────────────────────
  if (category === "trigger") {
    return (
      <div
        onClick={() => onCardSelect?.()}
        className={`freezer-card-container bg-white ${selectedClass} `}
        style={isSelected ? { transform: "scale(1.01)" } : {}}
      >
        <div className="relative w-full h-full">
          <div className=" flex flex-col justify-between h-full py-2 px-4">
            <div className="device-id-section flex justify-between items-start">
              {deviceIdHeader}
              {powerToggle}
            </div>

<div className="mb-4">
            <TempHumidityOdourMetrics
              displayHumidity={displayHumidity}
              displayTemp={displayTemp}
              displayOdour={displayOdour}
              humidityAlert={effectiveHumidityAlert}
              temperatureAlert={effectiveTemperatureAlert}
              odourAlert={effectiveOdourAlert}
            />
              </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Scheduling ───────────────────────────────────────────────────────────
  return (
    // <div
    //   onClick={() => onCardSelect?.()}
    //   className={`freezer-card-container bg-white ${selectedClass} flex flex-1  flex-col`}
    //   style={isSelected ? { transform: "scale(1.01)" } : {}}
    // >
    //   <div className="relative w-full px-4 py-2">
    //     <div className="flex flex-col justify-between h-full">
    //       <div className="device-id-section flex justify-between items-start">
    //         {deviceIdHeader}
    //         {powerToggle}
    //       </div>

    //       <TempHumidityOdourMetrics
    //         displayHumidity={displayHumidity}
    //         displayTemp={displayTemp}
    //         displayOdour={displayOdour}
    //         humidityAlert={humidityAlert}
    //         temperatureAlert={temperatureAlert}
    //         odourAlert={odourAlert}
    //       />
    //     </div>
    //   </div>

    //   {schedulingFooter}
    // </div>

    <div
  className={`freezer-card-container bg-white ${selectedClass} flex flex-col`}
>
  <div className="relative w-full px-4 py-2 flex-1 flex flex-col">
    <div className="device-id-section flex justify-between items-start">
      {deviceIdHeader}
      {powerToggle}
    </div>

    <div className="flex-1 flex items-center">
            <TempHumidityOdourMetrics
              displayHumidity={displayHumidity}
              displayTemp={displayTemp}
              displayOdour={displayOdour}
              humidityAlert={effectiveHumidityAlert}
              temperatureAlert={effectiveTemperatureAlert}
              odourAlert={effectiveOdourAlert}
            />
    </div>
  </div>

  {schedulingFooter}
</div>
  );
}

OdourDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  deviceName: PropTypes.string,
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  espOdour: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  odourAlert: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  category: PropTypes.string,
  onRefreshScheduler: PropTypes.func,
  deviceState: PropTypes.string,
  scheduleData: PropTypes.object,
};
