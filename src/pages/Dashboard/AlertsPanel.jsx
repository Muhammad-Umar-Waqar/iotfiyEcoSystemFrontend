// src/pages/Dashboard/AlertsPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AlertList from "./AlertList";
import { useStore } from "../../contexts/storecontexts";
import { fetchAlertsByOrg } from "../../slices/alertsSlice";

export default function AlertsPanel({ organizationId = null, pollInterval = null }) {
  const dispatch = useDispatch();
  const { user, getToken } = useStore();
  const token = getToken();
  const orgId = organizationId || user?.organization || null;

  const orgAlerts = useSelector((s) =>
    orgId ? s.alerts?.byOrg?.[orgId] ?? { venues: [], loading: false, error: null } : { venues: [], loading: false, error: null }
  );

  useEffect(() => {
    if (!orgId) return;
    dispatch(fetchAlertsByOrg(orgId));
  }, [orgId, dispatch]);

  useEffect(() => {
    if (!orgId || !pollInterval) return;
    const id = setInterval(() => {
      dispatch(fetchAlertsByOrg(orgId));
    }, pollInterval);
    return () => clearInterval(id);
  }, [orgId, pollInterval, dispatch]);

  const venues = orgAlerts?.venues || [];

  const odourItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.odourAlertCount || 0,
    nestedItems: (v.odourAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  const temperatureItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.temperatureAlertCount || 0,
    nestedItems: (v.temperatureAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  const humidityItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.humidityAlertCount || 0,
    nestedItems: (v.humidityAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  const aqiItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.aqiAlertCount || 0,
    nestedItems: (v.aqiAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  const glItems = venues.map((v) => ({
    id: v.venueId,
    name: v.venueName,
    devices: v.glAlertCount || 0,
    nestedItems: (v.glAlertDevices || []).map((d) => ({ id: d.id, name: d.name, date: d.date })),
  }));

  const alertCards = useMemo(
    () => [
      { key: "odour", title: "Odour Alert", icon: "/odour-alert.svg", items: odourItems },
      { key: "temperature", title: "Temperature Alert", icon: "/temperature.svg", items: temperatureItems },
      { key: "humidity", title: "Humidity Alert", icon: "/humidity-alert.svg", items: humidityItems },
      { key: "aqi", title: "AQI Alert", icon: "/wind.svg", items: aqiItems },
      { key: "gl", title: "Leakage Alert", icon: "/zap.svg", items: glItems },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgAlerts]
  );

  const isMobile = useMediaQuery("(max-width:767px)");
  const visibleCount = isMobile ? 1 : 2;

  // carousel index (only used for desktop)
  const [startIndex, setStartIndex] = useState(0);

  // keep startIndex valid if length/visible changes
  useEffect(() => {
    if (startIndex > Math.max(0, alertCards.length - visibleCount)) {
      setStartIndex(Math.max(0, alertCards.length - visibleCount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertCards.length, visibleCount]);

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

  return (
    <div className="flex-shrink-0 mb-16 md:mb-auto">
      {/* Header area */}
      {!isMobile ? (
        // Desktop header: only arrows aligned to right (no chips / names)
        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mb={2}>
          <IconButton size="small" onClick={prev} disabled={!canNavigate}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={next} disabled={!canNavigate}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : null}

      {/* Content */}
      {isMobile ? (
        // MOBILE: horizontal swipeable slider (no arrows/chips)
        <Box
          component="div"
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            // px: 2, // horizontal padding so cards have breathing room
            pb: 1,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            // hide scrollbar where possible
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            // ensure touch pan is horizontal
            touchAction: "pan-x",
          }}
        >
          {alertCards.map((card) => (
            <Box
              key={card.key}
              sx={{
                // Each card takes almost the full viewport width minus container padding.
                // This prevents half-cut cards and provides a nice peek on sides.
                flex: "0 0 calc(100% - 32px)",
                maxWidth: "calc(100% - 32px)",
                scrollSnapAlign: "center",
                backgroundColor: "#07518D12",
                borderRadius: "20px",
                p: 2,
                boxSizing: "border-box",
                boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
                // ensure the inner AlertList can shrink properly
                "& > .alert-list-wrapper": {
                  width: "100%",
                  minWidth: 0,
                },
              }}
            >
              {/* wrapper class ensures AlertList gets width:100% and minWidth:0 */}
              <div className="alert-list-wrapper">
                <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
              </div>
            </Box>
          ))}
        </Box>
      ) : (
        // DESKTOP: show grid of visibleDesktop items (2), with same card styling
        <Box display="grid" gridTemplateColumns={`repeat(${visibleDesktop.length}, 1fr)`} gap={6}>
          {visibleDesktop.map((card) => (
            <Box key={card.key} className="p-2 md:p-4" sx={{ backgroundColor: "#07518D12", borderRadius: "20px" }}>
              <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
}
