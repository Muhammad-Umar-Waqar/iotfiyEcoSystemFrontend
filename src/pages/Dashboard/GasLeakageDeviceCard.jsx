// src/pages/Dashboard/GasLeakageDeviceCard.jsx

import React, { useMemo, useState, useEffect } from "react";
import TruncatedText from "../../components/TruncatedText";
import "../../styles/global/fonts.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { Wind, Zap, CalendarDays, TimerIcon } from "lucide-react";
import PropTypes from "prop-types";
import PowerToggle from "../../components/PowerToggle";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";

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
  events = [],
  onRefreshScheduler,
  interval = null, // For trigger category
  deviceState = "OFF", // NEW: WebSocket state (ON/OFF)
  scheduleData = null, // NEW: WebSocket schedule data
  triggeredAlerts = [], // NEW: WebSocket triggered alerts for trigger devices
}) {
  const { triggerDevice, triggerDeviceManual, skipEvent, toggleMap, eventsMap } = useScheduler();

  // ✅ Use WebSocket state if available, fallback to context toggleMap
  const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";
  const [loading, setLoading] = useState(false);
  const [apiScheduleData, setApiScheduleData] = useState(null); // ✅ API fallback data for scheduling

  console.log(`🔘 [GasLeakageDeviceCard ${deviceId}] WebSocket state: ${deviceState}, Final toggleState: ${toggleState}`);

  // ✅ Fetch schedule data from API as fallback when WebSocket data is not available
  useEffect(() => {
    const fetchScheduleDataFromAPI = async () => {
      if (category !== "scheduling" || scheduleData) {
        return; // Only fetch for scheduling category and when WebSocket data is not available
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/event/current-next/${deviceId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch schedule data");
        const data = await response.json();
        setApiScheduleData(data);
      } catch (err) {
        console.error(`❌ [GasLeakageDeviceCard ${deviceId}] API fallback error:`, err);
        setApiScheduleData(null);
      }
    };

    fetchScheduleDataFromAPI();
  }, [deviceId, scheduleData, category]);

  const contextEvents = eventsMap?.[deviceId] ?? [];
  const displayEvents = contextEvents.length > 0 ? contextEvents : events;

  const isSchedulingOrTrigger = category === "scheduling" || category === "trigger";

  // ✅ For SCHEDULING: Only check WebSocket data for running event
  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  // For TRIGGER: Use context events (existing logic)
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
  // Use wsRunningEvent for scheduling, runningEvent for trigger
  const isDisabled = (category === "scheduling" ? !!wsRunningEvent : !!runningEvent) || !isOnline;

  const handleToggleClick = async (e) => {
    e.stopPropagation();

    // ✅ Check if device is online BEFORE making API calls
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

    // ✅ For SCHEDULING category: Check WebSocket data ONLY
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

          // ✅ Use PATCH /event/:id/status API to disable the running event
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/event/${wsRunningEvent._id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                status: "INACTIVE" // Backend uses ACTIVE/INACTIVE, frontend shows Enable/Disable
              }),
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

    // ✅ For TRIGGER category: Use existing context logic
    if (category === "trigger" && runningEvent) {
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
    const nextAction = toggleState === "on" ? "OFF" : "ON";

    try {
      setLoading(true);

      if (category === "trigger") {
        // Trigger category: Use PUT /device/manual-trigger/:deviceId with state
        await triggerDeviceManual(deviceId, nextAction);
      } else {
        // Scheduling category: Use POST /event/manual-toggle
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

  // ✅ Priority: WebSocket > API Fallback > Context Events
  const displayEvent = runningEvent || nextEvent;
  const contextEventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

  // WebSocket data
  const wsEvent = scheduleData?.event;
  const wsEventType = scheduleData?.type;
  const wsDuration = scheduleData?.totalDurationText;

  // API fallback data
  const apiEvent = apiScheduleData?.event;
  const apiEventType = apiScheduleData?.type;
  const apiDuration = apiScheduleData?.totalDurationText;

  // Final values with priority
  const finalEvent = wsEvent || apiEvent || displayEvent;
  const finalEventType =
    (wsEventType && wsEventType !== "NO_EVENT") ? wsEventType :
    (apiEventType && apiEventType !== "NO_EVENT") ? apiEventType :
    contextEventType;

  const displayStart = finalEvent?.startTime ? formatTime(finalEvent.startTime) : "--";
  const displayDuration =
    wsDuration ||
    apiDuration ||
    (finalEvent?.duration || "--");
  const eventType = finalEventType !== "NO_EVENT" ? finalEventType : "--";

  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };
  
  
  const displayGas = toInt(espGL);
  const displayHumidity = toInt(espHumidity);
  const displayTemp = toInt(espTemprature);

  const handleCardClick = () => {
    if (onCardSelect) onCardSelect();
  };

  const hasTempOrHum = temperatureAlert || humidityAlert;

  let alertStatus = "none";
  if (glAlert) alertStatus = "gas";
  else if (hasTempOrHum) alertStatus = "other";

  // const textClass = alertStatus !== "none" ? "text-white" : "text-black";

  // const bgClass =
  //   alertStatus === "gas"
  //     ? "bg-[#F59E0B]" // amber
  //     : alertStatus === "other"
  //     ? "bg-green-400"
  //     : "bg-white";

  const selectedClass = isSelected
    ? "shadow-lg transition-transform duration-300 ease-out"
    : "transition-transform duration-300";

    
        // format last update for title/tooltip
  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";

  
  return (
    <div
      onClick={handleCardClick}
      className={`freezer-card-container bg-white  ${selectedClass}`}
      style={isSelected ? { transform: "scale(1.01)" } : {}}
    >
      <div className="freezer-card-content">

        {/* Top Section */}
        <div className="device-id-section">
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

          {isSchedulingOrTrigger ? (
            <PowerToggle
              displayState={displayState}
              isLocked={isDisabled}
              loading={loading}
              onClick={handleToggleClick}
            />
          ) : (
            /* Gas Pill for monitoring */
            <div className={`ambient-pill ${glAlert? "bg-rose-700/20": "bg-white/20"} border border-white/30 flex items-center `}>
              <div className="px-2">
                <Wind size={24} className={"text-orange-500 my-1"} />
              </div>
              <p className="responsive-value-status">
                {displayGas !== null ? `${displayGas}%` : "--"}
              </p>
            </div>
          )}
        </div>

        {/* Middle Section */}
        <div className="freezer-temp-section mb-3">
          <div className="flex items-center justify-between">

            {/* Humidity */}
            <div className="flex items-center">
              <img src="/card-humidity-icon.svg" alt="Humidity" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Humidity</span>
                <span className={`responsive-value  font-bold`}>
                  {displayHumidity !== null ? `${displayHumidity}%` : "--"}
                </span>
                   <p className={`h-2 w-[2.7rem] rounded-full ${humidityAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>

              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center">
              <img src="/temperature-icon.svg" alt="Temperature" className="freezer-icon mr-1" />
              <div className="freezer-temp-info">
                <span className={`freezer-label `}>Temperature</span>
                <span className={`responsive-value  font-bold`}>
                  {displayTemp !== null ? `${displayTemp}°C` : "--"}
                </span>
                  <p className={`h-2 w-[2.7rem] rounded-full ${temperatureAlert ? "bg-rose-300" :  "bg-[#BAEACC]"}`}/>

              </div>

            </div>

          </div>
        </div>

        {/* Scheduling/Trigger Footer */}
        {isSchedulingOrTrigger && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            {category === "trigger" ? (
              // Trigger category: Show interval and triggered alerts from WebSocket
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-2">
                  <TimerIcon className="w-5 h-5 text-gray-600" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 font-semibold">Interval</p>
                    <div className="text-xs font-bold text-[#178D8F]">
                      {interval !== null && interval !== undefined ? `${interval}s` : "--"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-500 font-semibold">Triggered Alerts</p>
                  <div className="text-xs font-bold text-rose-600">
                    {triggeredAlerts && triggeredAlerts.length > 0
                      ? triggeredAlerts.join(", ").replace(/Alert/g, "")
                      : "--"
                    }
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
        )}
      </div>
    </div>
  );
}

GasLeakageDeviceCard.propTypes = {
  deviceId: PropTypes.string,
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

};
