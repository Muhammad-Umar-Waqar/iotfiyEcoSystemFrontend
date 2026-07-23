import AlertsChart from "./AlertsChart";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useEffect, useState, useRef } from "react";
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
import { Download, Power, Copy, Check, Clock, Shield } from "lucide-react";
import Swal from "sweetalert2";
import DownloadModal from "./DownloadModal";
import EventsSection from "../../components/events/EventsSection";
import TriggerEventsSection from "../../components/events/TriggerEventsSection";
import AcClimateDial from "../../components/AcClimateDial";
import { useScheduler } from "../../contexts/SchedulerContext";
import { useAcControl } from "../../contexts/AcControlContext";
import { resolveAlertState } from "../../utils/triggerAlertUtils";

const SPARK_MAX = 16;

/** Mini line chart from saved previous values — line + soft area fill */
const Sparkline = ({ points = [], color = "var(--eco-primary)" }) => {
  const w = 100;
  const h = 25;
  const gradId = `ecoSparkFill-${String(color).replace(/[^a-zA-Z0-9]/g, "") || "p"}`;

  // No / insufficient history — flat line near bottom (same visual weight as equal-value charts)
  if (!points || points.length < 2) {
    const y = h - 4;
    return (
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-auto block w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${gradId}-empty`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={`M 0 ${h} L 0 ${y} L ${w} ${y} L ${w} ${h} Z`} fill={`url(#${gradId}-empty)`} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          points={`0,${y} ${w},${y}`}
        />
      </svg>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 8) - 4;
    return [x, y];
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = [
    `M ${pts[0][0].toFixed(1)} ${h}`,
    ...pts.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`),
    `L ${pts[pts.length - 1][0].toFixed(1)} ${h}`,
    "Z",
  ].join(" ");

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-auto block w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={line}
      />
    </svg>
  );
};

/** Soft filled icon chip — consistent look across metrics / alerts */
const MetricIcon = ({ Icon, tone = "blue", size = "md" }) => {
  const tones = {
    blue: { color: "var(--eco-primary)", bg: "var(--eco-primary-soft)" },
    teal: { color: "var(--eco-primary)", bg: "var(--eco-primary-soft)" },
    amber: { color: "var(--eco-primary)", bg: "var(--eco-primary-soft)" },
    rose: { color: "#E11D48", bg: "rgba(225, 29, 72, 0.12)" },
    violet: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)" },
  };
  const t = tones[tone] || tones.blue;
  const box = size === "sm" ? 32 : 40;
  const font = size === "sm" ? 18 : 22;

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
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [metricHistory, setMetricHistory] = useState({});
  const lastSparkSnapRef = useRef({});

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
    if (!time || time === "null" || time === "undefined") return null;

    let date;
    if (time instanceof Date) {
      date = time;
    } else if (typeof time === "string" || typeof time === "number") {
      date = new Date(time);
    } else {
      return null;
    }

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const lastUpdateDisplay = formatLastUpdate(lastUpdateTime);

  function formatUnitValue(espPower, espVoltage, espCurrent) {
    const power = Number(espPower);
    const fallbackWatts = Number.isFinite(Number(espVoltage)) && Number.isFinite(Number(espCurrent))
      ? Number(espVoltage) * Number(espCurrent) : null;
    const watts = Number.isFinite(power) ? power : fallbackWatts;
    // Default / empty → "--" (avoid "0.00 kWh" clutter)
    if (!Number.isFinite(watts) || watts <= 0) return "--";
    return `${(watts / 1000).toFixed(2)} kWh`;
  }

  function formatEnergyKwh(energyVal) {
    if (energyVal == null || !Number.isFinite(Number(energyVal)) || Number(energyVal) <= 0) {
      return "--";
    }
    return `${Number(energyVal).toFixed(2)} kWh`;
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
      lucideIcon: <MetricIcon Icon={DeviceThermostatIcon} tone="blue" size="sm" />,
      alertFlag: !!effectiveTemperatureAlert, color: "green",
    };
    const humMetric = {
      key: "humidity", label: "Humidity", unit: "%",
      value: displayHumidity !== null ? displayHumidity : "--",
      img: null,
      lucideIcon: <MetricIcon Icon={WaterDropIcon} tone="blue" size="sm" />,
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
          value: formatEnergyKwh(energyVal),
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
          lucideIcon: <MetricIcon Icon={SpeedIcon} tone="blue"  />,
          alertFlag: false,
          color: "green",
        },
        {
          key: "temperature",
          label: "Temperature",
          unit: "°C",
          value: displayTemp !== null ? displayTemp : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={DeviceThermostatIcon} tone="blue" />,
          alertFlag: false,
          color: "green",
        },
        {
          key: "humidity",
          label: "Humidity",
          unit: "%",
          value: displayHumidity !== null ? displayHumidity : "--",
          img: null,
          lucideIcon: <MetricIcon Icon={WaterDropIcon} tone="blue"  />,
          alertFlag: false,
          color: "green",
        },
      ]
    : [];

  const statusText = (flag) => (flag ? "Alert Det." : "Not Det.");
  const alertChipClass = (m) => {
    const flag = !!m.alertFlag;
    const base = "flex items-center gap-2.5 p-2 rounded-xl shrink-0 min-w-[7.5rem] border";
    // Alert → soft red only; otherwise white
    if (flag) {
      return `${base} border-rose-200 bg-[var(--eco-temp-alert-bg)]`;
    }
    return `${base} border-slate-200 bg-white`;
  };

  // Persist previous metric values for sparklines (per device)
  useEffect(() => {
    if (!deviceId) return;
    try {
      const raw = sessionStorage.getItem(`eco-spark-${deviceId}`);
      setMetricHistory(raw ? JSON.parse(raw) : {});
    } catch {
      setMetricHistory({});
    }
    lastSparkSnapRef.current = {};
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const snapshot = {};
    if (displayTemp !== null && displayTemp !== undefined) snapshot.temperature = Number(displayTemp);
    if (displayHumidity !== null && displayHumidity !== undefined) snapshot.humidity = Number(displayHumidity);
    if (displayOdour !== null && displayOdour !== undefined) snapshot.odour = Number(displayOdour);
    if (displayAQI !== null && displayAQI !== undefined) snapshot.aqi = Number(displayAQI);
    if (displayGL !== null && displayGL !== undefined) snapshot.gas = Number(displayGL);
    if (espVoltage !== null && espVoltage !== undefined && Number.isFinite(Number(espVoltage))) {
      snapshot.voltage = Number(espVoltage);
    }
    const powerVal = isAc ? (ac?.espPower ?? espPower) : espPower;
    if (powerVal != null && Number.isFinite(Number(powerVal))) snapshot.power = Number(powerVal);
    const energyVal = isAc ? (ac?.espEnergy ?? espEnergy) : espEnergy;
    if (energyVal != null && Number.isFinite(Number(energyVal))) {
      snapshot.units = Number(energyVal);
      snapshot.unit = Number(energyVal);
    }

    setMetricHistory((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [key, num] of Object.entries(snapshot)) {
        if (!Number.isFinite(num)) continue;
        if (lastSparkSnapRef.current[key] === num) continue;
        lastSparkSnapRef.current[key] = num;
        next[key] = [...(next[key] || []), num].slice(-SPARK_MAX);
        changed = true;
      }
      if (!changed) return prev;
      try {
        sessionStorage.setItem(`eco-spark-${deviceId}`, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  }, [
    deviceId,
    displayTemp,
    displayHumidity,
    displayOdour,
    displayAQI,
    displayGL,
    espVoltage,
    espPower,
    espEnergy,
    isAc,
    ac?.espPower,
    ac?.espEnergy,
  ]);

  const liveMetrics = isED ? emdExtraMetrics : topMetrics;

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

  const powerBusy = loading || (isAc && acPowerLoading);
  const powerShadow =
    powerBusy || displayToggleState === "gray"
      ? "0 4px 12px rgba(148, 163, 184, 0.45)"
      : displayToggleState === "on"
        ? "0 4px 14px rgba(16, 185, 129, 0.45)"
        : displayToggleState === "off"
          ? "0 4px 14px rgba(244, 63, 94, 0.45)"
          : "0 4px 12px rgba(148, 163, 184, 0.45)";

  const powerToggleButton = isSchedulerDevice ? (
    <div className="shrink-0 self-center flex flex-col items-center justify-center gap-1 w-14 min-w-[3.5rem]">
      <button
        type="button"
        onClick={handleSchedulerToggleClick}
        disabled={powerBusy}
        className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition active:scale-[.96]
          ${powerBusy
            ? "bg-gray-400 cursor-wait opacity-70"
            : displayToggleState === "on" ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
            : displayToggleState === "off" ? "bg-rose-500 hover:bg-rose-600 cursor-pointer"
              : "bg-gray-400 hover:bg-gray-500 cursor-pointer"}`}
        style={{ boxShadow: powerShadow }}
        title={powerBusy ? "Processing..." : displayToggleState === "gray" ? "Either Device is Offline or Event is Running" : displayToggleState === "on" ? "Turn Off" : "Turn On"}
        aria-label={displayToggleState === "on" ? "Turn Off" : displayToggleState === "off" ? "Turn On" : "Power"}
      >
        {powerBusy ? (
          <svg className="animate-spin text-white" width={18} height={18} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <Power size={18} strokeWidth={2.25} />
        )}
      </button>
      <span className="text-[10px] font-bold leading-none" style={{ color: "var(--eco-text-muted)" }}>
        {powerBusy
          ? "..."
          : displayToggleState === "on"
            ? "ON"
            : displayToggleState === "off"
              ? "OFF"
              : "--"}
      </span>
    </div>
  ) : null;

  const isMonitoring = category === "monitoring";
  const hasEventsSection = isSchedulerDevice || category === "trigger";
  const showApiAccess =  !isAc;

  return (
    <div className="dashboard-right-panel eco-rpanel-shell flex flex-col h-full min-h-0 self-stretch max-w-[95vw] min-w-0">
      <div className="eco-rpanel-scroll scrollbar-none flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-3">
        <div
          className={`w-full min-h-full rounded-2xl p-3 ${
            isMonitoring || hasEventsSection ? "flex flex-col gap-3" : "space-y-6"
          }`}
          style={{
            background: "var(--eco-live-metric-bg)",
            backdropFilter: "blur(12px) saturate(1.3)",
            WebkitBackdropFilter: "blur(12px) saturate(1.3)",
          }}
        >
      {closeIcon && (
        <div className="flex justify-between items-center shrink-0">
          <img src="/iotfiy_logo_rpanel.svg" alt="IOTFIY LOGO" className="h-[30px] w-auto" />
          <IconButton onClick={() => typeof onClose === "function" && onClose()} edge="start" aria-label="close-details" size="small">
            <CloseIcon />
          </IconButton>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]/40 shrink-0">
        <div>
          <p className="text-sm text-[#64748B] font-medium">Device ID</p>
          <h2 className="text-sm text-[#1E293B] font-bold">{deviceId || <Skeleton variant="text" width={70} />}</h2>
          <div className="text-xs font-medium" style={{ color: "var(--eco-primary)" }}>{displayVenueName}</div>
        </div>
        <button
          onClick={handleDownload}
          className="eco-btn-primary inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold active:scale-[.98] transition shadow-sm cursor-pointer"
          aria-label="Download"
        >
          <span className="leading-none py-1 px-3">Download</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Status + alerts — monitoring: grow into leftover space above API */}
      <div
        className={
          isMonitoring
            ? "flex flex-1 flex-col gap-4 min-h-0"
            : "contents"
        }
      >
      {/* Live Status — scrollable metric cards + fixed power column */}
      <div
        className={`bg-white rounded-2xl border border-slate-200/70 ${
          isMonitoring
            ? "flex flex-1 flex-col min-h-0 p-3"
            : "mb-5 p-2 shrink-0"
        }`}
        style={{ boxShadow: "var(--eco-panel-lift)" }}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-sm font-semibold" style={{ color: "var(--eco-primary)" }}>
            Live Status
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--eco-text-muted)" }}>
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: isOnline ? "var(--eco-online)" : "#94A3B8" }}
            />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        <div
          className={`flex gap-1.5 min-w-0 ${
            isMonitoring ? "flex-1 min-h-0 items-stretch" : "items-center"
          }`}
        >
          <div
            className={
              isMonitoring
                ? "flex-1 min-h-0 overflow-y-auto scrollbar-none flex flex-col gap-2"
                : "flex-1 min-w-0 overflow-x-auto scrollbar-none flex flex-nowrap gap-2 pb-0.5"
            }
          >
            {liveMetrics.length === 0 ? (
              <div
                className="text-xs px-3 py-4 rounded-xl"
                style={{ color: "var(--eco-text-muted)", background: "rgba(255,255,255,0.45)" }}
              >
                No live metrics
              </div>
            ) : (
              liveMetrics.map((m) => (
                <div
                  key={m.key}
                  className={
                    isMonitoring
                      ? "w-full rounded-xl flex flex-row items-center gap-3 px-3 py-2.5 min-h-[4.75rem] flex-1 basis-0 overflow-hidden"
                      : `rounded-xl flex flex-col overflow-hidden shrink-0 ${
                          isSchedulerDevice
                            ? "w-[calc(50%-0.25rem)] min-w-[5.5rem]"
                            : "w-[7rem]"
                        }`
                  }
                  style={{
                    background: "rgba(255, 255, 255, 0.91)",
                    border: "1px solid var(--eco-metric-card-border)",
                    boxShadow: "var(--eco-metric-card-shadow)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  {isMonitoring ? (
                    <>
                      <div className="shrink-0">
                        {m.img ? (
                          <img src={m.img} className="h-8 w-auto" alt="" />
                        ) : m.lucideIcon ? (
                          m.lucideIcon
                        ) : (
                          <img src="/odour-alert.svg" className="h-8 w-auto" alt="" />
                        )}
                      </div>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <span
                          className="text-xs font-semibold truncate leading-tight w-full"
                          style={{ color: "var(--eco-text-label)" }}
                          title={m.label}
                        >
                          {m.label}
                        </span>
                        <div
                          className="text-2xl font-bold leading-tight tracking-tight"
                          style={{ color: "var(--eco-text)" }}
                        >
                          {renderMetricValue(m)}
                        </div>
                      </div>
                      <div className="w-[5.5rem] shrink-0">
                        <Sparkline points={metricHistory[m.key] || []} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1.5 px-2 pt-2.5 pb-1 min-w-0">
                        <div className="shrink-0">
                          {m.img ? (
                            <img src={m.img} className="h-7 w-auto" alt="" />
                          ) : m.lucideIcon ? (
                            m.lucideIcon
                          ) : (
                            <img src="/odour-alert.svg" className="h-7 w-auto" alt="" />
                          )}
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                          <span
                            className="text-[11px] font-semibold truncate leading-tight w-full"
                            style={{ color: "var(--eco-text-label)" }}
                            title={m.label}
                          >
                            {m.label}
                          </span>
                          <div
                            className="text-xl font-bold leading-tight tracking-tight"
                            style={{ color: "var(--eco-text)" }}
                          >
                            {renderMetricValue(m)}
                          </div>
                        </div>
                      </div>
                      <div className="px-1.5 pb-1 mt-auto shrink-0">
                        <Sparkline points={metricHistory[m.key] || []} />
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {powerToggleButton}
        </div>
      </div>

      {/* AC dial controls — same AcControlContext actions as before */}
      {isAc && ac && (
        <AcClimateDial
          deviceId={deviceId}
          isOnline={isOnline}
          healthAlert={acHealthAlert}
        />
      )}

      {/* Alert chips — soft semantic colors (not brand blue) */}
      {!isAc && liveMetrics.length > 0 && (
        <div className="w-full min-w-0 overflow-x-auto scrollbar-none shrink-0">
          <div className="flex flex-nowrap gap-2 pb-0.5">
            {liveMetrics.map((m) => {
              const flag = !!m.alertFlag;
              return (
                <div key={m.key} className={alertChipClass(m)}>
                  {m.img ? (
                    <img src={m.img} alt={m.label} className="w-6 h-6 shrink-0" />
                  ) : m.lucideIcon ? (
                    <div className="shrink-0 flex items-center justify-center scale-90">
                      {m.lucideIcon}
                    </div>
                  ) : (
                    <img src="/alert-icon.png" alt={m.label} className="w-6 h-6 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] whitespace-nowrap" style={{ color: "var(--eco-text-muted)" }}>
                      {m.label}
                    </div>
                    <div className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--eco-text-label)" }}>
                      {statusText(flag)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* API Access: monitoring only, never AC. Last Update always. */}
      <div
        className={
          showApiAccess || (isMonitoring && !hasEventsSection)
            ? "mt-auto pt-2 shrink-0"
            : ""
        }
      >
        {showApiAccess && (
          apiKey ? (
            <div className="eco-api-card mt-1 p-3 text-sm break-words">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 text-white/95">
                    <Shield size={16} strokeWidth={2.2} />
                    <strong className="text-sm font-semibold">API Access</strong>
                  </div>
                  <div className="text-[11px] text-white/70 mb-1">API Key</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm truncate text-white" title={apiKey}>
                      {apiKey.length > 12 ? `${apiKey.slice(0, 8)}…` : apiKey}
                    </span>
                    <button
                      type="button"
                      title={apiKeyCopied ? "Copied" : "Copy API key"}
                      aria-label="Copy API key"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(apiKey);
                          setApiKeyCopied(true);
                          setTimeout(() => setApiKeyCopied(false), 1500);
                        } catch {
                          window.prompt("Copy API key:", apiKey);
                        }
                      }}
                      className="shrink-0 p-1.5 rounded-md text-white/85 hover:bg-white/10 hover:text-white transition"
                    >
                      {apiKeyCopied ? (
                        <Check size={14} className="text-emerald-300" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-1.5 shrink-0">
                  <QRCode apiKey={apiKey} />
                </div>
              </div>
            </div>
          ) : (
            <div className="eco-api-card mt-1 p-3 text-sm break-words opacity-85">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton variant="text" width={50} height={20} className="mb-2" sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                  <Skeleton variant="text" width={120} height={20} className="mb-2" sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                </div>
                <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: "10%", bgcolor: "rgba(255,255,255,0.15)" }} />
              </div>
            </div>
          )
        )}

        <div
          className="mt-3 flex items-center justify-start gap-1.5 text-xs sm:text-sm font-medium"
          style={{ color: "var(--eco-primary)" }}
        >
          <Clock size={13} strokeWidth={2.2} />
          <span>Last Update: {lastUpdateDisplay ?? "-- -- --"}</span>
        </div>
      </div>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        measurement={deviceId}
        bucket="Odour"
        deviceType={deviceType}
      />

      {/* Events — pin to bottom for scheduling / trigger devices */}
      {(isSchedulerDevice || category === "trigger") && (
        <div className="mt-auto pt-2 shrink-0">
          {isSchedulerDevice && (
            <EventsSection
              selectedDevice={{ deviceId, venueId, venueName: displayVenueName, deviceType, category }}
              onEventsChange={(updated) => { }}
              externalOpen={powerModalOpen}
              onExternalClose={() => setPowerModalOpen(false)}
              onToggleChange={(val) => { }}
              onScheduleRefresh={onScheduleRefresh}
            />
          )}
          {category === "trigger" && (
            <TriggerEventsSection
              selectedDevice={{ deviceId, venueId, venueName: displayVenueName, deviceType, category }}
              externalOpen={powerModalOpen}
              onExternalClose={() => setPowerModalOpen(false)}
            />
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}