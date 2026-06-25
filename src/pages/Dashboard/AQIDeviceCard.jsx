// src/pages/Dashboard/AQIDeviceCard.jsx
import React, { useMemo, useState } from "react";
import GaugeContainer from "../../components/gauge/GaugeContainer";
import PropTypes from "prop-types";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import { CalendarDays, TimerIcon, CirclePlus, CalendarClock } from "lucide-react";
import PowerToggle from "../../components/PowerToggle";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";
import TruncatedText from "../../components/TruncatedText";
import { resolveAlertState } from "../../utils/triggerAlertUtils";
import { handleCreateEventPlusClick } from "../../utils/schedulingCardUtils";

function getAQIStatus(aqi) {
  if (aqi === null || aqi === undefined || Number.isNaN(Number(aqi))) {
    return { label: "Unknown", color: "bg-gray-200", textColor: "text-gray-800" };
  }
  const v = Number(aqi);
  if (v <= 50) return { label: "Good", color: "bg-emerald-200", textColor: "text-emerald-800" };
  if (v <= 100) return { label: "Moderate", color: "bg-yellow-200", textColor: "text-yellow-800" };
  if (v <= 150) return { label: "Sensitive", color: "bg-yellow-500", textColor: "text-yellow-900" };
  if (v <= 200) return { label: "Unhealthy", color: "bg-rose-200", textColor: "text-rose-800" };
  if (v <= 300) return { label: "Severe", color: "bg-pink-300", textColor: "text-pink-900" };
  return { label: "Hazardous", color: "bg-violet-300", textColor: "text-violet-900" };
}

function TempHumidityAlerts({ espTemprature, espHumidity, temperatureAlert, humidityAlert }) {
  return (
    <div className="flex items-center justify-start gap-4">
      <div className="flex items-center justify-center gap-1">
        <div className="flex flex-col items-center">
          <div className="text-xs">Temperature</div>
          <div className="text-sm text-right font-semibold">{espTemprature ?? "--"}°C</div>
          {temperatureAlert ?
            <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
            <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />
          }
        </div>
      </div>

      <div className="flex items-center justify-center gap-1">
        <div className="flex flex-col items-center">
          <div className="text-xs">Humidity</div>
          <div className="text-sm text-right font-semibold">{espHumidity ?? "--"}%</div>
          {humidityAlert ?
            <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
            <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />
          }
        </div>
      </div>
    </div>
  );
}

function AqiValueDisplay({ aqi }) {
  if (aqi !== null && !Number.isNaN(Number(aqi))) {
    const [intPart, decPart = "0"] = Number(aqi).toFixed(1).split(".");
    return (
      <div className="flex items-end mb-2">
        <span className="text-3xl font-bold leading-none">{intPart}</span>
        <span className="text-md font-bold leading-none">.{decPart}</span>
      </div>
    );
  }
  return <div className="text-3xl font-bold">--</div>;
}

export default function AQIDeviceCard({
  deviceId,
  deviceName,
  espAQI = null,
  espTemprature = null,
  espHumidity = null,
  isSelected = false,
  onCardSelect,
  humidityAlert = false,
  temperatureAlert = false,
  aqiAlert = false,
  isOnline = false,
  lastUpdateISO = null,
  category = "monitoring",
  onRefreshScheduler,
  deviceState = "OFF",
  scheduleData = null,
  triggeredAlerts = [],
  onCreateEventClick,
}) {
  const aqi = espAQI ?? null;
  const aqiStatus = getAQIStatus(aqi);
  const aqiDisplay = aqi !== null && !Number.isNaN(Number(aqi)) ? Number(aqi).toFixed(1) : "--";

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

  const effectiveTemperatureAlert = resolveAlertState(category, triggeredAlerts, "temperature", temperatureAlert);
  const effectiveHumidityAlert = resolveAlertState(category, triggeredAlerts, "humidity", humidityAlert);

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

  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
  const paddingClass = category === "scheduling" ? "pl-4 py-2" : "px-4 py-2";

  const schedulingFooter = category === "scheduling" && (
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
              <p className="text-xs font-thin text-gray-500">Set upcoming event</p>
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

  const gaugeSection = (showToggle = false) => (
    <div className={`flex flex-col items-end justify-center gap-2 h-full`}>
     

      {showToggle && (
        <PowerToggle
        displayState={displayState}
        isLocked={isDisabled}
        loading={loading}
        onClick={handleToggleClick}
        />
      )}

      
      {category === "scheduling" ? (
        <div className="flex flex-col items-end justify-center gap-2">
         
         <div className="pr-4">
         <PowerToggle
            displayState={displayState}
            isLocked={isDisabled}
            loading={loading}
            onClick={handleToggleClick}
          />
         </div>
        
        <div className="flex items-center justify-center gap-5 bg-[#E5EBE4] rounded-l-2xl px-2 py-1">
          <img src="/windy-icon-greed.svg" alt="Windy Icon" className="scale-x-[] w-[3rem] h-[1.5rem]" />
          <div className="flex flex-col items-end justify-center">
            <p className="text-xs font-normal">AQI</p>
            <p className="text-lg font-bold">{aqiDisplay}</p>
          </div>
        </div>
        </div>
      ) : (
        <img src="/windy-icon-greed.svg" alt="Windy Icon" />
      )}

      <div className={`flex flex-col items-center justify-center ${category === "scheduling" ? "pr-2" : ""}`}>
        <GaugeContainer value={aqi ?? 0} min={0} max={500} />
        <p className={`${aqiStatus.color} ${aqiStatus.textColor} rounded-2xl px-2 text-sm font-semibold py-1 mt-2`}>
          {aqiStatus.label}
        </p>
      </div>
    </div>
  );



  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} flex flex-col`}
    >
      <div className={`flex h-full items-center justify-between flex-1 ${paddingClass}`}>
        <div className="h-full flex flex-col justify-around items-between flex-1">
          <div className="flex justify-between items-start">
            {deviceIdHeader}
          </div>

          {category === "scheduling" ? (
            <TempHumidityAlerts
              espTemprature={espTemprature}
              espHumidity={espHumidity}
              temperatureAlert={effectiveTemperatureAlert}
              humidityAlert={effectiveHumidityAlert}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="border-b-2 border-gray-300 w-full">
                  <div className="text-sm text-gray-500">AQI</div>
                  <AqiValueDisplay aqi={aqi} />
                </div>
              </div>

              <TempHumidityAlerts
                espTemprature={espTemprature}
                espHumidity={espHumidity}
                temperatureAlert={effectiveTemperatureAlert}
                humidityAlert={effectiveHumidityAlert}
              />
            </>
          )}

          { schedulingFooter }
        </div>

        {gaugeSection(category === "trigger")}
      </div>

    </div>
  );
}

AQIDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  espAQI: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isSelected: PropTypes.bool,
  onCardSelect: PropTypes.func,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  humidityAlert: PropTypes.bool,
  temperatureAlert: PropTypes.bool,
  category: PropTypes.string,
  events: PropTypes.array,
  onRefreshScheduler: PropTypes.func,
};
