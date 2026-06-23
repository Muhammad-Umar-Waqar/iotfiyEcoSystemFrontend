import AlertsChart from "./AlertsChart";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useState } from "react";
import QRCode from "./QrCode";
import { useLocation } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Skeleton } from "@mui/material";
import { fetchVenuesByOrganization } from "../../slices/VenueSlice";
import { Download, Cloud, Zap, SquareActivity, Plug, Power } from "lucide-react";
import Swal from "sweetalert2";
import DownloadModal from "./DownloadModal";
import EventsSection from "../../components/events/EventsSection";
import TriggerEventsSection from "../../components/events/TriggerEventsSection";
import { useScheduler } from "../../contexts/SchedulerContext";

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

export default function VenueDetailsPanel({
  organizationId = null,
  venueName = "Karim Korangi Branch",
  deviceType = null,
  category = "monitoring",
  espTemprature = 0,
  ambientTemperature = 0,
  espHumidity = 0,
  batteryLow = true,
  needMaintenance = true,
  apiKey = "",
  closeIcon = false,
  onClose = undefined,
  odourAlert = false,
  temperatureAlert = false,
  humidityAlert = false,
  aqiAlert = false,
  glAlert = false,
  deviceId = "",
  espOdour = 0,
  espAQI = null,
  espGL = null,
  lastUpdateTime = null,
  espVoltage = null,
  espCurrent = null,
  espPower = null,
  isOnline = true,
  deviceState = "OFF", // NEW: WebSocket state
  scheduleData = null, // NEW: WebSocket schedule data for eventId
}) {

  const dispatch = useDispatch();
  const user  = useSelector((state) => state.auth.user);
  const orgId = organizationId || user?.organization || null;

  const { eventsMap, toggleMap, setEvents, triggerDevice, skipEvent } = useScheduler();

  const schedulerEvents = deviceId ? eventsMap[deviceId] ?? [] : [];

  // ✅ Use WebSocket state if available, fallback to context toggleMap
  const resolvedToggle = useMemo(() => {
    return deviceState?.toLowerCase() || (deviceId ? (toggleMap?.[deviceId] ?? "off") : "off");
  }, [deviceId, toggleMap, deviceState]);

  console.log(`🔘 [VenueDetailsPanel ${deviceId}] WebSocket state: ${deviceState}, Final toggle: ${resolvedToggle}`);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const venueId = params.get("venue");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const orgVenues = useSelector((state) => (orgId ? state.Venue.venuesByOrg[orgId] || [] : []));
  const globalVenues = useSelector((state) => state.Venue.Venues || []);
  const venuesFromSlice = orgVenues.length ? orgVenues : globalVenues;
  const isSchedulerDevice = String(deviceType) === "TSD" || category === "scheduling";

  useEffect(() => {
    if (orgId && !orgVenues.length) {
      dispatch(fetchVenuesByOrganization(orgId));
    }
  }, [orgId, orgVenues.length, dispatch]);

  // ── Trust Backend Type (Same logic as Card) ──
  const runningSchedulerEvent = useMemo(() => {
    if (!schedulerEvents || schedulerEvents.length === 0) return null;

    let item = schedulerEvents[0];

    // Handle wrapped response {type: "CURRENT", event: {...}}
    if (item?.type === "CURRENT" && item?.event) {
      item = item.event;
    }

    // Only consider it running if backend says type === "CURRENT"
    return item?.type === "CURRENT" ? item : null;
  }, [schedulerEvents]);

  const displayToggleState = useMemo(() => {
    // Show gray when event is running OR device is offline
    if (runningSchedulerEvent || !isOnline) return "gray";
    return resolvedToggle;
  }, [runningSchedulerEvent, resolvedToggle, isOnline]);

  // ✅ Refresh events from backend (same logic as EventsSection)
  const refreshEvents = async () => {
    try {
      if (!deviceId) return;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      const fetchedEvents = data.schedules || [];

      // Fetch current/next status and mark events
      const statusRes = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const statusData = await statusRes.json();

      let markedEvents = fetchedEvents;
      if (statusData && statusData.event) {
        const { type, event } = statusData;
        markedEvents = fetchedEvents.map(e => {
          if (e._id === event._id) {
            return { ...e, ...event, type };
          }
          return e;
        });
      }

      // Sync to context
      setEvents(deviceId, markedEvents);

    } catch (err) {
      console.error("Failed to refresh events:", err);
    }
  };

  // Handle Toggle Click (Same as Card)
  const handleSchedulerToggleClick = async () => {
    if (runningSchedulerEvent) {
      // Convert UTC times to local 24-hour format
      const localStartTime = convertUTCToLocal(runningSchedulerEvent.startTime);
      const localEndTime = convertUTCToLocal(runningSchedulerEvent.endTime);

      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `
          The <b>${runningSchedulerEvent.command || "Scheduled"}</b> event is currently active.<br/>
          <span style="color:#64748b;font-size:13px">
            ${localStartTime} → ${localEndTime}
          </span>
          <br/><br/>
          Do you want to disable this event?
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, disable it",
        cancelButtonText: "Keep running",
        confirmButtonColor: "#EF4444",
      });

      if (result.isConfirmed) {
        try {
          setLoading(true);
          await skipEvent(deviceId);
          await refreshEvents();
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

    // No running event → normal toggle
    // ✅ Check if device is online BEFORE making API calls
    if (!isOnline) {
      await Swal.fire({
        title: "Device Offline",
        html: `
          <b>${deviceId}</b> is currently offline.<br/>
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

    try {
      setLoading(true);
      const nextAction = resolvedToggle === "on" ? "OFF" : "ON";

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
        // Scheduling device API (requires eventId from WebSocket)
        const eventId = scheduleData?.event?._id;

        if (!eventId) {
          throw new Error("No active event found. Cannot toggle without an event.");
        }

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

      // Refresh events after successful API call
      await refreshEvents();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Failed to send command",
      });
    } finally {
      setLoading(false);
    }
  };

  // Rest of your existing code (Metrics, etc.) remains same
  const sameId = (a, b) => String(a) === String(b);
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  };

  const displayTemp = toInt(espTemprature ?? ambientTemperature);
  const displayHumidity = toInt(espHumidity);
  const displayOdour = toInt(espOdour);
  const displayAQI = espAQI === null || espAQI === undefined ? null : toInt(espAQI);
  const displayGL = espGL === null || espGL === undefined ? null : toInt(espGL);
  const isEMD = String(deviceType) === "EMD";

  const currentVenueSlice = venuesFromSlice.find((v) => sameId(v._id, venueId) || sameId(v.id, venueId)) || null;

  const displayVenueName = currentVenueSlice?.name || currentVenueSlice?.venueName || venueName || "Venue";

  const handleDownload = () => setDownloadOpen(true);

  const formatLastUpdate = (time) => {
    console.log('VenueDetailsPanel - lastUpdateTime received:', time, 'Type:', typeof time);

    // Handle string "null" or actual null/undefined
    if (!time || time === 'null' || time === 'undefined') return null;

    // Handle different timestamp formats
    let date;
    if (time instanceof Date) {
      date = time;
    } else if (typeof time === 'string' || typeof time === 'number') {
      date = new Date(time);
    } else {
      console.warn('Invalid lastUpdateTime format:', time);
      return 'Invalid Date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from:', time);
      return 'Invalid Date';
    }

    return date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  function formatPowerValue(espVoltage, espCurrent) {
    const v = Number(espVoltage);
    const c = Number(espCurrent);
    if (!Number.isFinite(v) || !Number.isFinite(c)) return "--";
    const watts = v * c;
    if (watts >= 1_000_000) return `${(watts / 1_000_000).toFixed(3)} MW`;
    if (watts >= 1000) return `${(watts / 1000).toFixed(3)} kW`;
    return `${watts.toFixed(2)} W`;
  }

  function formatUnitValue(espPower, espVoltage, espCurrent) {
    const power = Number(espPower);
    const fallbackWatts = Number.isFinite(Number(espVoltage)) && Number.isFinite(Number(espCurrent))
      ? Number(espVoltage) * Number(espCurrent) : null;
    const watts = Number.isFinite(power) ? power : fallbackWatts;
    if (!Number.isFinite(watts)) return "--";
    return `${(watts / 1000).toFixed(3)} kWh`;
  }

  const topMetrics = (() => {
    const tempMetric = {
      key: "temperature", label: "Temperature", unit: "°C",
      value: displayTemp !== null ? displayTemp : "--",
      img: "/temperature-icon.svg", lucideIcon: null,
      alertFlag: !!temperatureAlert, color: "green",
    };
    const humMetric = {
      key: "humidity", label: "Humidity", unit: "%",
      value: displayHumidity !== null ? displayHumidity : "--",
      img: "/humidity-alert.svg", lucideIcon: null,
      alertFlag: !!humidityAlert, color: "green",
    };

    if (String(deviceType) === "EMD") {
      return [
        { key: "power", label: "Power", unit: "", value: formatPowerValue(espVoltage, espCurrent), img: null, lucideIcon: <Zap size={30} />, alertFlag: false, color: "green" },
        { key: "current", label: "Current", unit: "A", value: espCurrent !== null && espCurrent !== undefined ? +Number(espCurrent).toFixed(2) : "--", img: null, lucideIcon: <SquareActivity size={30} />, alertFlag: false, color: "green" },
        { key: "voltage", label: "Voltage", unit: "V", value: espVoltage !== null && espVoltage !== undefined ? +Number(espVoltage).toFixed(1) : "--", img: null, lucideIcon: <Plug size={30} />, alertFlag: false, color: "green" },
      ];
    }
    if (String(deviceType) === "OMD") {
      return [
        { key: "odour", label: "Odour", unit: "%", value: displayOdour ?? 0, img: "/odour-alert.svg", lucideIcon: null, alertFlag: !!odourAlert, color: "red" },
        tempMetric, humMetric,
      ];
    }
    if (String(deviceType) === "AQIMD") {
      return [
        { key: "aqi", label: "AQI", unit: "AQI", value: displayAQI ?? "--", img: null, lucideIcon: <Cloud size={36} />, alertFlag: !!aqiAlert, color: "red" },
        tempMetric, humMetric,
      ];
    }
    if (String(deviceType) === "GLMD") {
      return [
        { key: "gas", label: "Gas", unit: "%", value: displayGL ?? "--", img: null, lucideIcon: <Zap size={36} />, alertFlag: !!glAlert, color: "red" },
        tempMetric, humMetric,
      ];
    }
    return [tempMetric, humMetric];
  })();

  const emdExtraMetrics = isEMD ? [
    { key: "unit", label: "Unit", unit: "", value: formatUnitValue(espPower, espVoltage, espCurrent), img: null, lucideIcon: <Zap size={30} />, alertFlag: false, color: "green" },
    { key: "temperature", label: "Temperature", unit: "°C", value: displayTemp !== null ? displayTemp : "--", img: "/temperature-icon.svg", lucideIcon: null, alertFlag: false, color: "green" },
    { key: "humidity", label: "Humidity", unit: "%", value: displayHumidity !== null ? displayHumidity : "--", img: "/humidity-alert.svg", lucideIcon: null, alertFlag: false, color: "green" },
  ] : [];

  const statusText = (flag) => (flag ? "Alert Det." : "Not Det.");
  const statusClass = (flag, color = "green") => {
    if (flag) {
      if (color === "red") return "border-red-500";
      return "border-green-500";
    }
    return "border-gray-300";
  };

  const renderMetricValue = (m) => {
    const isSplitMetric = ["power", "unit"].includes(m.key);
    if (isSplitMetric && typeof m.value === "string" && m.value !== "--") {
      const parts = m.value.split(" ");
      const num = parts[0];
      const unit = parts[1] || "";
      return <>{num}<span className="text-sm font-thin ml-1">{unit}</span></>;
    }
    return <>{m.value ?? "--"}{m.unit ? <span className="text-sm font-thin ml-1">{m.unit}</span> : ""}</>;
  };

  return (
    <div className={`dashboard-right-panel shadow-sm flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-l border-[#E5E7EB]/40 bg-white max-w-[95vw] min-w-0 `}>
  
    <div className="w-full rounded-lg p-6 shadow-sm space-y-6" style={{ backgroundColor: "#07518D12" }}>
      {closeIcon && (
        <div className="flex justify-between items-center">
          <img src="/iotfiy_logo_rpanel.svg" alt="IOTFIY LOGO" className="h-[30px] w-auto" />
          <IconButton onClick={() => typeof onClose === "function" && onClose()} edge="start" aria-label="close-details" size="small">
            <CloseIcon />
          </IconButton>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]/40 mb-6">
        <div>
          <p className="text-sm text-[#64748B] font-medium">Device ID</p>
          <h2 className="text-sm text-[#1E293B] font-bold">{deviceId || <Skeleton variant="text" width={70} />}</h2>
          <div className="text-xs text-gray-600">{displayVenueName}</div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-3 py-2 bg-[#0D5CA4] text-white rounded-full text-xs font-semibold hover:bg-[#0b4e8a] active:scale-[.98] transition shadow-sm cursor-pointer"
          aria-label="Download"
        >
          <span className="leading-none">Download</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics display */}
      <div className="relative w-full overflow-hidden mb-6 bg-[#07518D]/[0.05] rounded-xl p-3">
        {isEMD ? (
          <div className="space-y-4">
           <div className="grid grid-cols-3 gap-4">
              {topMetrics.map((m) => (
                <div key={m.key} className="flex-1 flex flex-col items-center justify-center">
                  <div className="mb-2">
                    {m.img ? <img src={m.img} className="h-[30px] w-auto" alt={m.label} />
                      : m.lucideIcon ? <div className="text-[#0D5CA4]">{m.lucideIcon}</div>
                      : <img src="/odour-alert.svg" className="h-[66px] w-auto" alt={m.label} />}
                  </div>
                  <div className="text-sm text-gray-600">{m.label}</div>
                  <div className="text-xl font-semibold">{renderMetricValue(m)}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {emdExtraMetrics.map((m) => (
                <div key={m.key} className="flex-1 flex flex-col items-center justify-center">
                  <div className="mb-2">
                    {m.img ? <img src={m.img} className="h-[30px] w-auto" alt={m.label} />
                      : m.lucideIcon ? <div className="text-[#0D5CA4]">{m.lucideIcon}</div>
                      : <img src="/odour-alert.svg" className="h-[66px] w-auto" alt={m.label} />}
                  </div>
                  <div className="text-sm text-gray-600">{m.label}</div>
                  <div className="text-xl font-semibold">{renderMetricValue(m)}</div>
                </div>
              ))}
            </div>
            {/* EMD metrics */}

          </div>
        ) : (
          <div className={`flex items-center justify-between gap-4 ${topMetrics.length === 2 ? "sm:justify-around" : ""}`}>
            {topMetrics.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-2">
                  {m.img ? <img src={m.img} className="h-[30px] w-auto" alt={m.label} />
                    : m.lucideIcon ? <div className="text-[#0D5CA4]">{m.lucideIcon}</div>
                      : <img src="/odour-alert.svg" className="h-[66px] w-auto" alt={m.label} />}
                </div>
                <div className="text-sm text-gray-600">{m.label}</div>
                <div className="text-xl font-semibold">{renderMetricValue(m)}</div>
              </div>
            ))}

            {/* Large Power Button for TSD */}
            {isSchedulerDevice && (
              <button
                onClick={handleSchedulerToggleClick}
                disabled={loading}
                className={`flex flex-col justify-center items-center gap-3 px-4 py-5 rounded-xl text-sm font-semibold text-white transition shadow-sm active:scale-[.98]
                  ${loading
                    ? "bg-gray-400 cursor-wait opacity-70"
                    : displayToggleState === "on" ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                    : displayToggleState === "off" ? "bg-rose-500 hover:bg-rose-600 cursor-pointer"
                      : "bg-gray-400 hover:bg-gray-500 cursor-pointer"}`}
                title={loading ? "Processing..." : displayToggleState === "gray" ? "Event running or device offline — click to disable" : displayToggleState === "on" ? "Turn Off" : "Turn On"}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Power size={15} strokeWidth={2} />
                )}
                <span className="text-xs font-bold">
                  {loading ? "..." : displayToggleState === "on" ? "ON" : displayToggleState === "off" ? "OFF" : ""}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status badges */}
      {!isEMD && (
        <div className={`grid ${topMetrics.length === 2 ? "grid-cols-2 md:grid-cols-2" : "grid-cols-2 md:grid-cols-2"} gap-2`}>
          {topMetrics.map((m) => {
            const flag = !!m.alertFlag;
            const color = m.color ?? "green";
            return (
              <div key={m.key} className={`flex items-center gap-3 p-1 border rounded ${statusClass(flag, color)}`}>
                {m.img ? <img src={m.img} alt={m.label} className="w-6 h-6" />
                  : m.lucideIcon ? <div className="w-6 h-6 flex items-center justify-center">{m.lucideIcon}</div>
                    : <img src="/alert-icon.png" alt={m.label} className="w-6 h-6" />}
                <div>
                  <div className="text-xs text-gray-600">{m.label}</div>
                  <div className="text-sm font-medium">{statusText(flag)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* API key / QR + Last Update */}
      <div>
        {apiKey ? (
          <div className="mt-3 p-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 break-words px-2">
            <div className="flex items-center justify-between">
              <div>
                <strong>API Key:</strong>
                <div className="mt-2 text-sm" title={apiKey}>
                  {apiKey ? `${apiKey.slice(0, 15)}...` : ""}
                </div>
              </div>
              <QRCode apiKey={apiKey} baseUrl={import.meta.env.VITE_REACT_URI || "http://localhost:5173"} />
            </div>
          </div>
        ) : (
          <div className="mt-3 p-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 break-words px-2">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton variant="text" width={50} height={20} className="mb-2" />
                <Skeleton variant="text" width={120} height={20} className="mb-2" />
              </div>
              <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: "10%" }} />
            </div>
          </div>
        )}

        {lastUpdateTime && (
          <div className="text-center mt-3 p-2 rounded-xl bg-[#07518D]/[0.05] font-thin text-xs sm:text-md">
            Last Update: {formatLastUpdate(lastUpdateTime)}
          </div>
        )}
      </div>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        measurement={deviceId}
        bucket="Odour"
        deviceType={deviceType}
      />

      {isSchedulerDevice && (
        <div className="pt-6">
          <EventsSection
            selectedDevice={{ deviceId, venueId, venueName: displayVenueName, deviceType, category }}
            onEventsChange={(updated) => { }}
            externalOpen={powerModalOpen}
            onExternalClose={() => setPowerModalOpen(false)}
            onToggleChange={(val) => { }}
          />
        </div>
      )}

      {category === "trigger" && (
        <div className="pt-6">
          <TriggerEventsSection
            selectedDevice={{ deviceId, venueId, venueName: displayVenueName, deviceType, category }}
            externalOpen={powerModalOpen}
            onExternalClose={() => setPowerModalOpen(false)}
          />
        </div>
      )}
    </div>

    </div>
  );
}