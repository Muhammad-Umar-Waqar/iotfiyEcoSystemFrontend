import AlertsChart from "./AlertsChart";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useState } from "react";
import QRCode from "./QrCode";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import BoltIcon from "@mui/icons-material/Bolt";
import SpeedIcon from "@mui/icons-material/Speed";
import PowerIcon from "@mui/icons-material/Power";
import AirIcon from "@mui/icons-material/Air";
import CloudIcon from "@mui/icons-material/Cloud";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { IconButton, Skeleton } from "@mui/material";
import { fetchVenuesByOrganization } from "../../slices/VenueSlice";
import { Download, Power } from "lucide-react";
import Swal from "sweetalert2";
import DownloadModal from "./DownloadModal";
import EventsSection from "../../components/events/EventsSection";
import TriggerEventsSection from "../../components/events/TriggerEventsSection";
import AcClimateDial from "../../components/AcClimateDial";
import { useScheduler } from "../../contexts/SchedulerContext";
import { useAcControl } from "../../contexts/AcControlContext";
import { resolveAlertState } from "../../utils/triggerAlertUtils";

/** Soft filled icon chip — consistent look across metrics / alerts */
const MetricIcon = ({ Icon, tone = "blue", size = "md" }) => {
  const tones = {
    blue: { color: "#0D5CA4", bg: "rgba(13, 92, 164, 0.12)" },
    teal: { color: "#0F766E", bg: "rgba(15, 118, 110, 0.12)" },
    amber: { color: "#D97706", bg: "rgba(217, 119, 6, 0.14)" },
    rose: { color: "#E11D48", bg: "rgba(225, 29, 72, 0.12)" },
    violet: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)" },
  };
  const t = tones[tone] || tones.blue;
  const box = size === "sm" ? 32 : 44;
  const font = size === "sm" ? 18 : 26;

  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{
        width: box,
        height: box,
        background: t.bg,
        color: t.color,
      }}
    >
      <Icon sx={{ fontSize: font }} />
    </span>
  );
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
  voltageAlert = false,
  aqiAlert = false,
  glAlert = false,
  triggeredAlerts = [],
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
  pendingCreateEvent = false,
  onPendingCreateEventHandled,
  // AC live fields (synced with AcDeviceCard via same websocket map)
  setTemperature = 26,
  acMode = "Cool",
  fanSpeed = "Low",
  acLocked = false,
  acHealthAlert = false,
  energyMonitoringIncluded = false,
  espEnergy = null,
  onScheduleRefresh,
}) {


  const dispatch = useDispatch();
  const user  = useSelector((state) => state.auth.user);
  const orgId = organizationId || user?.organization || null;

  const { eventsMap, toggleMap, setEvents, bumpEventsRefresh } = useScheduler();
  const {
    getAc,
    hydrateAc,
    toggleAcPower,
    promptDisableCurrentEvent,
    busyMap,
  } = useAcControl();

  const schedulerEvents = deviceId ? eventsMap[deviceId] ?? [] : [];

  const isAc = String(deviceType) === "AC";

  // Keep shared AC map in sync with websocket / parent props (same as AcDeviceCard)
  useEffect(() => {
    if (!isAc || !deviceId || busyMap[deviceId]) return;
    hydrateAc(deviceId, {
      state: deviceState,
      setTemperature,
      acMode,
      fanSpeed,
      acLocked,
      acHealthAlert,
      energyMonitoringIncluded,
      espPower,
      espEnergy,
      espCurrent,
    });
  }, [
    isAc,
    deviceId,
    deviceState,
    setTemperature,
    acMode,
    fanSpeed,
    acLocked,
    acHealthAlert,
    energyMonitoringIncluded,
    espPower,
    espEnergy,
    espCurrent,
    busyMap,
    hydrateAc,
  ]);

  const ac = isAc && deviceId ? getAc(deviceId) : null;
  const acBusy = deviceId ? busyMap[deviceId] : null;
  const acPowerLoading = acBusy === "power";

  // ✅ AC: shared context state; else WebSocket / SchedulerContext toggleMap
  const resolvedToggle = useMemo(() => {
    if (isAc) {
      return String(ac?.state || deviceState || "OFF").toLowerCase() === "on"
        ? "on"
        : "off";
    }
    return deviceState?.toLowerCase() || (deviceId ? (toggleMap?.[deviceId] ?? "off") : "off");
  }, [isAc, ac?.state, deviceId, toggleMap, deviceState]);

  console.log(`🔘 [VenueDetailsPanel ${deviceId}] WebSocket state: ${deviceState}, Final toggle: ${resolvedToggle}`);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const venueId = params.get("venue");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pendingCreateEvent) return;
    setPowerModalOpen(true);
    onPendingCreateEventHandled?.();
  }, [pendingCreateEvent, onPendingCreateEventHandled]);

  const orgVenues = useSelector((state) => (orgId ? state.Venue.venuesByOrg[orgId] || [] : []));
  const globalVenues = useSelector((state) => state.Venue.Venues || []);
  const venuesFromSlice = orgVenues.length ? orgVenues : globalVenues;
  const isSchedulerDevice =
    category === "scheduling" || String(deviceType) === "TSD";

    // ✅ Use WebSocket data for SCHEDULES ONLY running event (same logic as Card)
  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  // ── Trust Backend Type (Same logic as Card) ──
  const runningSchedulerEvent = useMemo(() => {
    if (wsRunningEvent) return wsRunningEvent;
    if (!schedulerEvents || schedulerEvents.length === 0) return null;

    let item = schedulerEvents[0];

    // Handle wrapped response {type: "CURRENT", event: {...}}
    if (item?.type === "CURRENT" && item?.event) {
      item = item.event;
    }

    // Only consider it running if backend says type === "CURRENT"
    return item?.type === "CURRENT" ? item : null;
  }, [wsRunningEvent, schedulerEvents]);

  useEffect(() => {
    if (orgId && !orgVenues.length) {
      dispatch(fetchVenuesByOrganization(orgId));
    }
  }, [orgId, orgVenues.length, dispatch]);

  const displayToggleState = useMemo(() => {
    // Show gray when event is running OR device is offline
    if (runningSchedulerEvent || !isOnline) return "gray";
    return resolvedToggle;
  }, [runningSchedulerEvent, resolvedToggle, isOnline]);

  // Refresh events in context + EventsSection (via bumpEventsRefresh)
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
      const fetchedEvents = data.events || [];

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
      if (statusData?.event) {
        const { type, event } = statusData;
        markedEvents = fetchedEvents.map(e => {
          if (e._id === event._id) {
            return { ...e, ...event, type };
          }
          return e;
        });
      }

      setEvents(deviceId, markedEvents);
      bumpEventsRefresh(deviceId);
    } catch (err) {
      console.error("Failed to refresh events:", err);
    }
  };

  // Handle Toggle Click (Same as Card)
  const handleSchedulerToggleClick = async () => {
    if (runningSchedulerEvent) {
      // AC + other scheduling: never power-toggle while CURRENT — disable first
      const disableResult = await promptDisableCurrentEvent(runningSchedulerEvent);
      if (disableResult?.disabled) {
        bumpEventsRefresh(deviceId);
        await refreshEvents();
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

    // AC: shared context so AcDeviceCard updates instantly
    if (isAc) {
      const result = await toggleAcPower(deviceId, {
        isOnline,
        hasCurrentEvent: false,
        eventId: scheduleData?.event?._id,
      });
      if (result) await refreshEvents();
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
        // Scheduling (non-AC): needs eventId
        const eventId = scheduleData?.event?._id;
        const body = { deviceId, eventId };

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
            body: JSON.stringify(body),
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
  const isED = String(deviceType) === "ED";

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

  function formatUnitValue(espPower, espVoltage, espCurrent) {
    const power = Number(espPower);
    const fallbackWatts = Number.isFinite(Number(espVoltage)) && Number.isFinite(Number(espCurrent))
      ? Number(espVoltage) * Number(espCurrent) : null;
    const watts = Number.isFinite(power) ? power : fallbackWatts;
    if (!Number.isFinite(watts)) return "--";
    return `${(watts / 1000).toFixed(3)} kWh`;
  }

  const topMetrics = (() => {
    const effectiveTemperatureAlert = resolveAlertState(
      category, triggeredAlerts, "temperature", temperatureAlert
    );
    const effectiveHumidityAlert = resolveAlertState(
      category, triggeredAlerts, "humidity", humidityAlert
    );
    const effectiveOdourAlert = resolveAlertState(
      category, triggeredAlerts, "odour", odourAlert
    );
    const effectiveAqiAlert = resolveAlertState(
      category, triggeredAlerts, "AQI", aqiAlert
    );
    const effectiveGlAlert = resolveAlertState(
      category, triggeredAlerts, "gass", glAlert
    );
    const effectiveVoltageAlert = resolveAlertState(
      category, triggeredAlerts, "voltage", voltageAlert
    );

    const tempMetric = {
      key: "temperature", label: "Temperature", unit: "°C",
      value: displayTemp !== null ? displayTemp : "--",
      img: null,
      lucideIcon: <MetricIcon Icon={DeviceThermostatIcon} tone="amber" size="sm" />,
      alertFlag: !!effectiveTemperatureAlert, color: "green",
    };
    const humMetric = {
      key: "humidity", label: "Humidity", unit: "%",
      value: displayHumidity !== null ? displayHumidity : "--",
      img: null,
      lucideIcon: <MetricIcon Icon={WaterDropIcon} tone="teal" size="sm" />,
      alertFlag: !!effectiveHumidityAlert, color: "green",
    };

    if (String(deviceType) === "ED") {
      // Alert badges for ED (same as EnergyMonitoringDeviceCard)
      return [
        tempMetric,
        humMetric,
        {
          key: "voltage",
          label: "Voltage",
          unit: "V",
          value:
            espVoltage !== null && espVoltage !== undefined
              ? +Number(espVoltage).toFixed(1)
              : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={PowerIcon} tone="violet" size="sm" />,
          alertFlag: !!effectiveVoltageAlert,
          color: "red",
        },
      ];
    }
    if (String(deviceType) === "OD") {
      return [
        {
          key: "odour",
          label: "Odour",
          unit: "%",
          value: displayOdour ?? 0,
          img: null,
          lucideIcon: <MetricIcon Icon={AirIcon} tone="rose" size="sm" />,
          alertFlag: !!effectiveOdourAlert,
          color: "red",
        },
        tempMetric,
        humMetric,
      ];
    }
    if (String(deviceType) === "AQID") {
      return [
        {
          key: "aqi",
          label: "AQI",
          unit: "",
          value: displayAQI ?? "--",
          img: null,
          lucideIcon: <MetricIcon Icon={CloudIcon} tone="violet" size="sm" />,
          alertFlag: !!effectiveAqiAlert,
          color: "red",
        },
        tempMetric,
        humMetric,
      ];
    }
    if (String(deviceType) === "GLD") {
      return [
        {
          key: "gas",
          label: "Gas",
          unit: "%",
          value: displayGL ?? "--",
          img: null,
          lucideIcon: <MetricIcon Icon={LocalFireDepartmentIcon} tone="rose" size="sm" />,
          alertFlag: !!effectiveGlAlert,
          color: "red",
        },
        tempMetric,
        humMetric,
      ];
    }
    // AC: optional power/units only (setpoint is controlled below — not in top metrics)
    if (isAc) {
      const powerVal = ac?.espPower ?? espPower;
      const energyVal = ac?.espEnergy ?? espEnergy;
      const energyOn = ac?.energyMonitoringIncluded ?? energyMonitoringIncluded;
      if (!energyOn) return [];
      return [
        {
          key: "power",
          label: "Power",
          unit: "",
          value:
            powerVal != null && Number.isFinite(Number(powerVal))
              ? `${Math.round(Number(powerVal))} W`
              : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={BoltIcon} tone="amber" />,
          alertFlag: false,
          color: "green",
        },
        {
          key: "units",
          label: "Units",
          unit: "",
          value:
            energyVal != null && Number.isFinite(Number(energyVal))
              ? `${Number(energyVal).toFixed(3)} kWh`
              : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={SpeedIcon} tone="blue" />,
          alertFlag: false,
          color: "green",
        },
      ];
    }
    return [tempMetric, humMetric];
  })();
  console.log("ac", ac);
  console.log("acHealthAlert", acHealthAlert);

  const emdExtraMetrics = isED
    ? [
        {
          key: "unit",
          label: "Unit",
          unit: "",
          value: formatUnitValue(espPower, espVoltage, espCurrent),
          img: null,
          lucideIcon: <MetricIcon Icon={SpeedIcon} tone="blue" />,
          alertFlag: false,
          color: "green",
        },
        {
          key: "temperature",
          label: "Temperature",
          unit: "°C",
          value: displayTemp !== null ? displayTemp : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={DeviceThermostatIcon} tone="amber" />,
          alertFlag: false,
          color: "green",
        },
        {
          key: "humidity",
          label: "Humidity",
          unit: "%",
          value: displayHumidity !== null ? displayHumidity : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={WaterDropIcon} tone="teal" />,
          alertFlag: false,
          color: "green",
        },
      ]
    : [];

  const statusText = (flag) => (flag ? "Alert Det." : "Not Det.");
  const statusClass = (flag, color = "green") => {
    if (flag) {
      if (color === "red") return "border-red-500";
      return "border-green-500";
    }
    return "border-gray-300";
  };

  const renderMetricValue = (m) => {
    // Split "123 W" / "0.065 kWh" so unit is thin + sm
    const isSplitMetric = ["power", "unit", "units"].includes(m.key);
    if (isSplitMetric && typeof m.value === "string" && m.value !== "--") {
      const parts = m.value.split(" ");
      const num = parts[0];
      const unit = parts.slice(1).join(" ") || "";
      return (
        <>
          {num}
          {unit ? <span className="text-sm font-thin ml-1">{unit}</span> : null}
        </>
      );
    }
    return (
      <>
        {m.value ?? "--"}
        {m.unit ? <span className="text-sm font-thin ml-1">{m.unit}</span> : null}
      </>
    );
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
        {isED ? (
          <div className="space-y-4">
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
          </div>
        ) : (
          <div>
            <div className={`flex items-center justify-between gap-2 w-full ${topMetrics.length === 2 ? "sm:justify-around" : ""}`}>
            
            {topMetrics.map((m) => (
              <div key={m.key} className="flex flex-col items-center justify-between h-full">
                <div className="mb-2">
                  {m.img ? <img src={m.img} className="h-[30px] w-auto" alt={m.label} />
                    : m.lucideIcon ? <div className="text-[#0D5CA4]">{m.lucideIcon}</div>
                      : <img src="/odour-alert.svg" className="h-[66px] w-auto" alt={m.label} />}
                </div>
                <div className="text-sm text-gray-600">{m.label}</div>
                <div className="text-xl font-semibold">{renderMetricValue(m)}</div>
              </div>
            
            ))}

            {/* Large Power Button for scheduling devices (AC included — shared context) */}
            {isSchedulerDevice && (
              <button
                onClick={handleSchedulerToggleClick}
                disabled={loading || (isAc && acPowerLoading)}
                className={`flex flex-col justify-center items-center gap-3 px-4 py-5 rounded-xl text-sm font-semibold text-white transition shadow-sm active:scale-[.98]
                  ${loading || (isAc && acPowerLoading)
                    ? "bg-gray-400 cursor-wait opacity-70"
                    : displayToggleState === "on" ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                    : displayToggleState === "off" ? "bg-rose-500 hover:bg-rose-600 cursor-pointer"
                      : "bg-gray-400 hover:bg-gray-500 cursor-pointer"}`}
                title={loading || (isAc && acPowerLoading) ? "Processing..." : displayToggleState === "gray" ? "Event running or device offline — click to disable" : displayToggleState === "on" ? "Turn Off" : "Turn On"}
              >
                {loading || (isAc && acPowerLoading) ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Power size={15} strokeWidth={2} />
                )}
                <span className="text-xs font-bold">
                  {loading || (isAc && acPowerLoading)
                    ? "..."
                    : displayToggleState === "on"
                      ? "ON"
                      : displayToggleState === "off"
                        ? "OFF"
                        : ""}
                </span>
              </button>
            )}
              </div>
          </div>
        )}
      </div>

      {/* AC dial controls — same AcControlContext actions as before */}
      {isAc && ac && (
        <AcClimateDial
          deviceId={deviceId}
          isOnline={isOnline}
          healthAlert={acHealthAlert}
        />
      )}

      {/* Status badges — horizontal scroll if overflow; scrollbar hidden */}
      {!isAc && topMetrics.length > 0 && (
        <div className="w-full min-w-0 overflow-x-auto scrollbar-none">
          <div className="flex flex-nowrap gap-2 pb-0.5">
            {topMetrics.map((m) => {
              const flag = !!m.alertFlag;
              const color = m.color ?? "green";
              return (
                <div
                  key={m.key}
                  className={`flex items-center gap-3 p-1 border rounded shrink-0 min-w-[7.5rem] ${statusClass(flag, color)}`}
                >
                  {m.img ? (
                    <img src={m.img} alt={m.label} className="w-6 h-6 shrink-0" />
                  ) : m.lucideIcon ? (
                    <div className="shrink-0 flex items-center justify-center">
                      {m.lucideIcon}
                    </div>
                  ) : (
                    <img src="/alert-icon.png" alt={m.label} className="w-6 h-6 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-gray-600 whitespace-nowrap">{m.label}</div>
                    <div className="text-sm font-medium whitespace-nowrap">{statusText(flag)}</div>
                  </div>
                </div>
              );
            })}
          </div>
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
            onScheduleRefresh={onScheduleRefresh}
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