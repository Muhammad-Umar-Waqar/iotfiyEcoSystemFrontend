// src/pages/Dashboard/AlertsPanel.jsx
import { useEffect, useState, useMemo } from "react";
import { Select, MenuItem, FormControl, Box, IconButton, useMediaQuery } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import axios from "axios";
import AlertList from "./AlertList";

export default function AlertsPanel({
  venueId = null,
  organizationId = null,
  deviceDataMap = {},
}) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" or "types"
  const [startIndex, setStartIndex] = useState(0); // Carousel index for Alert Type view

  const isMobile = useMediaQuery("(max-width:767px)");
  const visibleCount = isMobile ? 1 : 2;

  // Fetch alerts based on viewMode
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);

        if (viewMode === "all") {
          // View 1: All Device Alerts - VENUE API
          if (!venueId) {
            console.log("⚠️ [AlertsPanel] No venueId for 'all' view");
            return;
          }

          const apiUrl = `${import.meta.env.VITE_API_URL}/alerts/by-venue/${venueId}`;
          console.log("📡 [AlertsPanel - All Devices] Fetching:", apiUrl);

          const res = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          console.log("✅ [AlertsPanel - All Devices] Response:", res.data);
          setApiData(res.data);

        } else {
          // View 2: Alert Type Alerts - ORGANIZATION API
          if (!organizationId) {
            console.log("⚠️ [AlertsPanel] No organizationId for 'types' view");
            return;
          }

          const apiUrl = `${import.meta.env.VITE_API_URL}/alerts/by-org/${organizationId}`;
          console.log("📡 [AlertsPanel - Alert Types] Fetching:", apiUrl);

          const res = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          console.log("✅ [AlertsPanel - Alert Types] Response:", res.data);
          setApiData(res.data);
        }
      } catch (err) {
        console.error("❌ [AlertsPanel] Failed to fetch alerts:", err);
        setApiData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [viewMode, venueId, organizationId]); // Refetch when viewMode OR IDs change

  // Merge WebSocket data (for View 1: All Device Alerts)
  const mergedVenueAlerts = useMemo(() => {
    if (viewMode !== "all" || !apiData?.alerts) return [];

    console.log(`🔄 [AlertsPanel] Merging venue alerts with WebSocket`);

    return apiData.alerts.map((apiDevice) => {
      const wsData = deviceDataMap[apiDevice.deviceId];

      if (wsData && wsData.alerts && wsData.alerts.length > 0) {
        console.log(`✅ WebSocket data for ${apiDevice.deviceId}`);
        return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
      }

      console.log(`📡 API data for ${apiDevice.deviceId}`);
      return { ...apiDevice, source: "api" };
    });
  }, [viewMode, apiData, deviceDataMap]);

  // Merge WebSocket data (for View 2: Alert Type Alerts - Organization)
  const mergedOrgAlerts = useMemo(() => {
    if (viewMode !== "types" || !apiData?.alerts) return [];

    console.log(`🔄 [AlertsPanel] Merging org alerts with WebSocket`);

    return apiData.alerts.map((apiDevice) => {
      const wsData = deviceDataMap[apiDevice.deviceId];

      if (wsData && wsData.alerts && wsData.alerts.length > 0) {
        return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
      }

      return { ...apiDevice, source: "api" };
    });
  }, [viewMode, apiData, deviceDataMap]);

  // Group by alert type for View 2
  const alertsByType = useMemo(() => {
    const groups = {
      temperature: [],
      humidity: [],
      odour: [],
      AQI: [],
      gass: [],
    };

    mergedOrgAlerts.forEach((device) => {
      device.activeAlerts?.forEach((alert) => {
        if (groups[alert.type]) {
          groups[alert.type].push({
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            venue: device.venue,
            value: alert.value,
          });
        }
      });
    });

    return groups;
  }, [mergedOrgAlerts]);

  // Transform alerts by type into venue-grouped format for AlertList
  const alertCards = useMemo(() => {
    // Group devices by venue for each alert type
    const groupByVenue = (devices) => {
      const venueMap = {};
      devices.forEach((device) => {
        const venueId = device.venue?.id || "unknown";
        const venueName = device.venue?.name || "Unknown Venue";

        if (!venueMap[venueId]) {
          venueMap[venueId] = {
            id: venueId,
            name: venueName,
            devices: 0,
            nestedItems: [],
          };
        }

        venueMap[venueId].devices += 1;
        venueMap[venueId].nestedItems.push({
          id: device.deviceId,
          name: device.deviceName || device.deviceId,
          date: device.value !== null ? `${device.value}` : "--",
        });
      });

      return Object.values(venueMap);
    };

    return [
      {
        key: "odour",
        title: "Odour Alert",
        icon: "/odour-alert.svg",
        items: groupByVenue(alertsByType.odour || []),
      },
      {
        key: "temperature",
        title: "Temperature Alert",
        icon: "/temperature-icon.svg",
        items: groupByVenue(alertsByType.temperature || []),
      },
      {
        key: "humidity",
        title: "Humidity Alert",
        icon: "/humidity-alert.svg",
        items: groupByVenue(alertsByType.humidity || []),
      },
      {
        key: "aqi",
        title: "AQI Alert",
        icon: "/windy-icon-greed.svg",
        items: groupByVenue(alertsByType.AQI || []),
      },
      {
        key: "gass",
        title: "Gas Leakage Alert",
        icon: "/alert-icon.png",
        items: groupByVenue(alertsByType.gass || []),
      },
    ];
  }, [alertsByType]);

  // Keep startIndex valid if length/visible changes
  useEffect(() => {
    if (startIndex > Math.max(0, alertCards.length - visibleCount)) {
      setStartIndex(Math.max(0, alertCards.length - visibleCount));
    }
  }, [alertCards.length, visibleCount, startIndex]);

  // Carousel navigation
  const canNavigate = alertCards.length > visibleCount;

  const prev = () => {
    if (!canNavigate) return;
    const nextIndex = (startIndex - visibleCount + alertCards.length) % alertCards.length;
    setStartIndex(nextIndex);
  };

  const next = () => {
    if (!canNavigate) return;
    const nextIndex = (startIndex + visibleCount) % alertCards.length;
    setStartIndex(nextIndex);
  };

  const getVisibleDesktop = () => {
    if (alertCards.length <= visibleCount) return alertCards;
    const out = [];
    for (let i = 0; i < visibleCount; i += 1) {
      const idx = (startIndex + i) % alertCards.length;
      out.push(alertCards[idx]);
    }
    return out;
  };

  const visibleDesktop = getVisibleDesktop();

  const alertTypes = [
    { key: "odour", label: "Odour Alert", icon: "/odour-alert.svg", color: "#EF4444", unit: "%" },
    { key: "temperature", label: "Temperature Alert", icon: "/temperature-icon.svg", color: "#F97316", unit: "°C" },
    { key: "humidity", label: "Humidity Alert", icon: "/humidity-alert.svg", color: "#3B82F6", unit: "%" },
    { key: "AQI", label: "AQI Alert", icon: "/windy-icon-greed.svg", color: "#8B5CF6", unit: "" },
    { key: "gass", label: "Gas Leakage Alert", icon: "/alert-icon.png", color: "#EAB308", unit: "%" },
  ];

  return (
    <div className="flex-shrink-0 mb-8">
      {/* View Mode Selector */}
      <div className="flex justify-end mb-4">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            sx={{
              backgroundColor: "white",
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
            }}
          >
            <MenuItem value="all">All Device Alerts</MenuItem>
            <MenuItem value="types">Alert Type Alerts</MenuItem>
          </Select>
        </FormControl>
      </div>

      {viewMode === "all" ? (
        /* VIEW 1: All Device Alerts - Simple List (Venue API) */
        <div className="p-6 rounded-2xl" style={{ backgroundColor: "#07518D12" }}>
          <div className="flex items-center justify-center mb-4 gap-2">
            <img src="/alert-icon.png" alt="Alerts" className="w-6 h-6" />
            <h3 className="font-semibold text-[#1E40AF] text-lg">All Device Alerts</h3>
          </div>

          <div className="h-0.5 w-full mb-4" style={{ backgroundColor: "#07518D" }} />

          <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
            {mergedVenueAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                🎉 No alerts - All devices operating normally
              </div>
            ) : (
              mergedVenueAlerts.map((device) => (
                <div key={device.deviceId} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-base font-bold text-gray-800">
                        {device.deviceName || device.deviceId}
                      </div>
                      <div className="text-sm text-gray-500">{device.deviceType}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {device.source === "websocket" ? "🔴 Live" : "📡 API"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {device.activeAlerts?.map((alert, idx) => {
                      const alertType = alertTypes.find((t) => t.key === alert.type);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: alertType ? `${alertType.color}15` : "#F3F4F6",
                            color: alertType?.color || "#6B7280",
                          }}
                        >
                          <span className="capitalize">{alert.type}</span>
                          <span className="font-bold">
                            {alert.value !== null ? `${alert.value}${alertType?.unit || ""}` : "--"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* VIEW 2: Alert Type Alerts - Carousel (Organization API) */
        <div className="flex-shrink-0 mb-16 md:mb-auto">
          {/* Desktop: Header with arrows */}
          {!isMobile && (
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mb={2}>
              <IconButton size="small" onClick={prev} disabled={!canNavigate}>
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={next} disabled={!canNavigate}>
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Mobile: Horizontal scrollable cards */}
          {isMobile ? (
            <Box
              component="div"
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                touchAction: "pan-x",
              }}
            >
              {alertCards.map((card) => (
                <Box
                  key={card.key}
                  sx={{
                    flex: "0 0 calc(100% - 32px)",
                    maxWidth: "calc(100% - 32px)",
                    scrollSnapAlign: "center",
                    backgroundColor: "#07518D12",
                    borderRadius: "20px",
                    p: 2,
                    boxSizing: "border-box",
                    boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                    "& > .alert-list-wrapper": {
                      width: "100%",
                      minWidth: 0,
                    },
                  }}
                >
                  <div className="alert-list-wrapper">
                    <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
                  </div>
                </Box>
              ))}
            </Box>
          ) : (
            /* Desktop: Grid of 2 visible cards - Side by Side */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
                width: "100%"
              }}
            >
              {visibleDesktop.map((card) => (
                <Box
                  key={card.key}
                  sx={{
                    backgroundColor: "#07518D12",
                    borderRadius: "20px",
                    padding: { xs: "8px", md: "16px" }
                  }}
                >
                  <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
                </Box>
              ))}
            </Box>
          )}
        </div>
      )}
    </div>
  );
}
