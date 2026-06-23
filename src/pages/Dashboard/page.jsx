// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import FreezerDeviceCard from "./FreezerDeviceCard";
import OrganizationSelect from "./OrganizationSelect";
import VenueSelect from "./VenueSelect";
import AlertsPanel from "./AlertsPanel";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { useLocation, useNavigate } from "react-router-dom";
import VenueDetailsPanel from "./VenueDetailsPanel";
import { Drawer, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizationsByUser,
  fetchOrganizationsByOwner,
} from "../../slices/OrganizationSlice";
import DeviceSkeleton from "./DeviceSkeleton";
import AQIDeviceCard from "./AQIDeviceCard";
import TemperatureHumidityDeviceCard from "./TemperatureHumidityDeviceCard";
import OdourDeviceCard from "./OdourDeviceCard";
import GasLeakageDeviceCard from "./GasLeakageDeviceCard";
import EnergyMonitoringDeviceCard from "./EnergyMonitoringDeviceCard";
import SchedulerDeviceCard from "./SchedulerDeviceCard";
import { useOrgVenue } from "../../contexts/OrgVenueContext";
import { useScheduler } from "../../contexts/SchedulerContext";
import { useDeviceWebSocket } from "../../hooks/useDeviceWebSocket";
import { useIsMobileforDashboardAndRightPanel } from "../../hooks/responsiveQuery";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function Dashboard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobileforDashboardAndRightPanel();
  const isDesktop = !isMobile;

  // ── Auth from Redux (no useStore) ─────────────────────────────────────────
  const user  = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  // ── Shared org / venue context ────────────────────────────────────────────
  const {
    organization: ctxOrg,
    venue: ctxVenue,
    setOrganization,
    setVenue,
    clearVenue,
  } = useOrgVenue();

  const { eventsMap, setEvents, setToggle } = useScheduler();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [selectedOrgId,            setSelectedOrgId]            = useState("");
  const [selectedVenueId,          setSelectedVenueId]          = useState("");
  const [orgNameForTop,            setOrgNameForTop]            = useState(undefined);
  const [freezerDevices,           setFreezerDevices]           = useState([]);
  const [selectedFreezerDeviceId,  setSelectedFreezerDeviceId]  = useState(null);
  const [isInitialDevicesLoad,     setIsInitialDevicesLoad]     = useState(true);
  const [isContextChanging,        setIsContextChanging]        = useState(false);
  const [drawerOpen,               setDrawerOpen]               = useState(false);

  // const isDesktop        = useMediaQuery("(min-width:768px)");
  const isDesktopForIcon = useMediaQuery("(min-width:760px)");
  const autoSelectedRef  = React.useRef({});       // tracks auto-selection per venue

  // ── WebSocket Integration for Real-time Data ──────────────────────────────
  const { deviceDataMap, deviceOnlineMap, deviceScheduleMap, isConnected } = useDeviceWebSocket(freezerDevices);

  console.log('🔌 WebSocket Status:', isConnected ? 'Connected' : 'Disconnected');
  console.log('📊 Device Data Map:', deviceDataMap);
  console.log('📶 Device Online Map:', deviceOnlineMap);
  console.log('📅 Device Schedule Map:', deviceScheduleMap);

  // ── MOUNT: hydrate local state from context ───────────────────────────────
  useEffect(() => {
    if (ctxOrg?.id) {
      setSelectedOrgId(String(ctxOrg.id));
      if (ctxOrg.name) setOrgNameForTop(ctxOrg.name);
    }
    if (ctxVenue?.id) {
      setSelectedVenueId(String(ctxVenue.id));
      // Keep URL in sync so deep-links still work, but context is the source of truth
      const sp = new URLSearchParams(location.search);
      if (!sp.get("venue")) {
        navigate(`${location.pathname}?venue=${ctxVenue.id}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  // ── Fetch org name for non-admin roles ────────────────────────────────────
  // user  → fetchOrganizationByUserID
  // manager → fetchOrganizationByOwner
  useEffect(() => {
    if (!user?._id || selectedOrgId) return;

    if (user.role === "user") {
      dispatch(fetchOrganizationByUserID(user._id))
        .unwrap()
        .then((org) => {
          const id   = String(org?._id ?? org?.id ?? "");
          const name = org?.name ?? "";
          setOrgNameForTop(name);
          setSelectedOrgId(id);
          if (!ctxOrg?.id) setOrganization({ id, name });
        })
        .catch((err) => console.warn("fetchOrganizationByUserID failed:", err));
    }

    if (user.role === "manager") {
      dispatch(fetchOrganizationByOwner(user._id))
        .unwrap()
        .then((org) => {
          const id   = String(org?._id ?? org?.id ?? "");
          const name = org?.name ?? "";
          setOrgNameForTop(name);
          setSelectedOrgId(id);
          if (!ctxOrg?.id) setOrganization({ id, name });
        })
        .catch((err) => console.warn("fetchOrganizationByOwner failed:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?._id]);

  // ── Keep local state in sync when context changes externally ─────────────
  useEffect(() => {
    if (ctxOrg?.id && String(ctxOrg.id) !== String(selectedOrgId)) {
      setSelectedOrgId(String(ctxOrg.id));
    }
    if (ctxOrg?.name && !orgNameForTop) setOrgNameForTop(ctxOrg.name);
    if (!ctxOrg && selectedOrgId) {
      setSelectedOrgId("");
      setOrgNameForTop(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxOrg?.id, ctxOrg?.name]);

  useEffect(() => {
    if (ctxVenue?.id && String(ctxVenue.id) !== String(selectedVenueId)) {
      setSelectedVenueId(String(ctxVenue.id));
    }
    if (!ctxVenue && selectedVenueId) setSelectedVenueId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxVenue?.id]);

  // ── Device fetch (one-shot per venue; polling replaced by WebSocket later) ─
  useEffect(() => {
    if (!selectedVenueId) {
      setFreezerDevices([]);
      setSelectedFreezerDeviceId(null);
      autoSelectedRef.current = {};
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    const fetchDevices = async () => {
      try {
        const res = await fetch(`${BASE}/device/get-by-venue/${selectedVenueId}`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!mounted) return;

        const data = await res.json();
        console.log('data.>>', data)

        if (res.ok) {
          const devices = Array.isArray(data.devices)
            ? data.devices
            : data.devices
            ? [data.devices]
            : [];

          setFreezerDevices(devices);

          // Auto-select first device on desktop (once per venue)
          if (isDesktop && devices.length > 0 && !autoSelectedRef.current[selectedVenueId]) {
            const firstId = String(devices[0]._id ?? devices[0].id ?? devices[0].deviceId);
            setSelectedFreezerDeviceId(firstId);
            autoSelectedRef.current[selectedVenueId] = true;
          }

          if (!isDesktop) setSelectedFreezerDeviceId(null);
        } else {
          setFreezerDevices([]);
          setSelectedFreezerDeviceId(null);
        }
      } catch (err) {
        if (!mounted || err.name === "AbortError") return;
        setFreezerDevices([]);
        setSelectedFreezerDeviceId(null);
      } finally {
        if (mounted) {
          setIsInitialDevicesLoad(false);
          setIsContextChanging(false);
        }
      }
    };

    fetchDevices();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedVenueId, token, isDesktop]);

  // ── Scheduler events for TSD devices and devices with scheduling category ─────────────────────────────────────
  const fetchSchedulerData = useCallback(async () => {
    const schedulingDevices = freezerDevices.filter((d) =>
      d.deviceType === "TSD" || d.category === "scheduling"
    );
    if (!schedulingDevices.length) return;

    for (const device of schedulingDevices) {
      const deviceKey = String(device.deviceId);
      try {
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // ✅ Only use /event/get API - it returns all events
        const eventsRes = await fetch(`${BASE}/event/get/${device.deviceId}`, {
          credentials: "include",
          headers,
        });

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const allEvents = eventsData?.events ?? [];

          console.log(`📋 [page.jsx] Fetched ${allEvents.length} events for ${deviceKey}`);

          // Store events in context
          setEvents(deviceKey, allEvents);
        }

        // If there is no current/next event the device is effectively off
        if (!statusData?.event) setToggle(deviceKey, "off");
      } catch (err) {
        console.warn(`Scheduler fetch error for ${deviceKey}:`, err);
      }
    }
  }, [freezerDevices, token, setEvents, setToggle]);

  useEffect(() => {
    if (freezerDevices.length > 0) fetchSchedulerData();
  }, [freezerDevices, fetchSchedulerData]);

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleFreezerDeviceSelect = (deviceId) => {
    setSelectedFreezerDeviceId(deviceId);
    if (!isDesktop) setDrawerOpen(true);
  };

  const onOrganizationChange = (id, name) => {
    if (!id || String(id) === String(selectedOrgId)) return;

    setIsContextChanging(true);
    setSelectedOrgId(id);
    setSelectedVenueId("");
    setOrganization({ id: String(id), name: name ?? undefined });
    clearVenue();

    // Remove ?venue from URL when org switches
    const sp = new URLSearchParams(location.search);
    if (sp.get("venue")) {
      sp.delete("venue");
      navigate(
        location.pathname + (sp.toString() ? `?${sp.toString()}` : ""),
        { replace: true }
      );
    }

    setIsContextChanging(false);
  };

  const onVenueChange = async (id, name) => {
    if (!id || String(id) === String(selectedVenueId)) return;

    setIsContextChanging(true);
    setIsInitialDevicesLoad(true);
    autoSelectedRef.current = {};
    setSelectedVenueId(id);

    const basePath = location.pathname.split("?")[0];
    navigate(`${basePath}?venue=${id}`, { replace: false });

    // If the select already handed us the name, skip the extra fetch
    if (name) {
      setVenue({ id: String(id), name });
      setIsContextChanging(false);
      return;
    }

    try {
      const res = await fetch(`${BASE}/venue/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data     = await res.json();
        const venueObj = data?.venue ?? data;
        setVenue({ id: String(id), name: venueObj?.name ?? String(id) });

        const orgId = venueObj?.organization ?? venueObj?.org ?? null;
        if (orgId) {
          setOrganization({ id: String(orgId) });
          setSelectedOrgId(String(orgId));
        }
      } else {
        setVenue({ id: String(id), name: String(id) });
      }
    } catch {
      setVenue({ id: String(id), name: String(id) });
    } finally {
      setIsContextChanging(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">

      {/* ── Main content column ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">

        {/* Header row: logo · org selector · venue selector */}
        <div className="flex justify-between items-center mb-6">
          {!isDesktopForIcon && (
            <img src="/logo-half.png" alt="Logo" className="w-auto h-[40px]" />
          )}

          <div className="sm:w-[25rem] md:w-[13rem] lg:w-[20rem] xl:w-[25rem]">

              <OrganizationSelect
                value={selectedOrgId}
                onChange={onOrganizationChange}
                className="mt-1"
                externalLabel={ctxOrg?.name ?? orgNameForTop}
              />

          </div>

          <div className="flex items-center ml-5 sm:ml-auto">
            <VenueSelect
              organizationId={selectedOrgId || ctxOrg?.id || user?.organization}
              value={selectedVenueId}
              onChange={onVenueChange}
              excludeFirstN={user?.role === "user" ? 3 : 0}
              externalLabel={ctxVenue?.name}
            />
          </div>
        </div>

        {/* Device cards grid */}
        <div className="flex-1 min-h-0">
          <div className="freezer-cards-container custom-scrollbar">
            {isInitialDevicesLoad || isContextChanging ? (
              /* Loading skeletons */
              <div className="freezer-cards-grid freezer-cards-container">
                {Array.from({ length: 4 }).map((_, i) => (
                  <DeviceSkeleton key={i} />
                ))}
              </div>

            ) : freezerDevices.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
                <svg
                  className="w-16 h-16 mb-4 text-[#E2E8F0]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <p className="text-lg font-medium">No Devices Found</p>
                <p className="text-sm">Select a venue to view its devices</p>
              </div>

            ) : (
              /* Device cards */
              <div className="freezer-cards-grid freezer-cards-container">
                {freezerDevices.map((device) => {
                  const idKey = String(device._id ?? device.id ?? device.deviceId);
                  const category = device.category || "monitoring"; // default to monitoring

                  // console.log('Device data:', device.state);
                  // Get real-time data from WebSocket
                  const deviceKey = device.deviceId || device.deviceName;
                  const liveData = deviceDataMap[deviceKey] || {};
                  const isOnline = deviceOnlineMap[deviceKey] || false;

                  // console.log(`Rendering device ${deviceKey} with live data:`, liveData, `Online: ${isOnline}`);
                  // console.log(`Rendering`, device);

                  // Common props shared by every card type.
                  // Use WebSocket data if available, fallback to device data
                  const commonProps = {
                    deviceId:         device.deviceId,
                    deviceName:       device.deviceName,
                    onCardSelect:     () => handleFreezerDeviceSelect(idKey),
                    isSelected:       idKey === String(selectedFreezerDeviceId),
                    ambientTemperature: device?.AmbientData?.temperature ?? device.ambientTemperature,
                    freezerTemperature: device?.FreezerData?.temperature ?? device.freezerTemperature,
                    espTemprature:    liveData.temperature ?? device?.espTemperature,
                    espHumidity:      liveData.humidity ?? device?.espHumidity,
                    espOdour:         liveData.odour ?? device?.espOdour,
                    espAQI:           liveData.AQI ?? device?.espAQI,
                    espGL:            liveData.gass ?? device?.espGL,
                    espVoltage:       liveData.voltage ?? device?.espVoltage,
                    espCurrent:       liveData.current ?? device?.espCurrent,
                    temperatureAlert: liveData.alerts?.some(a => a.type === 'temperature') ?? device?.temperatureAlert,
                    humidityAlert:    liveData.alerts?.some(a => a.type === 'humidity') ?? device?.humidityAlert,
                    odourAlert:       liveData.alerts?.some(a => a.type === 'odour') ?? device?.odourAlert,
                    aqiAlert:         liveData.alerts?.some(a => a.type === 'AQI') ?? device?.aqiAlert,
                    glAlert:          liveData.alerts?.some(a => a.type === 'gass') ?? device?.glAlert,
                    isOnline:         isOnline,
                    lastUpdateISO:    liveData.lastUpdateISO ?? device?.lastUpdateTime,
                    deviceState:      liveData.state ?? device.state, // NEW: WebSocket state for toggle button
                    category:         category, // NEW: Pass category for API selection
                    interval:         liveData.interval ?? device?.interval, // NEW: Interval for trigger devices
                    triggeredAlerts:  liveData.triggeredAlerts ?? [], // NEW: Triggered alerts for trigger devices

                  };

                  // ── Category-based rendering ──

                  // THD with scheduling or trigger → use SchedulerDeviceCard
                  if (device.deviceType === "THD" && (category === "scheduling" || category === "trigger")) {
                    return (
                      <SchedulerDeviceCard
                        key={idKey}
                        {...commonProps}
                        events={eventsMap[String(device.deviceId)] ?? []}
                        onRefreshScheduler={fetchSchedulerData}
                        scheduleData={deviceScheduleMap[deviceKey]}
                        interval={device?.interval}
                        triggeredAlerts={liveData.triggeredAlerts ?? []}
                      />
                    );
                  }

                  // ED with scheduling/trigger → modified ED card
                  if (device.deviceType === "ED" && (category === "scheduling" || category === "trigger")) {
                    return (
                      <EnergyMonitoringDeviceCard
                        key={idKey}
                        {...commonProps}
                        category={category}
                        events={eventsMap[String(device.deviceId)] ?? []}
                        onRefreshScheduler={fetchSchedulerData}
                        interval={device?.interval}
                      />
                    );
                  }

                  // AQID with scheduling/trigger → modified AQID card
                  if (device.deviceType === "AQID" && (category === "scheduling" || category === "trigger")) {
                    return (
                      <AQIDeviceCard
                        key={idKey}
                        {...commonProps}
                        category={category}
                        events={eventsMap[String(device.deviceId)] ?? []}
                        onRefreshScheduler={fetchSchedulerData}
                        interval={device?.interval}
                      />
                    );
                  }

                  // OD with scheduling/trigger → modified OD card
                  if (device.deviceType === "OD" && (category === "scheduling" || category === "trigger")) {
                    return (
                      <OdourDeviceCard
                        key={idKey}
                        {...commonProps}
                        category={category}
                        events={eventsMap[String(device.deviceId)] ?? []}
                        onRefreshScheduler={fetchSchedulerData}
                        interval={device?.interval}
                      />
                    );
                  }

                  // GLD with scheduling/trigger → modified GLD card
                  if (device.deviceType === "GLD" && (category === "scheduling" || category === "trigger")) {
                    return (
                      <GasLeakageDeviceCard
                        key={idKey}
                        {...commonProps}
                        category={category}
                        events={eventsMap[String(device.deviceId)] ?? []}
                        onRefreshScheduler={fetchSchedulerData}
                        interval={device?.interval}
                      />
                    );
                  }

                  // ── Default deviceType-based rendering (monitoring category) ──
                  switch (device.deviceType) {
                    case "AQID":
                      return (
                        <AQIDeviceCard
                          key={idKey}
                          {...commonProps}
                        />
                      );

                    case "THD":
                      return (
                        <TemperatureHumidityDeviceCard
                          key={idKey}
                          {...commonProps}
                        />
                      );

                    case "OD":
                      return (
                        <OdourDeviceCard
                          key={idKey}
                          {...commonProps}
                        />
                      );

                    case "GLD":
                      return (
                        <GasLeakageDeviceCard
                          key={idKey}
                          {...commonProps}
                        />
                      );

                    case "ED":
                      return (
                        <EnergyMonitoringDeviceCard
                          key={idKey}
                          {...commonProps}
                        />
                      );

                    case "TSD":
                      return (
                        <SchedulerDeviceCard
                          key={idKey}
                          {...commonProps}
                          startingOn={device?.scheduler?.startingOn}
                          duration={device?.scheduler?.duration}
                          repeatDays={device?.scheduler?.repeatDays ?? []}
                          enabled={device?.scheduler?.enabled}
                          events={eventsMap[String(device.deviceId)] ?? []}
                          onRefreshScheduler={fetchSchedulerData}
                        />
                      );

                    default:
                      return (
                        <FreezerDeviceCard
                          key={idKey}
                          {...commonProps}
                          deviceType={device?.deviceType}
                          espAQI={device?.espAQI}
                          aqiAlert={device?.aqiAlert}
                          espGL={device?.espGL}
                          glAlert={device?.glAlert}
                          batteryLow={device?.batteryLow}
                          refrigeratorAlert={device?.refrigeratorAlert}
                        />
                      );
                  }
                })}
              </div>
            )}
          </div>
        </div>

        <AlertsPanel
          venueId={selectedVenueId}
          organizationId={selectedOrgId}
          deviceDataMap={deviceDataMap}
        />
      </div>

      {/* ── Right panel / drawer ─────────────────────────────────────────── */}
      {(() => {
        // Find selected device
        // const selectedDevice = selectedFreezerDeviceId
        //   ? freezerDevices.find(
        //       (d) => String(d._id ?? d.id ?? d.deviceId) === String(selectedFreezerDeviceId)
        //     )
        //   : null;

        const selectedDevice =
  freezerDevices.find(
    (d) => String(d._id ?? d.id ?? d.deviceId) === String(selectedFreezerDeviceId)
  ) || null;

        // if (!selectedDevice) return null;

          
        // Get device key and WebSocket data
        // const deviceKey = String(selectedDevice.deviceId);
        // const liveData = deviceDataMap[deviceKey] || {};

        const deviceKey = selectedDevice?.deviceId
          ? String(selectedDevice?.deviceId)
          : "";

        const liveData = deviceDataMap[deviceKey] || {};

        // Calculate online status based on device type
        const deviceType = selectedDevice?.deviceType;
        const isOnline =
          deviceType === "TSD" || deviceType === "ESD"
            ? Boolean(schedulerDeviceOnlineMap[deviceKey])
            : Boolean(deviceOnlineMap[deviceKey]);

        // Merge WebSocket data with device data (WebSocket first!)
        const mergedProps = {
          venueName: selectedDevice?.venueName ?? selectedDevice?.venue?.name ?? "Venue",
          deviceType: selectedDevice?.deviceType,
          category: selectedDevice?.category || "monitoring",
          espTemprature: liveData.temperature ?? selectedDevice?.espTemperature,
          espHumidity: liveData.humidity ?? selectedDevice?.espHumidity,
          espOdour: liveData.odour ?? selectedDevice?.espOdour,
          espAQI: liveData.AQI ?? selectedDevice?.espAQI,
          espGL: liveData.gass ?? selectedDevice?.espGL,
          espVoltage: liveData.voltage ?? selectedDevice?.espVoltage,
          espCurrent: liveData.current ?? selectedDevice?.espCurrent,
          espPower: selectedDevice?.espPower,
          odourAlert: liveData.alerts?.some(a => a.type === 'odour') ?? selectedDevice?.odourAlert,
          temperatureAlert: liveData.alerts?.some(a => a.type === 'temperature') ?? selectedDevice?.temperatureAlert,
          humidityAlert: liveData.alerts?.some(a => a.type === 'humidity') ?? selectedDevice?.humidityAlert,
          aqiAlert: liveData.alerts?.some(a => a.type === 'AQI') ?? selectedDevice?.aqiAlert,
          glAlert: liveData.alerts?.some(a => a.type === 'gass') ?? selectedDevice?.glAlert,
          batteryLow: selectedDevice?.batteryLow ?? selectedDevice?.batteryAlert ?? false,
          needMaintenance: selectedDevice?.needMaintenance ?? false,
          apiKey: selectedDevice?.apiKey,
          organizationId: selectedOrgId,
          deviceId: selectedDevice?.deviceId,
          lastUpdateTime: liveData.lastUpdateISO ?? selectedDevice?.lastUpdateTime,
          isOnline: isOnline,
          deviceState: liveData.state ?? "OFF", // NEW: WebSocket state for toggle
          scheduleData: deviceScheduleMap[deviceKey], // NEW: WebSocket schedule data
        };

        const panelContent = isDesktop ? (
          <VenueDetailsPanel {...mergedProps} />
        ) : (
          <VenueDetailsPanel {...mergedProps} closeIcon onClose={() => setDrawerOpen(false)} />
        );

        return isDesktop ? (
          panelContent
        ) : (
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            anchor="right"
            PaperProps={{ sx: { width: "100%", maxWidth: "100vw" } }}
          >
            {panelContent}
          </Drawer>
        );
      })()}
    </div>
  );
}