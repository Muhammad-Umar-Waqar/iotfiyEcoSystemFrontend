
import React, { useMemo, useState, useEffect, useRef } from "react";
import { CalendarDays, Sunrise, Sun, Sunset, TimerIcon } from "lucide-react";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import TemperatureRangeMeter from "./TemperatureRangeMeter";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";

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


const PowerToggle = ({ displayState = "off", isLocked = false, loading = false, onClick }) => {

  const isOn = displayState === "on";

  // FORCE gray styling when locked (even if ON/OFF)
  const bgClass = isLocked
    ? "bg-gray-400"
    : isOn
      ? "bg-emerald-500"
      : "bg-rose-500";

  const label = isOn ? "ON" : "OFF";

  const knobClass = isOn ? "translate-x-7" : "translate-x-0";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}  // Disable during loading
      className={`
        relative w-12 h-5 rounded-full
        transition-all duration-300
        flex-shrink-0 focus:outline-none

        ${bgClass}

        ${loading
          ? "opacity-70 "
          : isLocked
            ? "opacity-50 cursor-pointer ring-1 ring-gray-300"
            : "cursor-pointer hover:scale-[1.02]"
        }
      `}
    >
      {/* LOADING SPINNER */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* LABEL - hide when loading */}
      {!loading && (
        <span
          className={`
            absolute top-1/2 -translate-y-1/2
            text-[9px] font-bold tracking-wide
            text-white pointer-events-none
            ${isOn ? "left-2" : "right-1.5"}
          `}
        >
          {label}
        </span>
      )}

      {/* KNOB - hide when loading */}
      {!loading && (
        <div
          className={`
            absolute top-1 left-1
            w-3 h-3 bg-white rounded-full shadow-sm
            transition-transform duration-300
            ${knobClass}
          `}
        />
      )}
    </button>
  );
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
}) {

  const { triggerDevice, skipEvent, fetchToggleStatus, toggleMap, eventsMap } = useScheduler();
  const toggleState = toggleMap?.[deviceId] ?? "off";
  const [loading, setLoading] = useState(false);

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
          console.log(`🔔 [SchedulerDeviceCard ${deviceId}] Timer fired! Fetching toggle status...`);
          fetchToggleStatus(deviceId);
          onRefreshScheduler?.(); // Also refresh events
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
  }, [displayEvents, deviceId, isOnline, fetchToggleStatus, onRefreshScheduler]);

  const runningEvent = useMemo(() => {
    const result = getCurrentRunningEvent(displayEvents);
    console.log(`🎯 [SchedulerDeviceCard ${deviceId}] Running event:`, result);
    return result;
  }, [displayEvents, deviceId]);

  const nextEvent = useMemo(() => {
    const result = getNextEvent(displayEvents);
    console.log(`⏭️ [SchedulerDeviceCard ${deviceId}] Next event:`, result);
    return result;
  }, [displayEvents, deviceId]);

  // const displayState = runningEvent ? "gray" : toggleState;

  const displayState = toggleState;
  const isDisabled = !!runningEvent || !isOnline;  // Disable if event running OR device offline

  console.log(`[TSD ${deviceId}] Final displayState:`, displayState, "| Is Running:", !!runningEvent, "| Is Online:", isOnline);

  useEffect(() => {
    if (deviceId) fetchToggleStatus(deviceId);
  }, [deviceId, fetchToggleStatus]);


  const handleToggleClick = async (e) => {
  e.stopPropagation();

  // ✅ Check if event is running FIRST (higher priority)
  if (runningEvent) {
    // Convert UTC times to local 24-hour format
    const localStartTime = convertUTCToLocal(runningEvent.startTime);
    const localEndTime = convertUTCToLocal(runningEvent.endTime);

    const result = await Swal.fire({
      title: "Event Currently Running",
      html: `
        The <b>${runningEvent.command || "Scheduled"}</b> event is active.<br/>
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
        await skipEvent(deviceId);
        await onRefreshScheduler?.();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: err.message || "Could not skip event",
        });
      } finally {
        setLoading(false);
      }
    }

    return;
  }

  // ✅ For TSD: No isOnline check - let API decide via /event/toggle-switch response
  const nextAction = toggleState === "on" ? "OFF" : "ON";

  try {
    setLoading(true);
    await triggerDevice(deviceId, nextAction);
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

  const displayStart = displayEvent?.startTime ? formatTime(displayEvent.startTime) : "--";

  // ✅ Use duration from API response instead of calculating
  const displayDuration = displayEvent?.duration || "--";

  const eventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg ring-1 ring-[#0D5CA4]/15" : ""} min-h-[175px] cursor-pointer transition hover:shadow-md px-4 py-2 flex flex-col justify-around`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div>
            <div className="flex items-center">
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${isOnline ? "bg-green-300" : "bg-gray-300"}`} />
              <div className="text-xs text-gray-500">Device ID</div>
            </div>
            <div className="text-lg font-bold text-gray-900">{deviceId}</div>
          </div>

          <div className="flex flex-col mt-2 border-b-2 border-[#C3C1C1]">
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
          <div className={`text-xs font-bold ${runningEvent ? "text-emerald-600" : "text-gray-500"}`}>
            {eventType}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SchedulerDeviceCard;