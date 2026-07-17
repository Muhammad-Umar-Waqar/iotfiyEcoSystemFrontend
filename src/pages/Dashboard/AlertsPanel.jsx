// // src/pages/Dashboard/AlertsPanel.jsx
// import { useEffect, useState, useMemo } from "react";
// import {
//   Select,
//   MenuItem,
//   FormControl,
//   Box,
//   IconButton,
//   Tooltip,
//   Fade,
//   useMediaQuery,
// } from "@mui/material";
// import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
// import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip as RechartsTooltip,
//   Cell,
//   CartesianGrid,
// } from "recharts";
// import axios from "axios";
// import AlertList from "./AlertList";

// const ALERT_TYPES = [
//   { key: "odour", label: "Odour Alert", short: "Odour", icon: "/odour-alert.svg", color: "#EF4444", unit: "%" },
//   { key: "temperature", label: "Temperature Alert", short: "Temp", icon: "/temperature-icon.svg", color: "#F97316", unit: "°C" },
//   { key: "humidity", label: "Humidity Alert", short: "Humidity", icon: "/humidity-alert.svg", color: "#3B82F6", unit: "%" },
//   { key: "AQI", label: "AQI Alert", short: "AQI", icon: "/windy-icon-greed.svg", color: "#8B5CF6", unit: "" },
//   { key: "gass", label: "Gas Leakage Alert", short: "Gas", icon: "/alert-icon.png", color: "#EAB308", unit: "%" },
// ];

// function AllDeviceAlertsChart({ data }) {
//   const hasData = data.some((d) => d.value > 0);

//   if (!hasData) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
//         <BarChartRoundedIcon sx={{ fontSize: 40, color: "#93C5FD", mb: 1 }} />
//         No active alerts to chart
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart
//           data={data}
//           margin={{ top: 12, right: 8, left: -8, bottom: 4 }}
//           barCategoryGap="28%"
//         >
//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//           <XAxis
//             dataKey="short"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
//           />
//           <YAxis
//             allowDecimals={false}
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: "#9CA3AF", fontSize: 11 }}
//             width={28}
//           />
//           <RechartsTooltip
//             cursor={{ fill: "rgba(7, 81, 141, 0.06)" }}
//             contentStyle={{
//               borderRadius: 10,
//               border: "1px solid #E5E7EB",
//               boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
//               fontSize: 13,
//             }}
//             formatter={(value) => [`${value}`, "Alerts"]}
//             labelFormatter={(label) => `${label} Alert`}
//           />
//           <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={44}>
//             {data.map((entry) => (
//               <Cell key={entry.key} fill={entry.color} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>

//       <div className="flex flex-wrap justify-center gap-3 mt-2 px-1">
//         {data.map((d) => (
//           <div key={d.key} className="flex items-center gap-1.5 text-xs text-gray-600">
//             <span
//               className="inline-block w-2.5 h-2.5 rounded-full"
//               style={{ backgroundColor: d.color }}
//             />
//             <span className="font-medium">{d.short}</span>
//             <span className="text-gray-400">({d.value})</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function AlertsPanel({
//   venueId = null,
//   organizationId = null,
//   deviceDataMap = {},
// }) {
//   const [apiData, setApiData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState("all"); // "all" or "types"
//   const [displayMode, setDisplayMode] = useState("list"); // "list" or "chart" (All Device Alerts only)
//   const [startIndex, setStartIndex] = useState(0);

//   const isMobile = useMediaQuery("(max-width:767px)");
//   const visibleCount = isMobile ? 1 : 2;

//   // Fetch alerts based on viewMode
//   useEffect(() => {
//     const fetchAlerts = async () => {
//       try {
//         setLoading(true);

//         if (viewMode === "all") {
//           // View 1: All Device Alerts - VENUE API
//           if (!venueId) {
//             console.log("⚠️ [AlertsPanel] No venueId for 'all' view");
//             return;
//           }

//           const apiUrl = `${import.meta.env.VITE_API_URL}/alerts/by-venue/${venueId}`;
//           console.log("📡 [AlertsPanel - All Devices] Fetching:", apiUrl);

//           const res = await axios.get(apiUrl, {
//             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//           });

//           console.log("✅ [AlertsPanel - All Devices] Response:", res.data);
//           setApiData(res.data);

//         } else {
//           // View 2: Alert Type Alerts - ORGANIZATION API
//           if (!organizationId) {
//             console.log("⚠️ [AlertsPanel] No organizationId for 'types' view");
//             return;
//           }

//           const apiUrl = `${import.meta.env.VITE_API_URL}/alerts/by-org/${organizationId}`;
//           console.log("📡 [AlertsPanel - Alert Types] Fetching:", apiUrl);

//           const res = await axios.get(apiUrl, {
//             headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//           });

//           console.log("✅ [AlertsPanel - Alert Types] Response:", res.data);
//           setApiData(res.data);
//         }
//       } catch (err) {
//         console.error("❌ [AlertsPanel] Failed to fetch alerts:", err);
//         setApiData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAlerts();
//   }, [viewMode, venueId, organizationId]); // Refetch when viewMode OR IDs change

//   // Merge WebSocket data (for View 1: All Device Alerts)
//   const mergedVenueAlerts = useMemo(() => {
//     if (viewMode !== "all" || !apiData?.alerts) return [];

//     console.log(`🔄 [AlertsPanel] Merging venue alerts with WebSocket`);

//     return apiData.alerts.map((apiDevice) => {
//       const wsData = deviceDataMap[apiDevice.deviceId];

//       if (wsData && wsData.alerts && wsData.alerts.length > 0) {
//         console.log(`✅ WebSocket data for ${apiDevice.deviceId}`);
//         return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
//       }

//       console.log(`📡 API data for ${apiDevice.deviceId}`);
//       return { ...apiDevice, source: "api" };
//     });
//   }, [viewMode, apiData, deviceDataMap]);

//   // Merge WebSocket data (for View 2: Alert Type Alerts - Organization)
//   const mergedOrgAlerts = useMemo(() => {
//     if (viewMode !== "types" || !apiData?.alerts) return [];

//     console.log(`🔄 [AlertsPanel] Merging org alerts with WebSocket`);

//     return apiData.alerts.map((apiDevice) => {
//       const wsData = deviceDataMap[apiDevice.deviceId];

//       if (wsData && wsData.alerts && wsData.alerts.length > 0) {
//         return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
//       }

//       return { ...apiDevice, source: "api" };
//     });
//   }, [viewMode, apiData, deviceDataMap]);

//   // Chart data: active alert counts grouped by type (All Device Alerts)
//   const alertCountByType = useMemo(() => {
//     const counts = Object.fromEntries(ALERT_TYPES.map((t) => [t.key, 0]));

//     mergedVenueAlerts.forEach((device) => {
//       device.activeAlerts?.forEach((alert) => {
//         if (counts[alert.type] !== undefined) {
//           counts[alert.type] += 1;
//         }
//       });
//     });

//     return ALERT_TYPES.map((t) => ({
//       key: t.key,
//       short: t.short,
//       name: t.label,
//       value: counts[t.key],
//       color: t.color,
//     }));
//   }, [mergedVenueAlerts]);

//   const alertsByType = useMemo(() => {
//     const groups = {
//       temperature: [],
//       humidity: [],
//       odour: [],
//       AQI: [],
//       gass: [],
//     };

//     mergedOrgAlerts.forEach((device) => {
//       device.activeAlerts?.forEach((alert) => {
//         if (groups[alert.type]) {
//           groups[alert.type].push({
//             deviceId: device.deviceId,
//             deviceName: device.deviceName,
//             deviceType: device.deviceType,
//             venue: device.venue,
//             value: alert.value,
//           });
//         }
//       });
//     });

//     return groups;
//   }, [mergedOrgAlerts]);

//   const alertCards = useMemo(() => {
//     const groupByVenue = (devices) => {
//       const venueMap = {};
//       devices.forEach((device) => {
//         const venueId = device.venue?.id || "unknown";
//         const venueName = device.venue?.name || "Unknown Venue";

//         if (!venueMap[venueId]) {
//           venueMap[venueId] = {
//             id: venueId,
//             name: venueName,
//             devices: 0,
//             nestedItems: [],
//           };
//         }

//         venueMap[venueId].devices += 1;
//         venueMap[venueId].nestedItems.push({
//           id: device.deviceId,
//           name: device.deviceName || device.deviceId,
//           date: device.value !== null ? `${device.value}` : "--",
//         });
//       });

//       return Object.values(venueMap);
//     };

//     return [
//       {
//         key: "odour",
//         title: "Odour Alert",
//         icon: "/odour-alert.svg",
//         items: groupByVenue(alertsByType.odour || []),
//       },
//       {
//         key: "temperature",
//         title: "Temperature Alert",
//         icon: "/temperature-icon.svg",
//         items: groupByVenue(alertsByType.temperature || []),
//       },
//       {
//         key: "humidity",
//         title: "Humidity Alert",
//         icon: "/humidity-alert.svg",
//         items: groupByVenue(alertsByType.humidity || []),
//       },
//       {
//         key: "aqi",
//         title: "AQI Alert",
//         icon: "/windy-icon-greed.svg",
//         items: groupByVenue(alertsByType.AQI || []),
//       },
//       {
//         key: "gass",
//         title: "Gas Leakage Alert",
//         icon: "/alert-icon.png",
//         items: groupByVenue(alertsByType.gass || []),
//       },
//     ];
//   }, [alertsByType]);

//   useEffect(() => {
//     if (startIndex > Math.max(0, alertCards.length - visibleCount)) {
//       setStartIndex(Math.max(0, alertCards.length - visibleCount));
//     }
//   }, [alertCards.length, visibleCount, startIndex]);

//   const canNavigate = alertCards.length > visibleCount;

//   const prev = () => {
//     if (!canNavigate) return;
//     setStartIndex((startIndex - visibleCount + alertCards.length) % alertCards.length);
//   };

//   const next = () => {
//     if (!canNavigate) return;
//     setStartIndex((startIndex + visibleCount) % alertCards.length);
//   };

//   const getVisibleDesktop = () => {
//     if (alertCards.length <= visibleCount) return alertCards;
//     const out = [];
//     for (let i = 0; i < visibleCount; i += 1) {
//       out.push(alertCards[(startIndex + i) % alertCards.length]);
//     }
//     return out;
//   };

//   const visibleDesktop = getVisibleDesktop();

//   const handleViewModeChange = (e) => {
//     const next = e.target.value;
//     setViewMode(next);
//     if (next !== "all") setDisplayMode("list");
//   };

//   const toggleDisplayMode = () => {
//     setDisplayMode((prev) => (prev === "list" ? "chart" : "list"));
//   };

//   const renderAlertsList = (scrollClassName = "") => (
//     <div className={`space-y-3 custom-scrollbar pr-2 ${scrollClassName}`}>
//       {mergedVenueAlerts.length === 0 ? (
//         <div className="text-center py-8 text-gray-500 text-sm">
//           🎉 No alerts - All devices operating normally
//         </div>
//       ) : (
//         mergedVenueAlerts.map((device) => (
//           <div
//             key={device.deviceId}
//             className="p-4 bg-white rounded-lg shadow-sm border border-gray-100"
//           >
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <div className="text-base font-bold text-gray-800">
//                   {device.deviceName || device.deviceId}
//                 </div>
//                 <div className="text-sm text-gray-500">{device.deviceType}</div>
//               </div>
//               <div className="text-xs text-gray-400">
//                 {device.source === "websocket" ? "🔴 Live" : "📡 API"}
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {device.activeAlerts?.map((alert, idx) => {
//                 const alertType = ALERT_TYPES.find((t) => t.key === alert.type);
//                 return (
//                   <div
//                     key={idx}
//                     className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
//                     style={{
//                       backgroundColor: alertType ? `${alertType.color}15` : "#F3F4F6",
//                       color: alertType?.color || "#6B7280",
//                     }}
//                   >
//                     <span className="capitalize">{alert.type}</span>
//                     <span className="font-bold">
//                       {alert.value !== null
//                         ? `${alert.value}${alertType?.unit || ""}`
//                         : "--"}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );

//   const alertsChartContent = (
//     <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 h-full flex items-center">
//       <AllDeviceAlertsChart data={alertCountByType} />
//     </div>
//   );

//   return (
//     <div className="flex-shrink-0 mb-8">
//       {/* View Mode Selector + mobile chart toggle (same row) */}
//       <div className="flex items-center justify-end gap-2 mb-4">
//         <FormControl size="small" sx={{ minWidth: isMobile ? 160 : 200, flex: isMobile ? 1 : "unset" }}>
//           <Select
//             value={viewMode}
//             onChange={handleViewModeChange}
//             sx={{
//               backgroundColor: "white",
//               borderRadius: "8px",
//               "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
//             }}
//           >
//             <MenuItem value="all">All Device Alerts</MenuItem>
//             <MenuItem value="types">Alert Type Alerts</MenuItem>
//           </Select>
//         </FormControl>

//         {isMobile && viewMode === "all" && (
//           <Tooltip title={displayMode === "list" ? "Chart view" : "List view"}>
//             <IconButton
//               onClick={toggleDisplayMode}
//               aria-label={displayMode === "list" ? "Switch to chart view" : "Switch to list view"}
//               sx={{
//                 width: 40,
//                 height: 40,
//                 borderRadius: "10px",
//                 backgroundColor: displayMode === "chart" ? "#07518D" : "white",
//                 color: displayMode === "chart" ? "white" : "#07518D",
//                 border: "1px solid",
//                 borderColor: displayMode === "chart" ? "#07518D" : "#E5E7EB",
//                 boxShadow: "0 2px 8px rgba(7, 81, 141, 0.12)",
//                 transition: "all 0.25s ease",
//                 "&:hover": {
//                   backgroundColor: displayMode === "chart" ? "#064575" : "#F0F7FC",
//                   borderColor: "#07518D",
//                 },
//               }}
//             >
//               {displayMode === "list" ? (
//                 <BarChartRoundedIcon fontSize="small" />
//               ) : (
//                 <ViewListRoundedIcon fontSize="small" />
//               )}
//             </IconButton>
//           </Tooltip>
//         )}
//       </div>

//       {viewMode === "all" ? (
//         isMobile ? (
//           /* Mobile: toggle between list and chart */
//           <div className="p-6 rounded-2xl" style={{ backgroundColor: "#07518D12" }}>
//             <div className="flex items-center justify-center mb-4 gap-2">
//               <img src="/alert-icon.png" alt="Alerts" className="w-6 h-6" />
//               <h3 className="font-semibold text-[#1E40AF] text-lg">
//                 {displayMode === "chart" ? "Alert Overview" : "All Device Alerts"}
//               </h3>
//             </div>

//             <div className="h-0.5 w-full mb-4" style={{ backgroundColor: "#07518D" }} />

//             <Box
//               sx={{
//                 position: "relative",
//                 minHeight: displayMode === "chart" ? 300 : 120,
//                 transition: "min-height 0.32s ease",
//               }}
//             >
//               <Fade in={displayMode === "list"} timeout={320} unmountOnExit>
//                 <Box sx={{ width: "100%" }}>
//                   {renderAlertsList("max-h-[50vh] overflow-y-auto")}
//                 </Box>
//               </Fade>

//               <Fade in={displayMode === "chart"} timeout={320} unmountOnExit>
//                 <Box sx={{ width: "100%" }}>{alertsChartContent}</Box>
//               </Fade>
//             </Box>
//           </div>
//         ) : (
//           /* Desktop: equal-height panels; list scrolls when content overflows */
//           <div className="flex flex-row gap-5 items-stretch">
//             <div
//               className="w-[40%] p-6 rounded-2xl flex flex-col h-[450px] overflow-hidden"
//               style={{ backgroundColor: "#07518D12" }}
//             >
//               <div className="flex items-center justify-center mb-4 gap-2 shrink-0">
//                 <img src="/alert-icon.png" alt="Alerts" className="w-6 h-6" />
//                 <h3 className="font-semibold text-[#1E40AF] text-lg">All Device Alerts</h3>
//               </div>
//               <div className="h-0.5 w-full mb-4 shrink-0" style={{ backgroundColor: "#07518D" }} />
//               {renderAlertsList("flex-1 min-h-0 overflow-y-auto")}
//             </div>

//             <div
//               className="w-[60%] p-6 rounded-2xl flex flex-col h-[450px] overflow-hidden"
//               style={{ backgroundColor: "#07518D12" }}
//             >
//               <div className="flex items-center justify-center mb-4 gap-2 shrink-0">
//                 <BarChartRoundedIcon sx={{ color: "#1E40AF" }} />
//                 <h3 className="font-semibold text-[#1E40AF] text-lg">Alert Overview</h3>
//               </div>
//               <div className="h-0.5 w-full mb-4 shrink-0" style={{ backgroundColor: "#07518D" }} />
//               <div className="flex-1 min-h-0">{alertsChartContent}</div>
//             </div>
//           </div>
//         )
//       ) : (
//         <div className="flex-shrink-0 mb-16 md:mb-auto">
//           {!isMobile && (
//             <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} mb={2}>
//               <IconButton size="small" onClick={prev} disabled={!canNavigate}>
//                 <ArrowBackIosNewIcon fontSize="small" />
//               </IconButton>
//               <IconButton size="small" onClick={next} disabled={!canNavigate}>
//                 <ArrowForwardIosIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           )}

//           {isMobile ? (
//             <Box
//               component="div"
//               sx={{
//                 display: "flex",
//                 gap: 2,
//                 overflowX: "auto",
//                 pb: 1,
//                 scrollSnapType: "x mandatory",
//                 WebkitOverflowScrolling: "touch",
//                 "&::-webkit-scrollbar": { display: "none" },
//                 scrollbarWidth: "none",
//                 touchAction: "pan-x",
//               }}
//             >
//               {alertCards.map((card) => (
//                 <Box
//                   key={card.key}
//                   sx={{
//                     flex: "0 0 calc(100% - 32px)",
//                     maxWidth: "calc(100% - 32px)",
//                     scrollSnapAlign: "center",
//                     backgroundColor: "#07518D12",
//                     borderRadius: "20px",
//                     p: 2,
//                     boxSizing: "border-box",
//                     boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
//                     "& > .alert-list-wrapper": {
//                       width: "100%",
//                       minWidth: 0,
//                     },
//                   }}
//                 >
//                   <div className="alert-list-wrapper">
//                     <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
//                   </div>
//                 </Box>
//               ))}
//             </Box>
//           ) : (
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(2, 1fr)",
//                 gap: "24px",
//                 width: "100%",
//               }}
//             >
//               {visibleDesktop.map((card) => (
//                 <Box
//                   key={card.key}
//                   sx={{
//                     backgroundColor: "#07518D12",
//                     borderRadius: "20px",
//                     padding: { xs: "8px", md: "16px" },
//                   }}
//                 >
//                   <AlertList title={card.title} iconSrc={card.icon} items={card.items} />
//                 </Box>
//               ))}
//             </Box>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }





// src/pages/Dashboard/AlertsPanel.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  IconButton,
  Tooltip,
  Fade,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import AlertList from "./AlertList";


const ALERT_TYPES = [
  { key: "odour", label: "Odour Alert", short: "Odour", icon: "/odour-alert.svg", color: "#EF4444", unit: "%" },
  { key: "temperature", label: "Temperature Alert", short: "Temp", icon: "/temperature-icon.svg", color: "#F97316", unit: "°C" },
  { key: "humidity", label: "Humidity Alert", short: "Humidity", icon: "/humidity-alert.svg", color: "#3B82F6", unit: "%" },
  { key: "AQI", label: "AQI Alert", short: "AQI", icon: "/windy-icon-greed.svg", color: "#8B5CF6", unit: "" },
  { key: "gass", label: "Gas Leakage Alert", short: "Gas", icon: "/alert-icon.png", color: "#EAB308", unit: "%" },
];

// function AllDeviceAlertsChart({ data }) {
//   const hasData = data.some((d) => d.value > 0);

//   if (!hasData) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
//         <BarChartRoundedIcon sx={{ fontSize: 40, color: "#93C5FD", mb: 1 }} />
//         No active alerts to chart
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart
//           data={data}
//           margin={{ top: 12, right: 8, left: -8, bottom: 4 }}
//           barCategoryGap="28%"
//         >
//           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//           <XAxis
//             dataKey="short"
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 600 }}
//           />
//           <YAxis
//             allowDecimals={false}
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: "#9CA3AF", fontSize: 11 }}
//             width={28}
//           />
//           <RechartsTooltip
//             cursor={{ fill: "rgba(7, 81, 141, 0.06)" }}
//             contentStyle={{
//               borderRadius: 10,
//               border: "1px solid #E5E7EB",
//               boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
//               fontSize: 13,
//             }}
//             formatter={(value) => [`${value}`, "Alerts"]}
//             labelFormatter={(label) => `${label} Alert`}
//           />
//           <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={44}>
//             {data.map((entry) => (
//               <Cell key={entry.key} fill={entry.color} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>

//       <div className="flex flex-wrap justify-center gap-3 mt-2 px-1">
//         {data.map((d) => (
//           <div key={d.key} className="flex items-center gap-1.5 text-xs text-gray-600">
//             <span
//               className="inline-block w-2.5 h-2.5 rounded-full"
//               style={{ backgroundColor: d.color }}
//             />
//             <span className="font-medium">{d.short}</span>
//             <span className="text-gray-400">({d.value})</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// --- New: polished MUI device card for the "All Device Alerts" list ---



// Custom tick: switches between horizontal / abbreviated / angled based on
// how much horizontal space is actually available per bar, not viewport size.
function CompactAxisTick({ x, y, payload, mode }) {
  const label =
    mode === "abbrev" || mode === "angled"
      ? String(payload.value).slice(0, 4)
      : payload.value;

  if (mode === "angled") {
    return (
      <text
        x={x}
        y={y + 8}
        textAnchor="end"
        fill="#6B7280"
        fontSize={10.5}
        fontWeight={600}
        transform={`rotate(-35, ${x}, ${y + 8})`}
      >
        {label}
      </text>
    );
  }

  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#6B7280" fontSize={11.5} fontWeight={600}>
      {label}
    </text>
  );
}


function AllDeviceAlertsChart({ data }) {
  const containerRef = useRef(null);
  const [mode, setMode] = useState("full"); // "full" | "abbrev" | "angled"

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const decideMode = (width) => {
      const perBar = width / data.length;
      if (perBar >= 70) return "full";
      if (perBar >= 48) return "abbrev";
      return "angled";
    };

    const observer = new ResizeObserver(([entry]) => {
      setMode(decideMode(entry.contentRect.width));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [data.length]);

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
        {/* <BarChartRoundedIcon sx={{ fontSize: 40, color: "#93C5FD", mb: 1 }} />
        No active alerts to chart */}
      </div>
    );
  }

  const chartHeight = mode === "angled" ? 280 : 260;
  const bottomMargin = mode === "angled" ? 28 : 4;

  return (
    <div className="w-full" ref={containerRef}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: -8, bottom: bottomMargin }}
          barCategoryGap="28%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="short"
            axisLine={false}
            tickLine={false}
            interval={0}
            height={mode === "angled" ? 45 : 30}
            tick={<CompactAxisTick mode={mode} />}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            width={28}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(7, 81, 141, 0.06)" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              boxShadow: "0 8px 24px rgba(2,6,23,0.08)",
              fontSize: 13,
            }}
            formatter={(value) => [`${value}`, "Alerts"]}
            labelFormatter={(label) => `${label} Alert`}
          />
          <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={44} activeBar={false}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-3 mt-2 px-1">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="font-medium">{d.short}</span>
            <span className="text-gray-400">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}



function DeviceAlertCard({ device }) {
  const isLive = device.source === "websocket";

  return (
    <div
      className="
        w-full min-w-0 rounded-2xl border border-gray-100 bg-white p-4
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
      "
    >
      {/* Header row */}
      <div className="flex min-w-0 items-center gap-3 mb-3">
        {/* Avatar */}
        <div
          className={`
            flex h-9 w-9 shrink-0 items-center justify-center rounded-full
            ${isLive ? "bg-[#07518D] text-white" : "bg-slate-100 text-slate-500"}
          `}
        >
          <SensorsRoundedIcon sx={{ fontSize: 18 }} />
        </div>

        {/* Name + type — flex-1 + min-w-0 is what lets this shrink instead
            of pushing the card wider when the name is long */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-bold text-gray-800 leading-tight"
            title={device.deviceName || device.deviceId}
          >
            {device.deviceName || device.deviceId}
          </p>
          <p className="truncate text-xs text-gray-500">{device.deviceType}</p>
        </div>

        {/* Live / API status pill */}
        <span
          className={`
            flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold
            ${isLive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}
          `}
        >
          {isLive ? (
            <WifiTetheringRoundedIcon sx={{ fontSize: 13 }} />
          ) : (
            <CloudQueueRoundedIcon sx={{ fontSize: 13 }} />
          )}
          {isLive ? "Live" : "API"}
        </span>
      </div>

      {/* Alert chips */}
      <div className="flex min-w-0 flex-wrap gap-2">
        {device.activeAlerts?.map((alert, idx) => {
          const alertType = ALERT_TYPES.find((t) => t.key === alert.type);
          return (
            <span
              key={idx}
              className="rounded-full px-2 py-1 text-[10.5px] font-medium"
              style={{
                backgroundColor: alertType ? `${alertType.color}15` : "#F3F4F6",
                color: alertType?.color || "#6B7280",
              }}
            >
              <span className="capitalize">{alert.type}</span>{" "}
              <b>
                {alert.value !== null ? `${alert.value}${alertType?.unit || ""}` : "--"}
              </b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function AlertsPanel({
  venueId = null,
  organizationId = null,
  deviceDataMap = {},
}) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" or "types"
  const [displayMode, setDisplayMode] = useState("list"); // "list" or "chart" (All Device Alerts only)
  const [startIndex, setStartIndex] = useState(0);

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
  // FIX: a live socket entry is authoritative even when its alerts array is
  // empty (device just cleared) — previously an empty ws array fell through
  // to stale API data and could show alerts that had already resolved.
  const mergedVenueAlerts = useMemo(() => {
    if (viewMode !== "all" || !apiData?.alerts) return [];

    return apiData.alerts.map((apiDevice) => {
      const wsData = deviceDataMap[apiDevice.deviceId];

      if (wsData && wsData.alerts !== undefined) {
        return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
      }

      return { ...apiDevice, source: "api" };
    });
  }, [viewMode, apiData, deviceDataMap]);

  // Merge WebSocket data (for View 2: Alert Type Alerts - Organization)
  const mergedOrgAlerts = useMemo(() => {
    if (viewMode !== "types" || !apiData?.alerts) return [];

    return apiData.alerts.map((apiDevice) => {
      const wsData = deviceDataMap[apiDevice.deviceId];

      if (wsData && wsData.alerts !== undefined) {
        return { ...apiDevice, activeAlerts: wsData.alerts, source: "websocket" };
      }

      return { ...apiDevice, source: "api" };
    });
  }, [viewMode, apiData, deviceDataMap]);

  // Chart data: active alert counts grouped by type (All Device Alerts)
  // Derived from mergedVenueAlerts, so it automatically inherits the same
  // websocket-first / API-fallback logic as the list — no duplicate logic needed.
  const alertCountByType = useMemo(() => {
    const counts = Object.fromEntries(ALERT_TYPES.map((t) => [t.key, 0]));

    mergedVenueAlerts.forEach((device) => {
      device.activeAlerts?.forEach((alert) => {
        if (counts[alert.type] !== undefined) {
          counts[alert.type] += 1;
        }
      });
    });

    return ALERT_TYPES.map((t) => ({
      key: t.key,
      short: t.short,
      name: t.label,
      value: counts[t.key],
      color: t.color,
    }));
  }, [mergedVenueAlerts]);

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

  const alertCards = useMemo(() => {
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

  useEffect(() => {
    if (startIndex > Math.max(0, alertCards.length - visibleCount)) {
      setStartIndex(Math.max(0, alertCards.length - visibleCount));
    }
  }, [alertCards.length, visibleCount, startIndex]);

  const canNavigate = alertCards.length > visibleCount;

  const prev = () => {
    if (!canNavigate) return;
    setStartIndex((startIndex - visibleCount + alertCards.length) % alertCards.length);
  };

  const next = () => {
    if (!canNavigate) return;
    setStartIndex((startIndex + visibleCount) % alertCards.length);
  };

  const getVisibleDesktop = () => {
    if (alertCards.length <= visibleCount) return alertCards;
    const out = [];
    for (let i = 0; i < visibleCount; i += 1) {
      out.push(alertCards[(startIndex + i) % alertCards.length]);
    }
    return out;
  };

  const visibleDesktop = getVisibleDesktop();

  const handleViewModeChange = (e) => {
    const next = e.target.value;
    setViewMode(next);
    if (next !== "all") setDisplayMode("list");
  };

  const toggleDisplayMode = () => {
    setDisplayMode((prev) => (prev === "list" ? "chart" : "list"));
  };

  const renderAlertsList = (scrollClassName = "") => (
    <Stack spacing={1.25}  className={`pr-1 custom-scrollbar ${scrollClassName}`}>
      {mergedVenueAlerts.length === 0 ? (
        // <Stack alignItems="center" justifyContent="center" py={5} spacing={1} color="text.secondary">
        //   <Typography variant="body2">All devices operating normally</Typography>
        // </Stack>
        <div className="h-full flex items-center justify-center text-center py-4 text-[#64748B] text-sm">
           <CelebrationRoundedIcon sx={{ fontSize: 32, color: "#93C5FD", marginRight: "10px" }} />
          <h4 className="text-md font-semibold text-center"> All devices are operating normally.</h4>
        </div>
      ) : (
        mergedVenueAlerts.map((device) => (
          <DeviceAlertCard key={device.deviceId} device={device} />
        ))
      )}
    </Stack>
  );

  const alertsChartContent = (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 h-full flex items-center">
      <AllDeviceAlertsChart data={alertCountByType} />
    </div>
  );

  return (
    <div className="flex-shrink-0 mb-8">
      {/* View Mode Selector + mobile chart toggle (same row) */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* <FormControl size="small" sx={{ minWidth: isMobile ? 160 : 200, flex: isMobile ? 1 : "unset" }}> */}
        <FormControl
          size="small"
          sx={{
            minWidth: isMobile ? "unset" : 200,
            width: isMobile ? "fit-content" : "auto",
            flex: "none",
          }}
        >
          <Select
            value={viewMode}
            onChange={handleViewModeChange}
            
            sx={{
              width: isMobile ? "fit-content" : "100%",
              backgroundColor: "white",
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" },
              "& .MuiSelect-select": {
                py: 1,
                pr: "32px !important",
                whiteSpace: "nowrap",
              },
            }}
          >
            <MenuItem value="all">All Device Alerts</MenuItem>
            <MenuItem value="types">Alert Type Alerts</MenuItem>
          </Select>
        </FormControl>

        {isMobile && viewMode === "all" && (
          <Tooltip title={displayMode === "list" ? "Chart view" : "List view"}>
            <IconButton
              onClick={toggleDisplayMode}
              aria-label={displayMode === "list" ? "Switch to chart view" : "Switch to list view"}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: displayMode === "chart" ? "#07518D" : "white",
                color: displayMode === "chart" ? "white" : "#07518D",
                border: "1px solid",
                borderColor: displayMode === "chart" ? "#07518D" : "#E5E7EB",
                boxShadow: "0 2px 8px rgba(7, 81, 141, 0.12)",
                transition: "all 0.25s ease",
                "&:hover": {
                  backgroundColor: displayMode === "chart" ? "#064575" : "#F0F7FC",
                  borderColor: "#07518D",
                },
              }}
            >
              {displayMode === "list" ? (
                <BarChartRoundedIcon fontSize="small" />
              ) : (
                <ViewListRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </div>

      {viewMode === "all" ? (
        isMobile ? (
          /* Mobile: toggle between list and chart */
          <div className="p-6 rounded-2xl" style={{ backgroundColor: "#07518D12" }}>
            <div className="flex items-center justify-center mb-4 gap-2">
              <img src="/alert-icon.png" alt="Alerts" className="w-6 h-6" />
              <h3 className="font-semibold text-[#1E40AF] text-lg">
                {displayMode === "chart" ? "Alert Overview" : "All Device Alerts"}
              </h3>
            </div>

            <div className="h-0.5 w-full mb-4" style={{ backgroundColor: "#07518D" }} />

            <Box
              sx={{
                position: "relative",
                minHeight: displayMode === "chart" ? 300 : 120,
                transition: "min-height 0.32s ease",
              }}
            >
              <Fade in={displayMode === "list"} timeout={320} unmountOnExit>
                <Box sx={{ width: "100%" }}>
                  {renderAlertsList("max-h-[50vh] overflow-y-auto")}
                </Box>
              </Fade>

              <Fade in={displayMode === "chart"} timeout={320} unmountOnExit>
                <Box sx={{ width: "100%" }}>{alertsChartContent}</Box>
              </Fade>
            </Box>
          </div>
        ) : (
          /* Desktop: equal-height panels; list scrolls when content overflows */
          <div className="flex flex-row gap-5 items-stretch">
            <div
              className="w-[40%] p-6 rounded-2xl flex flex-col h-[450px] overflow-hidden"
              style={{ backgroundColor: "#07518D12" }}
            >
              <div className="flex items-center justify-center mb-4 gap-2 shrink-0">
                <img src="/alert-icon.png" alt="Alerts" className="w-6 h-6" />
                <h3 className="font-semibold text-[#1E40AF] text-lg">All Device Alerts</h3>
              </div>
              <div className="h-0.5 w-full mb-4 shrink-0" style={{ backgroundColor: "#07518D" }} />
              {renderAlertsList("flex-1 min-h-0 overflow-y-auto")}
            </div>

            <div
              className="w-[60%] p-6 rounded-2xl flex flex-col h-[450px] overflow-hidden"
              style={{ backgroundColor: "#07518D12" }}
            >
              <div className="flex items-center justify-center mb-4 gap-2 shrink-0">
                <BarChartRoundedIcon sx={{ color: "#1E40AF" }} />
                <h3 className="font-semibold text-[#1E40AF] text-lg">Alert Overview</h3>
              </div>
              <div className="h-0.5 w-full mb-4 shrink-0" style={{ backgroundColor: "#07518D" }} />
              <div className="flex-1 min-h-0">{alertsChartContent}</div>
            </div>
          </div>
        )
      ) : (
        <div className="flex-shrink-0 mb-16 md:mb-auto">
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
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "24px",
                width: "100%",
              }}
            >
              {visibleDesktop.map((card) => (
                <Box
                  key={card.key}
                  sx={{
                    backgroundColor: "#07518D12",
                    borderRadius: "20px",
                    padding: { xs: "8px", md: "16px" },
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