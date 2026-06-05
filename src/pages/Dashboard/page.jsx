
// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import FreezerDeviceCard from "./FreezerDeviceCard";
import OrganizationSelect from "./OrganizationSelect";
import VenueSelect from "./VenueSelect";
import AlertsPanel from "./AlertsPanel";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import "../../styles/pages/Dashboard/freezer-cards-responsive.css";
import { useStore } from "../../contexts/storecontexts";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardRightPanel from "../../components/DashboardRightPanel";
import { Drawer, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizationByUserID } from "../../slices/OrganizationSlice";
import DeviceSkeleton from "./DeviceSkeleton";
import AQIDeviceCard from "./AQIDeviceCard";
import TemperatureHumidityDeviceCard from "./TemperatureHumidityDeviceCard";
import OdourDeviceCard from "./OdourDeviceCard";
import GasLeakageDeviceCard from "./GasLeakageDeviceCard";
import { InfluxDB } from "@influxdata/influxdb-client";

// NEW import
import { useOrgVenue } from "../../contexts/OrgVenueContext";
import EnergyMonitoringDeviceCard from "./EnergyMonitoringDeviceCard";
import SchedulerDeviceCard from "./SchedulerDeviceCard";
import { useScheduler } from "../../contexts/SchedulerContext";

const mockFreezerDevices = [];

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function Dashboard() {
  const { user, getToken } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();

  const { organization: ctxOrg, venue: ctxVenue, setOrganization, setVenue, clearVenue } = useOrgVenue();

  const [organizations, setOrganizations] = useState([]);
  const [freezerDevices, setFreezerDevices] = useState(mockFreezerDevices);
  const [selectedFreezerDeviceId, setSelectedFreezerDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [orgNameForTop, setOrgNameForTop] = useState();
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");
  const isDesktopForIcon = useMediaQuery("(min-width:760px)");
  const autoSelectedForVenueRef = React.useRef({});
  const [isInitialDevicesLoad, setIsInitialDevicesLoad] = useState(true);
  const [isContextChanging, setIsContextChanging] = useState(false);
  const [pollHitTime, setPollHitTime] = useState(Date.now());
  const [deviceOnlineMap, setDeviceOnlineMap] = useState({});
  const [deviceLastUpdateMap, setDeviceLastUpdateMap] = useState({});
  const [deviceInfluxValuesMap, setDeviceInfluxValuesMap] = useState({});
  const [schedulerDeviceOnlineMap, setSchedulerDeviceOnlineMap] = useState({}); // Separate for TSD/ESD
  const deviceMetadataRef = React.useRef({ ids: [], typeMap: {} });

  // Use refs to avoid stale closures
  const deviceInfluxValuesRef = React.useRef({});
  const deviceLastUpdateRef = React.useRef({});
  const influxQueryFunctionRef = React.useRef(null);


  const { eventsMap, toggleMap, setEvents, setToggle } = useScheduler();


  const hasVenueInUrl = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return Boolean(sp.get("venue"));
  }, [location.search]);

  // -------------------------
  // existing helpers...
  // -------------------------
  const getAllDevicesInOrganization = (org) => {
    let devices = [...(org.devices || [])];
    if (org.subOrganizations) {
      org.subOrganizations.forEach((subOrg) => {
        devices = devices.concat(getAllDevicesInOrganization(subOrg));
      });
    }
    return devices;
  };

  const findOrganizationById = (orgs, id) => {
    for (const org of orgs) {
      if (String(org.id) === String(id) || String(org._id) === String(id)) return org;
      if (org.subOrganizations) {
        const found = findOrganizationById(org.subOrganizations, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedOrganizationData = useMemo(() => {
    if (!selectedOrgId || organizations.length === 0) return null;
    const org = findOrganizationById(organizations, selectedOrgId);
    if (!org) return null;
    const allDevices = getAllDevicesInOrganization(org);
    return {
      organizationName: org.name || org.organization_name || selectedOrgId,
      deviceCount: allDevices.length,
    };
  }, [selectedOrgId, organizations]);


  // ---- MOUNT: restore URL from stored context ----
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (!sp.get("venue") && ctxVenue?.id) {
      navigate(`${location.pathname}?venue=${ctxVenue.id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  // ---- Initialize org for non-admin users from user object ----
  useEffect(() => {
    if (user?.role !== "admin" && user?.organization && !selectedOrgId) {
      const orgId = String(user.organization);
      setSelectedOrgId(orgId);
      // if context has no org yet, seed it
      if (!ctxOrg?.id) {
        setOrganization({ id: orgId, name: orgNameForTop ?? undefined });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organization]);

  // EFFECT: fetchOrganizations placeholder (unchanged)
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        const mockOrgs = [];
        setOrganizations(mockOrgs);
      } catch (err) {
        setError(err.message || "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  const dispatch = useDispatch();

  // polling interval helper (unchanged)
  const getPollingInterval = () => {
    if (!user?.timer) return 10 * 60 * 1000;
    const match = /^(\d+)(s|m)$/.exec(user.timer.trim());
    if (!match) return 10 * 60 * 1000;  // Changed to 10 mins for consistency
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === "s") {
      return Math.min(Math.max(value, 0), 60) * 1000;
    } else if (unit === "m") {
      return Math.min(Math.max(value, 0), 60) * 60 * 1000;
    }
    return 10 * 60 * 1000;  // Changed to 10 mins for consistency
  };

  const POLL_MS = getPollingInterval();

  useEffect(() => {
    if (user?.role !== "admin" && user?._id) {
      dispatch(fetchOrganizationByUserID(user._id))
        .unwrap()
        .then((org) => {
          console.log("Organization object:", org);
          setOrgNameForTop(org?.name);
        })
        .catch((err) => {
          console.log("Failed to fetch organization:", err);
        });
    }
  }, [dispatch, user]);

  // -------------------------
  // SYNC context -> local state on mount / context change
  // This ensures after refresh we show labels immediately
  // -------------------------
  useEffect(() => {
    if (ctxOrg?.id) {
      if (String(ctxOrg.id) !== String(selectedOrgId)) setSelectedOrgId(String(ctxOrg.id));
      if (ctxOrg.name && !orgNameForTop) setOrgNameForTop(ctxOrg.name);
    }
    // if context org was cleared, clear local
    if (!ctxOrg && selectedOrgId) {
      setSelectedOrgId("");
      setOrgNameForTop(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxOrg?.id, ctxOrg?.name]);

  useEffect(() => {
    if (ctxVenue?.id) {
      if (String(ctxVenue.id) !== String(selectedVenueId)) setSelectedVenueId(String(ctxVenue.id));
    }
    if (!ctxVenue && selectedVenueId) {
      setSelectedVenueId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxVenue?.id]);

  // -------------------------
  // URL -> venue: when ?venue=... exists we fetch its org and set context (so selects show names)
  // This is your existing effect, now setting context
  // -------------------------
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const venueFromUrl = sp.get("venue") || "";

    if (venueFromUrl === selectedVenueId) return;

    setIsContextChanging(true);

    if (!venueFromUrl) {
      setSelectedVenueId("");
      // also clear context venue
      setVenue(null);
      setIsContextChanging(false);
      return;
    }

    setSelectedVenueId(venueFromUrl);

    (async () => {
      try {
        const res = await fetch(`${BASE}/venue/${venueFromUrl}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          console.warn("Venue fetch failed", res.status);
          setIsContextChanging(false);
          return;
        }
        const data = await res.json();
        const venue = data?.venue ?? data;
        const orgId = venue?.organization ?? venue?.org ?? venue?.organizationId ?? null;
        const venueName = venue?.name ?? venue?.venueName ?? venue?.venue_name ?? String(venueFromUrl);

        // set venue in context (so VenueSelect can show name even before its own fetch completes)
        setVenue({ id: String(venueFromUrl), name: venueName });

        // if venue holds organization id, set that in context too
        if (orgId) {
          // try to get org name quickly (if you have organizations list)
          const orgObj = organizations.find((o) => String(o._id ?? o.id ?? o) === String(orgId));
          const orgName = orgObj?.name ?? org?.organization_name ?? orgNameForTop ?? undefined;
          setOrganization({ id: String(orgId), name: orgName });
          // also update local selectedOrgId so OrganizationSelect receives the correct value prop
          setSelectedOrgId(String(orgId));
        }
      } catch (err) {
        console.warn("Could not fetch venue->org", err);
      } finally {
        setIsContextChanging(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // -------------------------
  // Devices fetch effect (unchanged)
  // -------------------------
  useEffect(() => {
    if (!selectedVenueId) {
      setFreezerDevices([]);
      setSelectedFreezerDeviceId(null);
      autoSelectedForVenueRef.current = {};
      return;
    }

    let mounted = true;
    let intervalId = null;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDevices = async (isPolling = false) => {
      const hitTime = Date.now();
      setPollHitTime(hitTime);
      try {
        const res = await fetch(`${BASE}/device/get-by-venue/${selectedVenueId}`, {
          method: "GET",
          credentials: "include",
          signal,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        console.log("fetch while hitting api", data);

        if (!mounted) return;

        if (res.ok) {
          const devices = Array.isArray(data.devices) ? data.devices : data.devices ? [data.devices] : [];
          console.log("devices<>", devices);

          // Update device metadata ref for InfluxDB query
          const deviceIds = devices.map((d) => String(d.deviceId).trim()).filter(Boolean);
          const deviceTypeMap = {};
          devices.forEach((d) => {
            const id = String(d.deviceId).trim();
            if (id) deviceTypeMap[id] = d.deviceType;
          });
          deviceMetadataRef.current = { ids: deviceIds, typeMap: deviceTypeMap };
          console.log("Updated deviceMetadataRef:", deviceMetadataRef.current);

          // Trigger InfluxDB query immediately after updating metadata
          if (influxQueryFunctionRef.current) {
            console.log("Triggering InfluxDB query after API fetch");
            influxQueryFunctionRef.current();
          }

          //FaRaZ
          // const hasScheduler = withFrontendSeed.some((d) => d.deviceType === "SCHEDULER");

          // if (!hasScheduler) {
          //   withFrontendSeed.push(mockSchedulerDevice);
          // }


          setFreezerDevices((prevDevices) => {
            const prevMap = new Map(prevDevices.map((d) => [String(d._id ?? d.id ?? d.deviceId), d]));

            //FaRaZ
            // return withFrontendSeed.map((newDevice) => {
            return devices.map((newDevice) => {
              const id = String(newDevice._id ?? newDevice.id ?? newDevice.deviceId);
              const oldDevice = prevMap.get(id);

              // Get InfluxDB values for this device (read from ref to avoid stale closure)
              const influxKey = String(newDevice.deviceId);
              const influxValues = deviceInfluxValuesRef.current[influxKey] || {};
              const influxLastUpdate = deviceLastUpdateRef.current[influxKey] || null;

              console.log(`Merging device ${influxKey}:`, {
                apiValues: {
                  espHumidity: newDevice.espHumidity,
                  espTemprature: newDevice.espTemprature,
                },
                influxValues: influxValues,
                finalValues: {
                  espHumidity: influxValues.espHumidity !== undefined ? influxValues.espHumidity : null,
                  espTemprature: influxValues.espTemprature !== undefined ? influxValues.espTemprature : null,
                }
              });

              // If no oldDevice, create base structure with InfluxDB fields set to null
              if (!oldDevice) {
                return {
                  ...newDevice,
                  // Override InfluxDB fields with null (don't use MongoDB values)
                  espHumidity: influxValues.espHumidity !== undefined ? influxValues.espHumidity : null,
                  espTemprature: influxValues.espTemprature !== undefined ? influxValues.espTemprature : null,
                  espOdour: influxValues.espOdour !== undefined ? influxValues.espOdour : null,
                  espAQI: influxValues.espAQI !== undefined ? influxValues.espAQI : null,
                  espGL: influxValues.espGL !== undefined ? influxValues.espGL : null,
                  espVoltage: influxValues.espVoltage !== undefined ? influxValues.espVoltage : null,
                  espCurrent: influxValues.espCurrent !== undefined ? influxValues.espCurrent : null,
                  espPower: influxValues.espPower !== undefined ? influxValues.espPower : null,
                  NH3: influxValues.NH3 !== undefined ? influxValues.NH3 : null,
                  H2S: influxValues.H2S !== undefined ? influxValues.H2S : null,
                  PM1: influxValues.PM1 !== undefined ? influxValues.PM1 : null,
                  PM25: influxValues.PM25 !== undefined ? influxValues.PM25 : null,
                  PM10: influxValues.PM10 !== undefined ? influxValues.PM10 : null,
                  Status: influxValues.Status !== undefined ? influxValues.Status : null,
                  lastUpdateTime: influxLastUpdate,
                };
              }

              return {
                // Base device properties (IDs, metadata, etc.)
                ...oldDevice,
                _id: newDevice._id ?? oldDevice._id,
                id: newDevice.id ?? oldDevice.id,
                deviceId: newDevice.deviceId ?? oldDevice.deviceId,
                deviceType: newDevice.deviceType ?? oldDevice.deviceType,
                venueName: newDevice.venueName ?? oldDevice.venueName,
                venue: newDevice.venue ?? oldDevice.venue,
                apiKey: newDevice.apiKey ?? oldDevice.apiKey,
                chartData: newDevice.chartData ?? oldDevice.chartData,
                needMaintenance: newDevice.needMaintenance ?? oldDevice.needMaintenance,
                scheduler: newDevice.scheduler ?? oldDevice.scheduler,

                // InfluxDB fields: NO fallback to API, use ONLY InfluxDB values
                espHumidity: influxValues.espHumidity !== undefined ? influxValues.espHumidity : null,
                espTemprature: influxValues.espTemprature !== undefined ? influxValues.espTemprature : null,
                espOdour: influxValues.espOdour !== undefined ? influxValues.espOdour : null,
                espAQI: influxValues.espAQI !== undefined ? influxValues.espAQI : null,
                espGL: influxValues.espGL !== undefined ? influxValues.espGL : null,
                espVoltage: influxValues.espVoltage !== undefined ? influxValues.espVoltage : null,
                espCurrent: influxValues.espCurrent !== undefined ? influxValues.espCurrent : null,
                espPower: influxValues.espPower !== undefined ? influxValues.espPower : null,
                NH3: influxValues.NH3 !== undefined ? influxValues.NH3 : null,
                H2S: influxValues.H2S !== undefined ? influxValues.H2S : null,
                PM1: influxValues.PM1 !== undefined ? influxValues.PM1 : null,
                PM25: influxValues.PM25 !== undefined ? influxValues.PM25 : null,
                PM10: influxValues.PM10 !== undefined ? influxValues.PM10 : null,
                Status: influxValues.Status !== undefined ? influxValues.Status : null,

                // These fields are NOT in InfluxDB, keep from API
                ambientTemperature: newDevice.ambientTemperature ?? oldDevice.ambientTemperature,
                freezerTemperature: newDevice.freezerTemperature ?? oldDevice.freezerTemperature,

                // Alerts: Always from API (not from InfluxDB)
                temperatureAlert: newDevice.temperatureAlert ?? oldDevice.temperatureAlert,
                humidityAlert: newDevice.humidityAlert ?? oldDevice.humidityAlert,
                odourAlert: newDevice.odourAlert ?? oldDevice.odourAlert,
                aqiAlert: newDevice.aqiAlert ?? oldDevice.aqiAlert,
                glAlert: newDevice.glAlert ?? oldDevice.glAlert,
                batteryLow: newDevice.batteryLow ?? oldDevice.batteryLow,
                refrigeratorAlert: newDevice.refrigeratorAlert ?? oldDevice.refrigeratorAlert,

                // Last update time: ONLY from InfluxDB, no fallback
                lastUpdateTime: influxLastUpdate,

                // Keep nested data structures from API
                AmbientData: newDevice.AmbientData ?? oldDevice.AmbientData,
                FreezerData: newDevice.FreezerData ?? oldDevice.FreezerData,
              };
            });
          });



          if (isDesktop && devices && devices.length > 0) {
            if (!autoSelectedForVenueRef.current[selectedVenueId]) {
              const firstId = devices[0]._id ?? devices[0].id ?? devices[0].deviceId;
              if (firstId) {
                setSelectedFreezerDeviceId(String(firstId));
                autoSelectedForVenueRef.current[selectedVenueId] = true;
              }
            }
          }

          if (!isDesktop && !isPolling) {
            setSelectedFreezerDeviceId(null);
          }
        } else {
          setFreezerDevices([]);
          setSelectedFreezerDeviceId(null);
          console.error("Device fetch error:", data?.message);
        }
      } catch (err) {
        if (!mounted) return;
        if (err.name === "AbortError") return;
        console.error("Device fetch error:", err);
        setFreezerDevices([]);
        setSelectedFreezerDeviceId(null);
      } finally {
        if (!isPolling) {
          setIsInitialDevicesLoad(false);
          setIsContextChanging(false);
        }
      }
    };

    fetchDevices(false);

    intervalId = setInterval(() => {
      fetchDevices(true);
    }, POLL_MS);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      controller.abort();
    };
  }, [selectedVenueId, token, isDesktop, POLL_MS]);

  // -------------------------
  // Re-merge devices when InfluxDB values update (without causing infinite loop)
  // -------------------------
  useEffect(() => {
    if (!freezerDevices.length || Object.keys(deviceInfluxValuesMap).length === 0) return;

    setFreezerDevices((prevDevices) => {
      return prevDevices.map((device) => {
        const influxKey = String(device.deviceId);
        // Read from refs to get latest values
        const influxValues = deviceInfluxValuesRef.current[influxKey] || {};
        const influxLastUpdate = deviceLastUpdateRef.current[influxKey] || null;

        if (Object.keys(influxValues).length === 0 && !influxLastUpdate) {
          return device; // No InfluxDB data for this device, keep as is
        }

        console.log(`Re-merging device ${influxKey} with InfluxDB data:`, {
          currentValues: {
            espHumidity: device.espHumidity,
            espTemprature: device.espTemprature,
          },
          influxValues: influxValues,
        });

        // Update only InfluxDB fields, keep everything else
        return {
          ...device,
          espHumidity: influxValues.espHumidity !== undefined ? influxValues.espHumidity : device.espHumidity,
          espTemprature: influxValues.espTemprature !== undefined ? influxValues.espTemprature : device.espTemprature,
          espOdour: influxValues.espOdour !== undefined ? influxValues.espOdour : device.espOdour,
          espAQI: influxValues.espAQI !== undefined ? influxValues.espAQI : device.espAQI,
          espGL: influxValues.espGL !== undefined ? influxValues.espGL : device.espGL,
          espVoltage: influxValues.espVoltage !== undefined ? influxValues.espVoltage : device.espVoltage,
          espCurrent: influxValues.espCurrent !== undefined ? influxValues.espCurrent : device.espCurrent,
          espPower: influxValues.espPower !== undefined ? influxValues.espPower : device.espPower,
          NH3: influxValues.NH3 !== undefined ? influxValues.NH3 : device.NH3,
          H2S: influxValues.H2S !== undefined ? influxValues.H2S : device.H2S,
          PM1: influxValues.PM1 !== undefined ? influxValues.PM1 : device.PM1,
          PM25: influxValues.PM25 !== undefined ? influxValues.PM25 : device.PM25,
          PM10: influxValues.PM10 !== undefined ? influxValues.PM10 : device.PM10,
          Status: influxValues.Status !== undefined ? influxValues.Status : device.Status,
          lastUpdateTime: influxLastUpdate !== null ? influxLastUpdate : device.lastUpdateTime,
        };
      });
    });
  }, [deviceInfluxValuesMap, deviceLastUpdateMap, freezerDevices.length]);

  // -------------------------
  // TSD/ESD Online Status Polling (5 seconds)
  // -------------------------
  useEffect(() => {
    if (!freezerDevices || freezerDevices.length === 0) return;

    let mounted = true;
    let intervalId = null;

    const fetchSchedulerOnlineStatus = async () => {
      try {
        // Filter only TSD and ESD devices
        const schedulerDevices = freezerDevices.filter(
          (d) => d.deviceType === "TSD" || d.deviceType === "ESD"
        );

        if (schedulerDevices.length === 0) return;

        console.log(`Fetching online status for ${schedulerDevices.length} TSD/ESD devices`);

        const onlineStatusMap = {};

        // Fetch status for each scheduler device
        for (const device of schedulerDevices) {
          const deviceKey = String(device.deviceId);

          try {
            const res = await fetch(
              `${BASE}/event/get-current-events/${device.deviceId}`,
              {
                method: "GET",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }
            );

            if (!mounted) return;

            if (res.ok) {
              const data = await res.json();
              const isOnline = (data?.event?.isDeviceOnline || data?.isDeviceOnline) ?? false;
              onlineStatusMap[deviceKey] = isOnline;

              console.log(`TSD/ESD ${deviceKey} online status:`, isOnline);

              // Also update event data in scheduler context
              if (data.type && data.event) {
                const eventWithType = { ...data.event, type: data.type };
                setEvents(deviceKey, [eventWithType]);
              }
            } else {
              console.warn(`Failed to fetch status for ${deviceKey}:`, res.status);
              onlineStatusMap[deviceKey] = false;
            }
          } catch (err) {
            console.error(`Error fetching status for ${deviceKey}:`, err);
            onlineStatusMap[deviceKey] = false;
          }
        }

        if (mounted) {
          console.log('📊 Updating schedulerDeviceOnlineMap:', onlineStatusMap);
          setSchedulerDeviceOnlineMap((prev) => {
            const updated = { ...prev, ...onlineStatusMap };
            console.log('📊 New schedulerDeviceOnlineMap state:', updated);
            return updated;
          });
        }
      } catch (err) {
        console.error("Error in scheduler online status polling:", err);
      }
    };

    // Initial fetch
    fetchSchedulerOnlineStatus();

    // Poll every 5 seconds
    intervalId = setInterval(() => {
      fetchSchedulerOnlineStatus();
    }, 5000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [freezerDevices, token, BASE, setEvents]);

  //FaRaZ
  // fetch events of TSD devices
  const fetchSchedulerData = React.useCallback(async () => {
    console.log(`🔄 [page.jsx] fetchSchedulerData started`);
    try {
      const tsdDevices = freezerDevices.filter(
        (d) => d.deviceType === "TSD"
      );

      console.log(`📋 [page.jsx] Found ${tsdDevices.length} TSD devices`);

      for (const device of tsdDevices) {
        const deviceKey = String(device.deviceId);

        console.log(`🔵 [page.jsx] Processing device: ${deviceKey}`);

        try {
          // ✅ Fetch current/next event status for toggle state
          const statusRes = await fetch(
            `${BASE}/event/get-current-events/${device.deviceId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );

          if (!statusRes.ok) {
            console.log(`⚠️ [page.jsx] Status fetch failed for ${deviceKey}`);
            continue;
          }

          const statusData = await statusRes.json();
          console.log(`✅ [page.jsx] Status data for ${deviceKey}:`, statusData);

          // ✅ Fetch ALL events for the device (don't overwrite with just 1 event)
          const allEventsRes = await fetch(
            `${BASE}/event/get-by-deviceid/${device.deviceId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );

          if (allEventsRes.ok) {
            const allEventsData = await allEventsRes.json();
            const allEvents = allEventsData.schedules || [];

            console.log(`📋 [page.jsx] Fetched ${allEvents.length} events for ${deviceKey}`);

            // ✅ Mark the current/next event with type and merge additional fields (duration, isOvernight, etc.)
            const eventsWithType = allEvents.map(event => {
              if (statusData.type === "CURRENT" && statusData.event?._id === event._id) {
                // Merge event data from API response (includes duration, isOvernight, nextDay, etc.)
                return { ...event, ...statusData.event, type: "CURRENT" };
              }
              if (statusData.type === "NEXT" && statusData.event?._id === event._id) {
                // Merge event data from API response (includes duration, isOvernight, nextDay, etc.)
                return { ...event, ...statusData.event, type: "NEXT" };
              }
              return event;
            });

            console.log(`🎯 [page.jsx] Marked events for ${deviceKey}:`, eventsWithType);
            setEvents(deviceKey, eventsWithType);
          } else {
            console.log(`⚠️ [page.jsx] All events fetch failed for ${deviceKey}, using fallback`);
            // Fallback to old behavior if all-events endpoint fails
            if (statusData.type === "CURRENT" && statusData.event) {
              setEvents(deviceKey, [{ ...statusData.event, type: statusData.type }]);
            } else if (statusData.type === "NEXT" && statusData.event) {
              setEvents(deviceKey, [{ ...statusData.event, type: statusData.type }]);
            } else {
              setEvents(deviceKey, []);
              setToggle(deviceKey, "off");
            }
          }

        } catch (err) {
          console.warn("Scheduler fetch error:", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [freezerDevices, BASE, token, setEvents, setToggle]);
  useEffect(() => {
    if (!freezerDevices || freezerDevices.length === 0) return;

    fetchSchedulerData();

  }, [freezerDevices, pollHitTime, fetchSchedulerData]);

  // -------------------------
  // Event handlers (UPDATED to set context)
  // -------------------------
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleFreezerDeviceSelect = (deviceId) => {
    console.log("Card Selected");
    setSelectedFreezerDeviceId(deviceId);
    if (!isDesktop) setOpen(true);
  };

  // onOrganizationChange now accepts (id, name) but will also work with old signature
  const onOrganizationChange = (id, name) => {
    const orgId = id || user?.organization;

    if (orgId && String(orgId) === String(selectedOrgId)) {
      return;
    }

    setIsContextChanging(true);
    setSelectedOrgId(orgId || user?.organization);
    setSelectedVenueId("");

    // update context: setOrganization clears venue automatically if org changed
    setOrganization({ id: String(orgId), name: name ?? undefined });
    // also clear saved venue (context) so the new org takes effect
    clearVenue();

    // remove ?venue from URL
    const sp = new URLSearchParams(location.search);
    if (sp.get("venue")) {
      sp.delete("venue");
      navigate(location.pathname + (sp.toString() ? `?${sp.toString()}` : ""), { replace: true });
    }

    setIsContextChanging(false);
  };

  // onVenueChange accepts (id, name) — if name provided we set it directly in context (faster)
  const onVenueChange = async (id, name) => {
    if (String(id) === String(selectedVenueId)) return;
    setIsContextChanging(true);

    setSelectedVenueId(id);
    const basePath = location.pathname.split("?")[0];
    if (id) navigate(`${basePath}?venue=${id}`, { replace: false });
    else navigate(basePath, { replace: false });

    // If select passed name, use it; otherwise fetch venue name
    if (name) {
      setVenue({ id: String(id), name });
      setIsContextChanging(false);
      return;
    }

    try {
      const res = await fetch(`${BASE}/venue/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        const venueObj = data?.venue ?? data;
        const vName = venueObj?.name ?? venueObj?.venueName ?? String(id);
        setVenue({ id: String(id), name: vName });
        // optionally set org if returned
        const orgId = venueObj?.organization ?? venueObj?.org ?? venueObj?.organizationId ?? null;
        if (orgId) {
          setOrganization({ id: String(orgId), name: undefined });
          setSelectedOrgId(String(orgId));
        }
      } else {
        setVenue({ id: String(id), name: String(id) });
      }
    } catch (err) {
      console.warn("Failed to fetch venue details", err);
      setVenue({ id: String(id), name: String(id) });
    } finally {
      setIsContextChanging(false);
    }
  };

  // ======= InfluxDB field mapping configuration ========
  const DEVICE_INFLUX_FIELDS = {
    OMD: ["temperature", "humidity", "NH3", "H2S", "odor"],
    GLMD: ["leakage", "temperature", "humidity"],
    TMD: ["temperature", "humidity"],
    TSD: ["temp", "humi"],
    AQIMD: ["AQI", "temperature", "humidity", "PM1", "PM25", "PM10", "Status"],
    EMD: ["voltage", "current", "temperature", "humidity"],
    ESD: ["voltage", "current", "temperature", "humidity"],
  };

  // Map InfluxDB field names to component prop names
  const mapInfluxToProps = (deviceType, influxData) => {
    const mapped = {};

    switch (deviceType) {
      case "TMD":
        if (influxData.temperature !== undefined) mapped.espTemprature = influxData.temperature;
        if (influxData.humidity !== undefined) mapped.espHumidity = influxData.humidity;
        break;
      case "TSD":
        if (influxData.temp !== undefined) mapped.espTemprature = influxData.temp;
        if (influxData.humi !== undefined) mapped.espHumidity = influxData.humi;
        break;
      case "OMD":
        if (influxData.temperature !== undefined) mapped.espTemprature = influxData.temperature;
        if (influxData.humidity !== undefined) mapped.espHumidity = influxData.humidity;
        if (influxData.odor !== undefined) mapped.espOdour = influxData.odor;
        if (influxData.NH3 !== undefined) mapped.NH3 = influxData.NH3;
        if (influxData.H2S !== undefined) mapped.H2S = influxData.H2S;
        break;
      case "AQIMD":
        if (influxData.AQI !== undefined) mapped.espAQI = influxData.AQI;
        if (influxData.temperature !== undefined) mapped.espTemprature = influxData.temperature;
        if (influxData.humidity !== undefined) mapped.espHumidity = influxData.humidity;
        if (influxData.PM1 !== undefined) mapped.PM1 = influxData.PM1;
        if (influxData.PM25 !== undefined) mapped.PM25 = influxData.PM25;
        if (influxData.PM10 !== undefined) mapped.PM10 = influxData.PM10;
        if (influxData.Status !== undefined) mapped.Status = influxData.Status;
        break;
      case "GLMD":
        if (influxData.leakage !== undefined) mapped.espGL = influxData.leakage;
        if (influxData.temperature !== undefined) mapped.espTemprature = influxData.temperature;
        if (influxData.humidity !== undefined) mapped.espHumidity = influxData.humidity;
        break;
      case "EMD":
      case "ESD":
        if (influxData.voltage !== undefined) mapped.espVoltage = influxData.voltage;
        if (influxData.current !== undefined) mapped.espCurrent = influxData.current;
        if (influxData.temperature !== undefined) mapped.espTemprature = influxData.temperature;
        if (influxData.humidity !== undefined) mapped.espHumidity = influxData.humidity;
        // Compute power if both voltage and current are available
        if (influxData.voltage !== undefined && influxData.current !== undefined) {
          const v = Number(influxData.voltage);
          const c = Number(influxData.current);
          if (Number.isFinite(v) && Number.isFinite(c)) {
            mapped.espPower = +(v * c).toFixed(2);
          }
        }
        break;
      default:
        break;
    }

    return mapped;
  };

  // ======= rest of file: influx polling + render ========
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    let intervalId = null;

    const influxUrl = import.meta.env.VITE_INFLUX_URL;
    const influxToken = import.meta.env.VITE_INFLUX_TOKEN;
    const influxOrg = import.meta.env.VITE_INFLUX_ORG;
    const influxBucket = "Odour";

    if (!influxUrl || !influxToken || !influxOrg || !influxBucket) {
      console.warn("Influx env vars not set; skipping InfluxDB polling.");
      return () => { };
    }

    const client = new InfluxDB({ url: influxUrl, token: influxToken });
    const queryApi = client.getQueryApi(influxOrg);

    const runQueryForAllDevices = async () => {
      try {
        // Use ref to get latest device metadata
        const deviceIds = deviceMetadataRef.current.ids;
        const deviceTypeMap = deviceMetadataRef.current.typeMap;

        console.log("device ids for influx db ", deviceIds);
        if (!deviceIds.length) {
          console.log("No devices yet, skipping InfluxDB query");
          return; // Skip this iteration, but keep the interval running
        }

        // Collect all unique fields needed across all devices

        // Collect all unique fields needed across all devices
        const allFieldsSet = new Set();
        Object.values(DEVICE_INFLUX_FIELDS).forEach((fields) => {
          fields.forEach((f) => allFieldsSet.add(f));
        });
        const allFields = Array.from(allFieldsSet);

        const measureFilter = deviceIds.map((id) => `r._measurement == "${id}"`).join(" or ");
        const fieldFilter = allFields.map((f) => `r._field == "${f}"`).join(" or ");

        //       const flux = `
        // from(bucket: "${influxBucket}")
        //   |> range(start: -30d)
        //   |> filter(fn: (r) => (${measureFilter}) and (${fieldFilter}))
        //   |> last()
        //   |> pivot(rowKey:["_time", "_measurement"], columnKey: ["_field"], valueColumn: "_value")
        // `;

        const flux = `
  from(bucket: "${influxBucket}")
    |> range(start: 0)
    |> filter(fn: (r) => (${measureFilter}) and (${fieldFilter}))
    |> last()
    |> pivot(rowKey:["_time", "_measurement"], columnKey: ["_field"], valueColumn: "_value")
  `;

        console.log("FLUX QUERY:\n", flux);
        const rows = await queryApi.collectRows(flux);
        console.log("InfluxDB Raw Rows:", rows);
        if (!mounted) return;

        const lastMap = {};
        const onlineMap = {};
        const valuesMap = {};
        // Use user.timer for online threshold, default to 10 mins
        const thresholdMs = Date.now() - POLL_MS;

        for (const r of rows) {
          const m = r._measurement || r.measurement;
          const t = r._time ?? r.time ?? null;

          if (!m) continue;
          const deviceId = String(m);

          // Convert timestamp to ISO string, handle null properly
          let timeISO = null;
          if (t) {
            if (typeof t === "string") {
              timeISO = t;
            } else if (t instanceof Date) {
              timeISO = t.toISOString();
            } else {
              timeISO = String(t);
            }
          }

          lastMap[deviceId] = timeISO;

          // Check online status
          if (timeISO) {
            const ts = new Date(timeISO).getTime();
            onlineMap[deviceId] = Number.isFinite(ts) && ts >= thresholdMs;
          } else {
            onlineMap[deviceId] = false;
          }

          // Extract sensor values for this device
          const deviceType = deviceTypeMap[deviceId];
          if (deviceType && DEVICE_INFLUX_FIELDS[deviceType]) {
            const influxData = {};
            DEVICE_INFLUX_FIELDS[deviceType].forEach((field) => {
              if (r[field] !== undefined && r[field] !== null) {
                influxData[field] = r[field];
              }
            });
            const mappedValues = mapInfluxToProps(deviceType, influxData);
            console.log(`InfluxDB Data for ${deviceId} (${deviceType}):`, {
              raw: influxData,
              mapped: mappedValues
            });
            valuesMap[deviceId] = mappedValues;
          }
        }

        // Handle devices with no data
        deviceIds.forEach((id) => {
          if (!lastMap[id]) {
            onlineMap[id] = false;
          }
        });

        console.log("InfluxDB Final Values Map:", valuesMap);
        console.log("InfluxDB Online Map:", onlineMap);

        // Update refs first (for fresh reads in API fetch)
        deviceInfluxValuesRef.current = { ...deviceInfluxValuesRef.current, ...valuesMap };
        deviceLastUpdateRef.current = { ...deviceLastUpdateRef.current, ...lastMap };

        // Then update state (for re-renders)
        setDeviceLastUpdateMap((prev) => ({ ...prev, ...lastMap }));
        setDeviceOnlineMap((prev) => ({ ...prev, ...onlineMap }));
        setDeviceInfluxValuesMap((prev) => ({ ...prev, ...valuesMap }));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Influx polling error:", err);
      }
    };

    // Store the query function in ref so it can be called from API fetch
    influxQueryFunctionRef.current = runQueryForAllDevices;

    runQueryForAllDevices();
    intervalId = setInterval(() => {
      runQueryForAllDevices();
    }, POLL_MS);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
      controller.abort();
    };
  }, [selectedVenueId, POLL_MS]);

  if (loading) {
    return (
      <div className="flex w-full flex-row h-full bg-gray-100 font-inter rounded-md overflow-hidden">
        <div className="flex justify-center items-center w-full h-64" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row h-full font-inter rounded-md bg-[#F5F6FA]">
      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto custom-scrollbar dashboard-main-content bg-white shadow-sm border border-[#E5E7EB]/30 p-4 lg:p-6">
        <>
          <div className="flex justify-between items-center mb-6">
            {!isDesktopForIcon && <img src="/logo-half.png" alt="IOTFIY LOGO" className="w-auto h-[40px]" />}

            <div className="  sm:w-[25rem] md:w-[13rem] lg:w-[20rem] xl:w-[25rem]">
              {user?.role === "admin" ? (
                <OrganizationSelect
                  value={selectedOrgId}
                  onChange={onOrganizationChange}
                  className="mt-1"
                  disableAutoSelect={hasVenueInUrl}
                  // show friendly label from context while org list loads
                  externalLabel={ctxOrg?.name ?? orgNameForTop}
                />
              ) : (
                <>
                  <p className="text-gray-500">Organization</p>
                  <h3 className="text-gray-700 font-bold capitalize">{orgNameForTop || ""}</h3>
                </>
              )}
            </div>

            <div className="flex items-center  ml-5 sm:ml-auto  ">
              <VenueSelect
                organizationId={selectedOrgId || ctxOrg?.id || user?.organization}
                // organizationId={selectedOrgId || user?.organization}
                value={selectedVenueId}
                onChange={onVenueChange}
                className=""
                excludeFirstN={user?.role === "user" ? 3 : 0}
                externalLabel={ctxVenue?.name}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <div className="freezer-cards-container custom-scrollbar">
              {(isInitialDevicesLoad || isContextChanging) ? (
                <div className="freezer-cards-grid freezer-cards-container">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <DeviceSkeleton key={index} />
                  ))}
                </div>
              ) : freezerDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#64748B]">
                  <svg className="w-16 h-16 mb-4 text-[#E2E8F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-lg font-medium">No Freezer Devices Found</p>
                  <p className="text-sm">Add some freezer devices to get started</p>
                </div>
              ) : (
                <div className="freezer-cards-grid freezer-cards-container">
                  {freezerDevices.map((device) => {
                    const idKey = device._id ?? device.id ?? device.deviceId;
                    const influxKey = String(device.deviceId);
                    const isOnline = (device.deviceType === "TSD" || device.deviceType === "ESD")
                      ? Boolean(schedulerDeviceOnlineMap[influxKey])
                      : Boolean(deviceOnlineMap[influxKey]);
                    const lastUpdateISO = deviceLastUpdateMap[influxKey] || null;

                    // Debug logging for TSD/ESD devices
                    if (device.deviceType === "TSD" || device.deviceType === "ESD") {
                      console.log(`🎯 Rendering ${device.deviceType} device ${influxKey}:`, {
                        deviceType: device.deviceType,
                        influxKey,
                        schedulerDeviceOnlineMap,
                        valueInMap: schedulerDeviceOnlineMap[influxKey],
                        isOnline,
                      });
                    }

                    const commonProps = {
                      // key: idKey,
                      deviceId: device.deviceId,
                      ambientTemperature: device?.AmbientData?.temperature ?? device.ambientTemperature,
                      freezerTemperature: device?.FreezerData?.temperature ?? device.freezerTemperature,
                      onCardSelect: () => handleFreezerDeviceSelect(idKey),
                      isSelected: String(idKey) === String(selectedFreezerDeviceId),
                      espHumidity: device?.espHumidity,
                      espTemprature: device?.espTemprature,
                      temperatureAlert: device?.temperatureAlert,
                      humidityAlert: device?.humidityAlert,
                      odourAlert: device?.odourAlert,
                      espOdour: device?.espOdour,
                      isOnline,
                      lastUpdateISO,
                    };

                    if (device?.deviceType === "AQIMD") {
                      return <AQIDeviceCard key={idKey} {...commonProps} espAQI={device?.espAQI} aqiAlert={device?.aqiAlert} />;
                    }

                    if (device?.deviceType === "TMD") {
                      return <TemperatureHumidityDeviceCard key={idKey} {...commonProps} pollHitTime={pollHitTime} />;
                    }

                    if (device?.deviceType === "OMD") {
                      return <OdourDeviceCard key={idKey} {...commonProps} espOdour={device?.espOdour} odourAlert={device?.odourAlert} />;
                    }

                    if (device?.deviceType === "GLMD") {
                      return <GasLeakageDeviceCard key={idKey} {...commonProps} espGL={device?.espGL} glAlert={device?.glAlert} />;
                    }

                    if (device?.deviceType === "EMD") {
                      return (
                        <EnergyMonitoringDeviceCard
                          key={idKey}
                          {...commonProps}
                          espVoltage={device?.espVoltage}
                          espCurrent={device?.espCurrent}
                          espPower={device?.espPower}
                          espHumidity={device?.espHumidity}
                          espTemprature={device?.espTemprature}
                        />
                      );
                    }



                    //FaRaZ
                    // if (device?.deviceType === "SCHEDULER") {
                    if (device?.deviceType === "TSD") {
                      const idStr = String(idKey);                        // keep for card key/selection
                      const schedulerKey = String(device.deviceId);       // ← use deviceId for context
                      return (
                        <SchedulerDeviceCard
                          key={idKey}
                          {...commonProps}
                          startingOn={device?.scheduler?.startingOn}
                          duration={device?.scheduler?.duration}
                          repeatDays={device?.scheduler?.repeatDays || []}
                          enabled={device?.scheduler?.enabled}
                          pollHitTime={pollHitTime}
                          events={eventsMap[schedulerKey] || []}
                          onRefreshScheduler={fetchSchedulerData}
                        />
                      );
                    }


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
                  })}
                </div>
              )}
            </div>
          </div>

          <AlertsPanel organizationId={selectedOrgId} pollInterval={POLL_MS} />
        </>
      </div>

      {isDesktop ? (
        <DashboardRightPanel
          freezerDevices={freezerDevices}
          selectedFreezerDeviceId={selectedFreezerDeviceId}
          selectedOrgId={selectedOrgId}
          pollInterval={POLL_MS}
          schedulerDeviceOnlineMap={schedulerDeviceOnlineMap}
          deviceOnlineMap={deviceOnlineMap}
        />
      ) : (
        <Drawer open={open} onClose={toggleDrawer(false)} anchor="right" PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "100vw",
          },
        }}
        >
          <DashboardRightPanel
            freezerDevices={freezerDevices}
            selectedFreezerDeviceId={selectedFreezerDeviceId}
            selectedOrgId={selectedOrgId}
            closeIcon={true}
            onClose={toggleDrawer(false)}
            pollInterval={POLL_MS}
            schedulerDeviceOnlineMap={schedulerDeviceOnlineMap}
            deviceOnlineMap={deviceOnlineMap}
          />
        </Drawer>
      )}
    </div>
  );
}

