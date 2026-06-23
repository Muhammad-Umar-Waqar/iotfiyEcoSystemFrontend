
import React, { useMemo, useState, useEffect, useRef } from "react";
import { CalendarDays, Sunrise, Sun, Sunset, TimerIcon } from "lucide-react";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import TemperatureRangeMeter from "./TemperatureRangeMeter";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";
import PowerToggle from "../../components/PowerToggle";
import TruncatedText from "../../components/TruncatedText";

// ── Helpers ─────────────────────────────────────────────────────
function formatDuration(duration) {
  if (duration === undefined || duration === null || duration === "") return "--";
  const n = Number(duration);
  if (!Number.isFinite(n)) return String(duration);
  const hours = Math.floor(n / 60);
  const mins = n % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

const toMinutes = (t = "") => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

// ✅ NEW: Calculate milliseconds until next event transition
const calculateNextTransitionTime = (events = [], isOnline = true) => {
  if (!events || events.length === 0) return null;
  if (!isOnline) return null; // Don't schedule if device is offline

  const now = new Date();
  const nowMs = now.getTime();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()];

  let nearestTransitionMs = null;

  events.forEach(event => {
    if (event.status !== "ACTIVE") return;

    const eventDays = (event.days || []).map(d => d.toLowerCase());

    // Check if event applies today
    if (eventDays.length > 0 && !eventDays.includes(todayDay)) {
      // TODO: Could calculate next occurrence on a future day
      return;
    }

    const startMinutes = toMinutes(event.startTime);
    const endMinutes = toMinutes(event.endTime);

    // Handle overnight events (e.g., 13:00 → 01:00 next day)
    const isOvernight = endMinutes < startMinutes;

    // Calculate transition times for today
    const startMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
      Math.floor(startMinutes / 60), startMinutes % 60, 0).getTime();

    let endMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(),
      Math.floor(endMinutes / 60), endMinutes % 60, 0).getTime();

    if (isOvernight && nowMinutes < endMinutes) {
      // We're in the early morning part of an overnight event
      // End time is today
    } else if (isOvernight) {
      // End time is tomorrow
      endMs += 24 * 60 * 60 * 1000;
    }

    // Check if start time is in the future
    if (startMs > nowMs) {
      if (!nearestTransitionMs || startMs < nearestTransitionMs) {
        nearestTransitionMs = startMs;
      }
    }

    // Check if end time is in the future
    if (endMs > nowMs) {
      if (!nearestTransitionMs || endMs < nearestTransitionMs) {
        nearestTransitionMs = endMs;
      }
    }
  });

  return nearestTransitionMs;
};

// Convert UTC time string (HH:MM) to local time string in 12-hour format with AM/PM
const convertUTCToLocal = (utcTimeString) => {
  if (!utcTimeString) return utcTimeString;

  try {
    const [hours, minutes] = utcTimeString.split(':').map(Number);

    // Create a UTC date with today's date + the UTC time
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Get local hours and minutes
    let localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();

    // Convert to 12-hour format
    const period = localHours >= 12 ? 'PM' : 'AM';
    localHours = localHours % 12 || 12; // Convert 0 to 12, and 13-23 to 1-11

    // Format as H:MM AM/PM (no leading zero for hours in 12-hour format)
    return `${localHours}:${String(localMinutes).padStart(2, '0')} ${period}`;
  } catch (err) {
    console.error('Error converting UTC to local:', err);
    return utcTimeString; // Return original if conversion fails
  }
};

// Trust backend 'type' field strictly
const getCurrentRunningEvent = (events = []) => {
  if (!events || events.length === 0) return null;

  // Find the event marked as CURRENT by backend
  const currentEvent = events.find(e => e.type === "CURRENT");

  console.log(`🔍 [getCurrentRunningEvent] Searching for CURRENT event in ${events.length} events`);
  console.log(`🔍 [getCurrentRunningEvent] Found:`, currentEvent);

  return currentEvent || null;
};

const getNextEvent = (events = []) => {
  if (!events || events.length === 0) return null;

  // Find the event marked as NEXT by backend
  const nextEvent = events.find(e => e.type === "NEXT");

  console.log(`🔍 [getNextEvent] Searching for NEXT event in ${events.length} events`);
  console.log(`🔍 [getNextEvent] Found:`, nextEvent);

  return nextEvent || null;
};

// ================== MAIN CARD ==================
const SchedulerDeviceCard = React.memo(function SchedulerDeviceCard({
  deviceId,
  espTemprature,
  espHumidity,
  isOnline,
  onCardSelect,
  isSelected,
  temperatureAlert = false,
  humidityAlert = false,
  pollHitTime,
  events = [],
  onRefreshScheduler,
  scheduleData = null, // NEW: WebSocket schedule data { type, event: { ...eventData, duration } }
  deviceState = "OFF", // NEW: WebSocket state (ON/OFF)
  category = "scheduling", // NEW: Device category for API selection
  deviceName,
  interval = null, // NEW: For trigger category
  triggeredAlerts = [], // NEW: WebSocket triggered alerts for trigger devices
}) {

  const { triggerDevice, skipEvent, toggleMap, eventsMap } = useScheduler();
  const [loading, setLoading] = useState(false);
  const [apiScheduleData, setApiScheduleData] = useState(null); // ✅ NEW: API fallback data

  // ✅ Use WebSocket state if available, fallback to context toggleMap
  const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";

  console.log(`🔘 [SchedulerDeviceCard ${deviceId}] WebSocket state: ${deviceState}, Final toggleState: ${toggleState}`);

  // ✅ Fetch schedule data from API as fallback when WebSocket data is not available
  useEffect(() => {
    const fetchScheduleDataFromAPI = async () => {
      // Only fetch if WebSocket data is not available
      if (scheduleData) {
        console.log(`✅ [SchedulerDeviceCard ${deviceId}] WebSocket schedule data available, skipping API fetch`);
        return;
      }

      try {
        console.log(`🔄 [SchedulerDeviceCard ${deviceId}] Fetching schedule data from API fallback...`);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/event/current-next/${deviceId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch schedule data");
        }

        const data = await response.json();
        console.log(`✅ [SchedulerDeviceCard ${deviceId}] API fallback data:`, data);
        setApiScheduleData(data);
      } catch (err) {
        console.error(`❌ [SchedulerDeviceCard ${deviceId}] API fallback error:`, err);
        setApiScheduleData(null);
      }
    };

    fetchScheduleDataFromAPI();
  }, [deviceId, scheduleData]); // Re-fetch when deviceId changes or when scheduleData changes

  // ✅ Read events from global context instead of props
  const contextEvents = eventsMap?.[deviceId] ?? [];
  const displayEvents = contextEvents.length > 0 ? contextEvents : events;

  console.log(`🔵 [SchedulerDeviceCard ${deviceId}] Context events:`, contextEvents);
  console.log(`🔵 [SchedulerDeviceCard ${deviceId}] Display events:`, displayEvents);
  console.log(`🔵 [SchedulerDeviceCard ${deviceId}] Toggle state:`, toggleState);

  // ✅ Smart Timer: Schedule refresh at exact event transition times
  const timerRef = useRef(null);

  useEffect(() => {
    console.log(`⏰ [SchedulerDeviceCard ${deviceId}] Smart timer effect triggered`);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      console.log(`🧹 [SchedulerDeviceCard ${deviceId}] Cleared existing timer`);
    }

    // Calculate next transition time
    const nextTransitionMs = calculateNextTransitionTime(displayEvents, isOnline);

    if (nextTransitionMs) {
      const now = Date.now();
      const delayMs = nextTransitionMs - now;

      // Only set timer if transition is within next 24 hours
      if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
        console.log(`⏰ [SchedulerDeviceCard ${deviceId}] Setting timer for ${Math.round(delayMs / 1000)}s from now`);

        timerRef.current = setTimeout(() => {
          console.log(`🔔 [SchedulerDeviceCard ${deviceId}] Timer fired! Refreshing scheduler...`);
          onRefreshScheduler?.(); // Refresh events
          console.log(`✅ [SchedulerDeviceCard ${deviceId}] Timer completed refresh`);
        }, delayMs);
      } else {
        console.log(`⚠️ [SchedulerDeviceCard ${deviceId}] Timer delay out of range: ${delayMs}ms`);
      }
    } else {
      console.log(`⚠️ [SchedulerDeviceCard ${deviceId}] No next transition time calculated`);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        console.log(`🧹 [SchedulerDeviceCard ${deviceId}] Cleanup: cleared timer`);
      }
    };
  }, [displayEvents, deviceId, isOnline, onRefreshScheduler]);

  // ✅ Only check WebSocket data for running event (scheduling category only)
  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  // ✅ For display purposes: Get events from context (fallback when WebSocket not available)
  const runningEvent = useMemo(() => {
    const result = getCurrentRunningEvent(displayEvents);
    return result;
  }, [displayEvents]);

  const nextEvent = useMemo(() => {
    const result = getNextEvent(displayEvents);
    return result;
  }, [displayEvents]);

  const displayState = toggleState;
  const isDisabled = !!wsRunningEvent || !isOnline;  // Disable if event running OR device offline

  console.log(`[TSD ${deviceId}] WebSocket running event:`, wsRunningEvent);
  console.log(`[TSD ${deviceId}] Final displayState:`, displayState, "| Is Running:", !!wsRunningEvent, "| Is Online:", isOnline);


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

  // ✅ For SCHEDULING category: Check if WebSocket shows event is running
  if (category === "scheduling" && wsRunningEvent) {
    // Convert UTC times to local 24-hour format
    const localStartTime = convertUTCToLocal(wsRunningEvent.startTime);
    const localEndTime = convertUTCToLocal(wsRunningEvent.endTime);

    const result = await Swal.fire({
      title: "Event Currently Running",
      html: `
        The <b>${wsRunningEvent.command || "Scheduled"}</b> event is active.<br/>
        <span style="color:#64748b;font-size:13px">
          ${localStartTime} → ${localEndTime}
        </span><br/><br/>
        Do you want to disable this event?
      `,
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

        const data = await response.json();

        // ✅ Refresh to sync with EventsSection (will update both card and EventsSection toggle)
        await onRefreshScheduler?.();

        Swal.fire({
          icon: "success",
          title: "Event Disabled",
          text: data.message || "The event has been successfully disabled.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: err.message || "Could not disable event",
        });
      } finally {
        setLoading(false);
      }
    }

    return;
  }


  const nextAction = toggleState === "on" ? "OFF" : "ON";

  try {
    setLoading(true);

    // ✅ Call different API based on category
    if (category === "trigger") {
      // Trigger device API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/device/manual-trigger/${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ state: nextAction }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to trigger device");
      }

      await response.json();
    } else {
      // Scheduling device API (requires eventId)
      const eventId = scheduleData?.event?._id;

      // if (!eventId) {
      //   throw new Error("No active event found. Cannot toggle without an event.");
      // }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/event/manual-toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ deviceId, eventId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle device");
      }

      await response.json();
    }

    // Refresh scheduler after successful API call
    await onRefreshScheduler?.();

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: err.message || "Command failed",
    });
  } finally {
    setLoading(false);
  }
};


  const temp = Number(espTemprature) || 0;
  const hum = Number(espHumidity) || 0;

  const hour = useMemo(() => new Date(pollHitTime).getHours(), [pollHitTime]);
  const timeOfDay = hour >= 5 && hour <= 8 ? "sunrise"
    : hour >= 9 && hour <= 16 ? "day"
      : hour >= 17 && hour <= 19 ? "sunset" : "night";

  const statusColorClass = (hasAlert) => hasAlert ? "bg-rose-300" : "bg-emerald-200";

  const formatTime = (time) => {
    if (!time) return "--:--";

    // Parse UTC time from backend (24-hour format)
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(h, m, 0);

    // Convert to local time
    const localHours = date.getHours();
    const localMinutes = date.getMinutes();

    // Convert to 12-hour format with AM/PM
    const hour12 = localHours % 12 || 12;
    const ampm = localHours >= 12 ? "PM" : "AM";

    return `${String(hour12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")} ${ampm}`;
  };

  // Show CURRENT event if running, otherwise show NEXT event
  const displayEvent = runningEvent || nextEvent;

  // Calculate event type from context events (fallback)
  const eventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

  // ✅ Priority: WebSocket > API Fallback > Context Events
  // 1. WebSocket schedule data (real-time)
  const wsEvent = scheduleData?.event;
  const wsEventType = scheduleData?.type;
  const wsDuration = scheduleData?.totalDurationText;

  // 2. API fallback data (when WebSocket not available)
  const apiEvent = apiScheduleData?.event;
  const apiEventType = apiScheduleData?.type;
  const apiDuration = apiScheduleData?.totalDurationText;

  // 3. Determine what to display (priority order)
  const finalEvent = wsEvent || apiEvent || displayEvent;
  const finalEventType =
    (wsEventType && wsEventType !== "NO_EVENT") ? wsEventType :
    (apiEventType && apiEventType !== "NO_EVENT") ? apiEventType :
    eventType;

  const displayStart = finalEvent?.startTime ? formatTime(finalEvent.startTime) : "--";

  // ✅ Use duration from WebSocket or API fallback (already formatted as "3h 50m")
  const displayDuration =
    wsDuration ||
    apiDuration ||
    (finalEvent?.duration ? formatDuration(finalEvent.duration) : "--");

  const displayEventType = finalEventType !== "NO_EVENT" ? finalEventType : "--";

  console.log(`📅 [SchedulerDeviceCard ${deviceId}] WebSocket schedule:`, scheduleData);
  console.log(`📅 [SchedulerDeviceCard ${deviceId}] API fallback schedule:`, apiScheduleData);
  console.log(`📅 [SchedulerDeviceCard ${deviceId}] Final display - Start: ${displayStart}, Duration: ${displayDuration}, Type: ${displayEventType}`);

  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg ring-1 ring-[#0D5CA4]/15" : ""} min-h-[175px] cursor-pointer transition hover:shadow-md px-4 py-2 flex flex-col justify-around`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start flex-1 min-w-0">
          <div className="w-full">
            <div className="flex items-center">
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${isOnline ? "bg-green-300" : "bg-gray-300"}`} />
              <div className="text-xs text-gray-500">Device ID</div>
            </div>

            <TruncatedText
              text={deviceName}
              className="text-lg font-bold text-gray-900"
              maxLines={1}
              tooltipPlacement="top"
            />
          </div>

          {/* <div className="flex flex-col mt-2 border-b-2 border-[#C3C1C1]"> */}
          <div className="flex flex-col mt-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${timeOfDay === "sunrise" ? "border border-gray-600" : ""}`}><Sunrise size={18} /></div>
              <div className={`p-2 rounded-full ${timeOfDay === "day" ? "border border-gray-600" : ""}`}><Sun size={18} /></div>
              <div className={`p-2 rounded-full ${(timeOfDay === "sunset" || timeOfDay === "night") ? "border border-gray-600" : ""}`}><Sunset size={18} /></div>
            </div>
            <TemperatureRangeMeter value={Math.round(temp)} />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <PowerToggle displayState={displayState} isLocked={isDisabled} loading={loading} onClick={handleToggleClick} />

          <div className="flex flex-col items-end">
            <div className="text-right">
              <div className="text-xs text-gray-500">Humidity</div>
              <div className="text-xl font-bold">{Math.round(hum)}%</div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                <div className={`h-2 ${statusColorClass(humidityAlert)}`} />
              </div>
            </div>
            <div className="text-right mt-2">
              <div className="text-xs text-gray-500">Temperature</div>
              <div className="text-xl font-bold">{Math.round(temp)}°C</div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                <div className={`h-2 ${statusColorClass(temperatureAlert)}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
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
          </>
        )}
      </div>
    </div>
  );
});

export default SchedulerDeviceCard;