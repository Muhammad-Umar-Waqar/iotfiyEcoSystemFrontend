
// src/pages/Dashboard/AQIDeviceCard.jsx
import React, { useMemo, useState, useEffect } from "react";
import GaugeContainer from "../../components/gauge/GaugeContainer"; // adjust path to where you place it
import PropTypes from "prop-types";
import "../../styles/pages/Dashboard/dashboard-styles.css"; // keep existing styling
import { Wind, CalendarDays, TimerIcon } from "lucide-react";
import PowerToggle from "../../components/PowerToggle";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";

function getAQIStatus(aqi) {
  if (aqi === null || aqi === undefined || Number.isNaN(Number(aqi))) return { label: "Unknown", color: "bg-gray-200", textColor: "text-gray-800" };
  const v = Number(aqi);
  if (v <= 50) return { label: "Good", color: "bg-emerald-200", textColor: "text-emerald-800" };
  if (v <= 100) return { label: "Moderate", color: "bg-yellow-200", textColor: "text-yellow-800" };
  if (v <= 150) return { label: "Sensitive", color: "bg-yellow-500", textColor: "text-yellow-900" };
  if (v <= 200) return { label: "Unhealthy", color: "bg-rose-200", textColor: "text-rose-800" };
  if (v <= 300) return { label: "Severe", color: "bg-pink-300", textColor: "text-pink-900" };
  return { label: "Hazardous", color: "bg-violet-300", textColor: "text-violet-900" };
}



export default function AQIDeviceCard({
  deviceId,
  espAQI = null,
  espTemprature = null,
  espHumidity = null,
  isSelected = false,
  onCardSelect,
  humidityAlert = false,
  temperatureAlert = false,
  isOnline = false,
  lastUpdateISO = null,
  category = "monitoring",
  events = [],
  onRefreshScheduler,
  interval = null, // For trigger category
}) {
  const aqi = espAQI ?? null;
  const aqiStatus = getAQIStatus(aqi);

  const { triggerDevice, triggerDeviceManual, skipEvent, fetchToggleStatus, toggleMap, eventsMap } = useScheduler();
  const toggleState = toggleMap?.[deviceId] ?? "off";
  const [loading, setLoading] = useState(false);

  const contextEvents = eventsMap?.[deviceId] ?? [];
  const displayEvents = contextEvents.length > 0 ? contextEvents : events;

  const isSchedulingOrTrigger = category === "scheduling" || category === "trigger";

  // Get current running event
  const runningEvent = useMemo(() => {
    if (!isSchedulingOrTrigger || !displayEvents.length) return null;
    return displayEvents.find(e => e.type === "CURRENT") || null;
  }, [displayEvents, isSchedulingOrTrigger]);

  // Get next event
  const nextEvent = useMemo(() => {
    if (!isSchedulingOrTrigger || !displayEvents.length) return null;
    return displayEvents.find(e => e.type === "NEXT") || null;
  }, [displayEvents, isSchedulingOrTrigger]);

  const displayState = toggleState;
  const isDisabled = !!runningEvent || !isOnline;

  useEffect(() => {
    if (deviceId && isSchedulingOrTrigger) fetchToggleStatus(deviceId);
  }, [deviceId, fetchToggleStatus, isSchedulingOrTrigger]);

  const handleToggleClick = async (e) => {
    e.stopPropagation();

    if (runningEvent) {
      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `The <b>${runningEvent.command || "Scheduled"}</b> event is active.<br/>
               <span style="color:#64748b;font-size:13px">${runningEvent.startTime} → ${runningEvent.endTime}</span><br/><br/>
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
          await skipEvent(deviceId);
          await onRefreshScheduler?.();
        } catch (err) {
          Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not skip event" });
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Use different API based on category
    try {
      setLoading(true);

      if (category === "trigger") {
        // Trigger category: Use PUT /event/manual-trigger/:deviceId
        await triggerDeviceManual(deviceId);
      } else {
        // Scheduling category: Use POST /event/manual-toggle
        const nextAction = toggleState === "on" ? "OFF" : "ON";
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

  const displayEvent = runningEvent || nextEvent;
  const displayStart = displayEvent?.startTime ? formatTime(displayEvent.startTime) : "--";
  const displayDuration = displayEvent?.duration || "--";
  const eventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

  // format last update for title/tooltip
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  return (
    <div onClick={onCardSelect} className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`}>
      <div className="flex h-full justify-between px-4 py-3">
        <div className="h-full flex flex-col justify-around items-between flex-1">
          <div className="flex justify-between items-start">
            <div title={lastUpdateStr}>
              <div className="flex items-center">
                <span
                  aria-hidden
                  className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
                  style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
                />
                <div className="text-xs text-gray-500">Device ID</div>
              </div>
              <div className="text-lg font-bold">{deviceId}</div>
            </div>

            {isSchedulingOrTrigger && (
              <PowerToggle
                displayState={displayState}
                isLocked={isDisabled}
                loading={loading}
                onClick={handleToggleClick}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="border-b-2 border-gray-300 w-full">
              <div className="text-sm text-gray-500">AQI</div>
              {aqi !== null && !Number.isNaN(Number(aqi)) ? (
                (() => {
                  const [intPart, decPart = '0'] = Number(aqi).toFixed(1).split('.');
                  return (
                    <div className="flex items-end mb-2">
                      <span className="text-3xl font-bold leading-none">{intPart}</span>
                      <span className="text-md font-bold leading-none">.{decPart}</span>
                    </div>
                  );
                })()
              ) : (
                <div className="text-3xl font-bold">--</div>
              )}
            </div>
          </div>

          {isSchedulingOrTrigger ? (
            // Scheduling/Trigger: Show appropriate info based on category
            <div className="flex justify-between items-center mt-2">
              {category === "trigger" ? (
                // Trigger category: Show interval only
                <div className="flex items-center justify-center gap-2 w-full">
                  <TimerIcon className="w-5 h-5 text-gray-600" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-semibold">Interval</p>
                    <div className="text-xs font-bold text-[#178D8F]">
                      {interval !== null && interval !== undefined ? `${interval}s` : "--"}
                    </div>
                  </div>
                </div>
              ) : (
                // Scheduling category: Show starting/duration/event type
                <>
                  <div className="flex items-center justify-center gap-2">
                    <CalendarDays className="w-5 h-5 text-gray-600" />
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
                    <div className={`text-xs font-bold ${runningEvent ? "text-emerald-600" : "text-gray-500"}`}>
                      {eventType}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Monitoring: Show temperature/humidity alerts
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
          )}
        </div>

        {!isSchedulingOrTrigger && (
          <div className="flex flex-col items-start justify-center">
            <img src="/windy-icon-greed.svg" alt="Windy Icon" />
            <div className="flex flex-col items-center justify-center">
              <GaugeContainer value={aqi ?? 0} min={0} max={500} />
              <p className={`${aqiStatus.color} ${aqiStatus.textColor} rounded-2xl px-2 text-sm font-semibold py-1 mt-5`}>
                {aqiStatus.label}
              </p>
            </div>
          </div>
        )}
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
