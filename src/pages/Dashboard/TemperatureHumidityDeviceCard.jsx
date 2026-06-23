// // import { useEffect, useMemo, useState } from "react";
// // import PropTypes from "prop-types";
// // import { Sun, Sunrise, Sunset, Moon } from "lucide-react";
// // import TemperatureRangeMeter from "./TemperatureRangeMeter";
// // import TruncatedText from "../../components/TruncatedText";

// // export default function TemperatureHumidityDeviceCard({
// //   deviceId,
// //   deviceName,
// //   espTemprature = null,
// //   espHumidity = null,
// //   temperatureAlert = false,
// //   humidityAlert = false,
// //   isSelected = false,
// //   onCardSelect,
// //   lastUpdateTime = null,
// //   isOnline = false,         // NEW
// //   lastUpdateISO = null,

// // }) {
// //   const toNumberOrNull = (v) => {
// //     const n = Number(v);
// //     return Number.isFinite(n) ? n : null;
// //   };

// //   // format last update for title/tooltip
// //   const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
// //   const [now, setNow] = useState(Date.now());


// //   const temp = toNumberOrNull(espTemprature);
// //   const hum = toNumberOrNull(espHumidity);

// //   const hasAnyAlert = temperatureAlert || humidityAlert;


// // useEffect(() => {
// //   const interval = setInterval(() => {
// //     setNow(Date.now());
// //   }, 10 * 60 * 1000);

// //   return () => clearInterval(interval);
// // }, []);

// // const hour = new Date(now).getHours();

// //   // const timeOfDay = "sunset"
// //   const timeOfDay =
// //     hour >= 5 && hour <= 8
// //       ? "sunrise"
// //       : hour >= 9 && hour <= 16
// //         ? "day"
// //         : hour >= 17 && hour <= 19
// //           ? "sunset"
// //           : "night";

// //   const statusColorClass = (hasAlert) =>
// //     hasAlert ? "bg-rose-300" : "bg-emerald-200";

// //   const cardSelectedClass = isSelected ? "shadow-lg transform scale-[1.01]" : "";

// //   return (
// //     <div
// //       onClick={() => onCardSelect && onCardSelect()}
// //       className={`freezer-card-container  relative rounded-4xl bg-white min-h-[160px] p-4 ${cardSelectedClass} cursor-pointer`}
// //     >


// //       {/* top-right status pill */}
// //       <div className="absolute top-0 right-0 flex items-center z-10 ">
// //         <div className={`flex  rounded-bl-2xl ${temperatureAlert ? "bg-rose-100" : "bg-[#DCE8F4]/50"}`} >
// //           <p className="px-2 pr-4 py-1 text-sm text-[#020F24]">Alert</p>
// //           {hasAnyAlert && (
// //             <div className="flex items-center  rounded-xl px-2 py-1">
// //               {temperatureAlert && (
// //                 <img
// //                   src="/temp-alert.svg"
// //                   alt="Temperature Alert"
// //                   className="w-4 h-4"
// //                 />
// //               )}

// //               {humidityAlert && (
// //                 <img
// //                   src="/hum-alert.svg"
// //                   alt="Humidity Alert"
// //                   className="w-4 h-4"
// //                 />
// //               )}
// //             </div>
// //           )}
// //         </div>


// //       </div>



// //       {/* MAIN ROW */}
// //       {/* Use responsive: row on sm+, stack on xs. Prevent unwanted shrinking with flex-shrink-0 and min-w. */}
// //       <div className="flex flex-row h-full justify-between items-start ">
// //         {/* LEFT: icons + meter */}
// //         <div className="h-full flex flex-col justify-between flex-shrink-0 min-w-[140px] w-1/3">


// //           <div title={lastUpdateStr} className="flex flex-col items-start flex-1 min-w-0">
// //             <div className="w-full">
// //               <div className="flex items-center">
// //                 <span
// //                   aria-hidden
// //                   className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
// //                   style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
// //                 />
// //                 <div className="text-xs text-gray-500">Device ID</div>
// //               </div>

// //               <TruncatedText
// //                 text={deviceName}
// //                 className="text-lg font-bold text-gray-900"
// //                 maxLines={1}
// //                 tooltipPlacement="top"
// //               />
// //             </div>
// //           </div>








// //           {/* icons row - force no wrap and don't allow it to push other content */}
// //           <div className="flex items-center justify-start gap-3 mt-2 flex-nowrap overflow-hidden   border-b-2 border-[#C3C1C1] pb-2 ">
// //             <div className={`p-2 rounded-full border ${timeOfDay === "sunrise" ? "border-1 border-gray-600" : "border-transparent"}`}>
// //               <Sunrise size={18} className={`${timeOfDay === "sunrise" ? "text-yellow-600" : "text-gray-500"}`} />
// //             </div>
// //             <div className={`p-2 rounded-full border ${timeOfDay === "day" ? "border-1 border-gray-600" : "border-transparent"}`}>
// //               <Sun size={18} className={`${timeOfDay === "day" ? "text-yellow-500" : "text-gray-500"}`} />
// //             </div>
// //             <div className={`p-2 rounded-full border ${(timeOfDay === "sunset" || timeOfDay === "night") ? "border-1 border-gray-600" : "border-transparent"}`}>
// //               <Sunset size={18} className={`${timeOfDay === "sunset" ? "text-orange-500" : "text-gray-500"}`} />
// //             </div>
// //             {/* <div className={`p-2 rounded-full border ${timeOfDay === "night" ? "border-2" : "border-transparent"}`}>
// //               <Moon size={18} className={`${timeOfDay === "night" ? "text-sky-600" : "text-gray-300"}`} />
// //             </div> */}
// //             {/* <div className="my-2 border-b border-gray-200" /> */}
// //           </div>


// //           <TemperatureRangeMeter value={temp !== null ? Math.round(temp) : 0} />


// //         </div>

// //         {/* CENTER: flex-1 so it takes remaining space and doesn't collapse */}
// //         <div className="h-full flex flex-col justify-around">
// //           {/* top spacing */}
// //           <div />
// //           <div className="h-full flex flex-col items-center justify-around mt-5 ">
// //             <div className="">
// //               <div className="text-sm text-gray-500">Temperature</div>
// //               <div className="text-3xl font-bold">
// //                 {temp !== null ? `${Math.round(temp)}` : "--"}<span className="font-normal">°C</span>
// //               </div>
// //               {/* status bar below temperature */}
// //               <div className=" mt-2">
// //                 <div className="h-2 rounded-full overflow-hidden bg-gray-100">
// //                   {/* <div className={`h-2 ${statusColorClass(temperatureAlert)}`} style={{ width: `${temp !== null ? Math.max(6, Math.min(100, tempKnob)) : 10}%` }} /> */}
// //                   <div className={`h-2 ${statusColorClass(temperatureAlert)}`} />
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="text-right">
// //               <div className="text-sm text-gray-500">Humidity</div>
// //               <div className="text-2xl font-bold">
// //                 {hum !== null ? `${Math.round(hum)}%` : "--"}
// //               </div>
// //               {/* status bar below humidity */}
// //               <div className=" mt-2">
// //                 <div className="h-2 rounded-full overflow-hidden bg-gray-100">
// //                   <div className={`h-2 ${statusColorClass(humidityAlert)}`} />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div />
// //         </div>


// //       </div>
// //     </div>
// //   );
// // }

// // TemperatureHumidityDeviceCard.propTypes = {
// //   deviceId: PropTypes.string,
// //   espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
// //   espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
// //   temperatureAlert: PropTypes.bool,
// //   humidityAlert: PropTypes.bool,
// //   lastUpdateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
// //   onCardSelect: PropTypes.func,
// //   isSelected: PropTypes.bool,
// //   isOnline: PropTypes.bool,
// //   lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
// // };



// import { useEffect, useMemo, useState } from "react";
// import PropTypes from "prop-types";
// import { Sun, Sunrise, Sunset, CalendarDays, TimerIcon } from "lucide-react";
// import TemperatureRangeMeter from "./TemperatureRangeMeter";
// import TruncatedText from "../../components/TruncatedText";
// import PowerToggle from "../../components/PowerToggle";
// import Swal from "sweetalert2";
// import { useScheduler } from "../../contexts/SchedulerContext";

// // ── Helpers ─────────────────────────────────────────────────────
// function formatDuration(duration) {
//   if (duration === undefined || duration === null || duration === "") return "--";
//   const n = Number(duration);
//   if (!Number.isFinite(n)) return String(duration);
//   const hours = Math.floor(n / 60);
//   const mins = n % 60;
//   if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
//   if (hours > 0) return `${hours}h`;
//   return `${mins}m`;
// }

// const convertUTCToLocal = (utcTimeString) => {
//   if (!utcTimeString) return utcTimeString;
//   try {
//     const [hours, minutes] = utcTimeString.split(':').map(Number);
//     const utcDate = new Date();
//     utcDate.setUTCHours(hours, minutes, 0, 0);
//     let localHours = utcDate.getHours();
//     const localMinutes = utcDate.getMinutes();
//     const period = localHours >= 12 ? 'PM' : 'AM';
//     localHours = localHours % 12 || 12;
//     return `${localHours}:${String(localMinutes).padStart(2, '0')} ${period}`;
//   } catch (err) {
//     console.error('Error converting UTC to local:', err);
//     return utcTimeString;
//   }
// };

// export default function TemperatureHumidityDeviceCard({
//   deviceId,
//   deviceName,
//   espTemprature = null,
//   espHumidity = null,
//   temperatureAlert = false,
//   humidityAlert = false,
//   isSelected = false,
//   onCardSelect,
//   lastUpdateTime = null,
//   isOnline = false,
//   lastUpdateISO = null,
//   category = "monitoring", // NEW: Device category
//   events = [], // NEW: For scheduling/trigger
//   onRefreshScheduler, // NEW: For scheduling/trigger
//   interval = null, // NEW: For trigger category
//   deviceState = "OFF", // NEW: WebSocket state
//   scheduleData = null, // NEW: WebSocket schedule data
//   triggeredAlerts = [], // NEW: WebSocket triggered alerts for trigger devices
// }) {
//   const { triggerDevice, triggerDeviceManual, skipEvent, toggleMap, eventsMap } = useScheduler();
//   const [loading, setLoading] = useState(false);
//   const [apiScheduleData, setApiScheduleData] = useState(null);

//   // ✅ Use WebSocket state if available, fallback to context toggleMap
//   const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";

//   const toNumberOrNull = (v) => {
//     const n = Number(v);
//     return Number.isFinite(n) ? n : null;
//   };

//   const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
//   const [now, setNow] = useState(Date.now());

//   const temp = toNumberOrNull(espTemprature);
//   const hum = toNumberOrNull(espHumidity);
//   const hasAnyAlert = temperatureAlert || humidityAlert;

//   useEffect(() => {
//     const intervalTimer = setInterval(() => {
//       setNow(Date.now());
//     }, 10 * 60 * 1000);
//     return () => clearInterval(intervalTimer);
//   }, []);

//   const hour = new Date(now).getHours();
//   const timeOfDay =
//     hour >= 5 && hour <= 8 ? "sunrise"
//     : hour >= 9 && hour <= 16 ? "day"
//     : hour >= 17 && hour <= 19 ? "sunset"
//     : "night";

//   const statusColorClass = (hasAlert) => hasAlert ? "bg-rose-300" : "bg-emerald-200";
//   const cardSelectedClass = isSelected ? "shadow-lg transform scale-[1.01]" : "";

//   const isSchedulingOrTrigger = category === "scheduling" || category === "trigger";

//   // ✅ Fetch schedule data from API as fallback when WebSocket data is not available (scheduling only)
//   useEffect(() => {
//     const fetchScheduleDataFromAPI = async () => {
//       if (category !== "scheduling" || scheduleData) {
//         return;
//       }

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_API_URL}/event/current-next/${deviceId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to fetch schedule data");
//         const data = await response.json();
//         setApiScheduleData(data);
//       } catch (err) {
//         console.error(`❌ [TemperatureHumidityDeviceCard ${deviceId}] API fallback error:`, err);
//         setApiScheduleData(null);
//       }
//     };

//     fetchScheduleDataFromAPI();
//   }, [deviceId, scheduleData, category]);

//   // ✅ Read events from global context
//   const contextEvents = eventsMap?.[deviceId] ?? [];
//   const displayEvents = contextEvents.length > 0 ? contextEvents : events;

//   // ✅ For SCHEDULING: Only check WebSocket data for running event
//   const wsRunningEvent = useMemo(() => {
//     if (category !== "scheduling") return null;
//     if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
//       return scheduleData.event;
//     }
//     return null;
//   }, [scheduleData, category]);

//   // For TRIGGER: Use context events
//   const runningEvent = useMemo(() => {
//     if (!isSchedulingOrTrigger || !displayEvents.length) return null;
//     return displayEvents.find(e => e.type === "CURRENT") || null;
//   }, [displayEvents, isSchedulingOrTrigger]);

//   const nextEvent = useMemo(() => {
//     if (!isSchedulingOrTrigger || !displayEvents.length) return null;
//     return displayEvents.find(e => e.type === "NEXT") || null;
//   }, [displayEvents, isSchedulingOrTrigger]);

//   const displayState = toggleState;
//   const isDisabled = (category === "scheduling" ? !!wsRunningEvent : !!runningEvent) || !isOnline;

//   const handleToggleClick = async (e) => {
//     e.stopPropagation();

//     // ✅ Check if device is online BEFORE making API calls
//     if (!isOnline) {
//       await Swal.fire({
//         title: "Device Offline",
//         html: `
//           <b>${deviceId}</b> is currently offline.<br/>
//           <span style="color:#64748b;font-size:13px">
//             Please ensure the device is connected and try again.
//           </span>
//         `,
//         icon: "error",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#EF4444",
//       });
//       return;
//     }

//     // ✅ For SCHEDULING category: Check WebSocket data ONLY
//     if (category === "scheduling" && wsRunningEvent) {
//       const localStartTime = convertUTCToLocal(wsRunningEvent.startTime);
//       const localEndTime = convertUTCToLocal(wsRunningEvent.endTime);

//       const result = await Swal.fire({
//         title: "Event Currently Running",
//         html: `The <b>${wsRunningEvent.command || "Scheduled"}</b> event is active.<br/>
//                <span style="color:#64748b;font-size:13px">${localStartTime} → ${localEndTime}</span><br/><br/>
//                Do you want to disable this event?`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Disable Event",
//         cancelButtonText: "Close",
//         confirmButtonColor: "#EF4444",
//       });

//       if (result.isConfirmed) {
//         try {
//           setLoading(true);
//           const response = await fetch(
//             `${import.meta.env.VITE_API_URL}/event/${wsRunningEvent._id}/status`,
//             {
//               method: "PATCH",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${localStorage.getItem("token")}`,
//               },
//               body: JSON.stringify({ status: "INACTIVE" }),
//             }
//           );

//           if (!response.ok) {
//             const error = await response.json();
//             throw new Error(error.message || "Failed to disable event");
//           }

//           await response.json();
//           await onRefreshScheduler?.();

//           Swal.fire({
//             icon: "success",
//             title: "Event Disabled",
//             text: "The event has been successfully disabled.",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//         } catch (err) {
//           Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not disable event" });
//         } finally {
//           setLoading(false);
//         }
//       }
//       return;
//     }

//     // ✅ For TRIGGER category: Use existing context logic
//     if (category === "trigger" && runningEvent) {
//       const result = await Swal.fire({
//         title: "Event Currently Running",
//         html: `The <b>${runningEvent.command || "Scheduled"}</b> event is active.<br/>
//                <span style="color:#64748b;font-size:13px">${runningEvent.startTime} → ${runningEvent.endTime}</span><br/><br/>
//                Do you want to disable this event?`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Disable Event",
//         cancelButtonText: "Close",
//         confirmButtonColor: "#EF4444",
//       });

//       if (result.isConfirmed) {
//         try {
//           setLoading(true);
//           await skipEvent(deviceId);
//           await onRefreshScheduler?.();
//         } catch (err) {
//           Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not skip event" });
//         } finally {
//           setLoading(false);
//         }
//       }
//       return;
//     }

//     // Normal toggle
//     const nextAction = toggleState === "on" ? "OFF" : "ON";

//     try {
//       setLoading(true);

//       if (category === "trigger") {
//         // Trigger category: Use PUT /device/manual-trigger/:deviceId with state
//         await triggerDeviceManual(deviceId, nextAction);
//       } else {
//         // Scheduling category: Use POST /event/manual-toggle
//         await triggerDevice(deviceId, nextAction);
//       }
//     } catch (err) {
//       Swal.fire({ icon: "error", title: "Failed", text: err.message || "Command failed" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (time) => {
//     if (!time) return "--:--";
//     const [h, m] = time.split(":").map(Number);
//     const date = new Date();
//     date.setUTCHours(h, m, 0);
//     const localHours = date.getHours();
//     const localMinutes = date.getMinutes();
//     const hour12 = localHours % 12 || 12;
//     const ampm = localHours >= 12 ? "PM" : "AM";
//     return `${String(hour12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")} ${ampm}`;
//   };

//   // ✅ Priority: WebSocket > API Fallback > Context Events
//   const displayEvent = runningEvent || nextEvent;
//   const contextEventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

//   // WebSocket data
//   const wsEvent = scheduleData?.event;
//   const wsEventType = scheduleData?.type;
//   const wsDuration = scheduleData?.totalDurationText;

//   // API fallback data
//   const apiEvent = apiScheduleData?.event;
//   const apiEventType = apiScheduleData?.type;
//   const apiDuration = apiScheduleData?.totalDurationText;

//   // Final values with priority
//   const finalEvent = wsEvent || apiEvent || displayEvent;
//   const finalEventType =
//     (wsEventType && wsEventType !== "NO_EVENT") ? wsEventType :
//     (apiEventType && apiEventType !== "NO_EVENT") ? apiEventType :
//     contextEventType;

//   const displayStart = finalEvent?.startTime ? formatTime(finalEvent.startTime) : "--";
//   const displayDuration =
//     wsDuration ||
//     apiDuration ||
//     (finalEvent?.duration ? formatDuration(finalEvent.duration) : "--");
//   const eventType = finalEventType !== "NO_EVENT" ? finalEventType : "--";

//   return (
//     <div
//       onClick={() => onCardSelect && onCardSelect()}
//       className={`freezer-card-container relative rounded-4xl bg-white min-h-[160px] p-4 ${cardSelectedClass} cursor-pointer`}
//     >
//       {/* top-right status pill - only for monitoring */}
//       {!isSchedulingOrTrigger && (
//         <div className="absolute top-0 right-0 flex items-center z-10">
//           <div className={`flex rounded-bl-2xl ${temperatureAlert ? "bg-rose-100" : "bg-[#DCE8F4]/50"}`}>
//             <p className="px-2 pr-4 py-1 text-sm text-[#020F24]">Alert</p>
//             {hasAnyAlert && (
//               <div className="flex items-center rounded-xl px-2 py-1">
//                 {temperatureAlert && (
//                   <img
//                     src="/temp-alert.svg"
//                     alt="Temperature Alert"
//                     className="w-4 h-4"
//                   />
//                 )}
//                 {humidityAlert && (
//                   <img
//                     src="/hum-alert.svg"
//                     alt="Humidity Alert"
//                     className="w-4 h-4"
//                   />
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* MAIN ROW */}
//       <div className="flex flex-row h-full justify-between items-start">
//         {/* LEFT: icons + meter */}
//         <div className="h-full flex flex-col justify-between flex-shrink-0 min-w-[140px] w-1/3">
//           <div title={lastUpdateStr} className="flex flex-col items-start flex-1 min-w-0">
//             <div className="w-full">
//               <div className="flex items-center">
//                 <span
//                   aria-hidden
//                   className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
//                   style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
//                 />
//                 <div className="text-xs text-gray-500">Device ID</div>
//               </div>

//               <TruncatedText
//                 text={deviceName}
//                 className="text-lg font-bold text-gray-900"
//                 maxLines={1}
//                 tooltipPlacement="top"
//               />
//             </div>
//           </div>

//           {/* icons row */}
//           <div className="flex items-center justify-start gap-3 mt-2 flex-nowrap overflow-hidden border-b-2 border-[#C3C1C1] pb-2">
//             <div className={`p-2 rounded-full border ${timeOfDay === "sunrise" ? "border-1 border-gray-600" : "border-transparent"}`}>
//               <Sunrise size={18} className={`${timeOfDay === "sunrise" ? "text-yellow-600" : "text-gray-500"}`} />
//             </div>
//             <div className={`p-2 rounded-full border ${timeOfDay === "day" ? "border-1 border-gray-600" : "border-transparent"}`}>
//               <Sun size={18} className={`${timeOfDay === "day" ? "text-yellow-500" : "text-gray-500"}`} />
//             </div>
//             <div className={`p-2 rounded-full border ${(timeOfDay === "sunset" || timeOfDay === "night") ? "border-1 border-gray-600" : "border-transparent"}`}>
//               <Sunset size={18} className={`${timeOfDay === "sunset" ? "text-orange-500" : "text-gray-500"}`} />
//             </div>
//           </div>

//           <TemperatureRangeMeter value={temp !== null ? Math.round(temp) : 0} />
//         </div>

//         {/* CENTER/RIGHT: temp/humidity + toggle for scheduling/trigger */}
//         <div className="h-full flex flex-col justify-around">
//           <div />

//           <div className="flex items-start gap-4">
//             <div className="h-full flex flex-col items-center justify-around mt-5">
//               <div className="">
//                 <div className="text-sm text-gray-500">Temperature</div>
//                 <div className="text-3xl font-bold">
//                   {temp !== null ? `${Math.round(temp)}` : "--"}<span className="font-normal">°C</span>
//                 </div>
//                 <div className="mt-2">
//                   <div className="h-2 rounded-full overflow-hidden bg-gray-100">
//                     <div className={`h-2 ${statusColorClass(temperatureAlert)}`} />
//                   </div>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="text-sm text-gray-500">Humidity</div>
//                 <div className="text-2xl font-bold">
//                   {hum !== null ? `${Math.round(hum)}%` : "--"}
//                 </div>
//                 <div className="mt-2">
//                   <div className="h-2 rounded-full overflow-hidden bg-gray-100">
//                     <div className={`h-2 ${statusColorClass(humidityAlert)}`} />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Power Toggle for scheduling/trigger */}
//             {isSchedulingOrTrigger && (
//               <PowerToggle
//                 displayState={displayState}
//                 isLocked={isDisabled}
//                 loading={loading}
//                 onClick={handleToggleClick}
//               />
//             )}
//           </div>

//           <div />
//         </div>
//       </div>

//       {/* Footer: Show different content based on category */}
//       {isSchedulingOrTrigger && (
//         <div className="mt-3 pt-3 border-t border-gray-200">
//           {category === "trigger" ? (
//             // Trigger category: Show interval and triggered alerts from WebSocket
//             <div className="flex items-center justify-between gap-2 w-full">
//               <div className="flex items-center gap-2">
//                 <TimerIcon className="w-5 h-5 text-gray-600" />
//                 <div className="flex flex-col">
//                   <p className="text-xs text-gray-500 font-semibold">Interval</p>
//                   <div className="text-xs font-bold text-[#178D8F]">
//                     {interval !== null && interval !== undefined ? `${interval}s` : "--"}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col items-end">
//                 <p className="text-xs text-gray-500 font-semibold">Triggered Alerts</p>
//                 <div className="text-xs font-bold text-rose-600">
//                   {triggeredAlerts && triggeredAlerts.length > 0
//                     ? triggeredAlerts.join(", ").replace(/Alert/g, "")
//                     : "--"
//                   }
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // Scheduling category: Show starting/duration/event type
//             <div className="flex justify-between items-center">
//               <div className="flex items-center justify-center gap-2">
//                 <CalendarDays className="w-5 h-5 text-gray-600" />
//                 <div className="flex flex-col">
//                   <p className="text-xs text-gray-500 font-semibold">Starting</p>
//                   <div className="text-xs font-bold text-[#178D8F]">{displayStart}</div>
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
//                   <TimerIcon className="w-3 h-3" /> Duration
//                 </div>
//                 <div className="text-xs font-bold text-[#178D8F]">{displayDuration}</div>
//               </div>

//               <div>
//                 <div className="text-xs text-gray-500 font-semibold">Event Type</div>
//                 <div className={`text-xs font-bold ${runningEvent ? "text-emerald-600" : "text-gray-500"}`}>
//                   {eventType}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// TemperatureHumidityDeviceCard.propTypes = {
//   deviceId: PropTypes.string,
//   deviceName: PropTypes.string,
//   espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   temperatureAlert: PropTypes.bool,
//   humidityAlert: PropTypes.bool,
//   lastUpdateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   onCardSelect: PropTypes.func,
//   isSelected: PropTypes.bool,
//   isOnline: PropTypes.bool,
//   lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   category: PropTypes.string,
//   events: PropTypes.array,
//   onRefreshScheduler: PropTypes.func,
//   interval: PropTypes.number,
//   deviceState: PropTypes.string,
//   scheduleData: PropTypes.object,
//   triggeredAlerts: PropTypes.array,
// };





import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Sun, Sunrise, Sunset, CalendarDays, TimerIcon } from "lucide-react";
import TemperatureRangeMeter from "./TemperatureRangeMeter";
import TruncatedText from "../../components/TruncatedText";
import PowerToggle from "../../components/PowerToggle";
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

const convertUTCToLocal = (utcTimeString) => {
  if (!utcTimeString) return utcTimeString;
  try {
    const [hours, minutes] = utcTimeString.split(':').map(Number);
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);
    let localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();
    const period = localHours >= 12 ? 'PM' : 'AM';
    localHours = localHours % 12 || 12;
    return `${localHours}:${String(localMinutes).padStart(2, '0')} ${period}`;
  } catch (err) {
    console.error('Error converting UTC to local:', err);
    return utcTimeString;
  }
};

export default function TemperatureHumidityDeviceCard({
  deviceId,
  deviceName,
  espTemprature = null,
  espHumidity = null,
  temperatureAlert = false,
  humidityAlert = false,
  isSelected = false,
  onCardSelect,
  lastUpdateTime = null,
  isOnline = false,
  lastUpdateISO = null,
  category = "monitoring", // NEW: Device category
  events = [], // NEW: For scheduling/trigger
  onRefreshScheduler, // NEW: For scheduling/trigger
  interval = null, // NEW: For trigger category
  deviceState = "OFF", // NEW: WebSocket state
  scheduleData = null, // NEW: WebSocket schedule data
  triggeredAlerts = [], // NEW: WebSocket triggered alerts for trigger devices
}) {
  const { triggerDevice, triggerDeviceManual, skipEvent, toggleMap, eventsMap } = useScheduler();
  const [loading, setLoading] = useState(false);
  const [apiScheduleData, setApiScheduleData] = useState(null);

  // ✅ Use WebSocket state if available, fallback to context toggleMap
  const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";

  const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
  const [now, setNow] = useState(Date.now());

  const temp = toNumberOrNull(espTemprature);
  const hum = toNumberOrNull(espHumidity);
  const hasAnyAlert = temperatureAlert || humidityAlert;

  useEffect(() => {
    const intervalTimer = setInterval(() => {
      setNow(Date.now());
    }, 10 * 60 * 1000);
    return () => clearInterval(intervalTimer);
  }, []);

  const hour = new Date(now).getHours();
  const timeOfDay =
    hour >= 5 && hour <= 8 ? "sunrise"
    : hour >= 9 && hour <= 16 ? "day"
    : hour >= 17 && hour <= 19 ? "sunset"
    : "night";

  const statusColorClass = (hasAlert) => hasAlert ? "bg-rose-300" : "bg-emerald-200";
  const cardSelectedClass = isSelected ? "shadow-lg transform scale-[1.01]" : "";

  const isSchedulingOrTrigger = category === "scheduling" || category === "trigger";

  // ✅ Fetch schedule data from API as fallback when WebSocket data is not available (scheduling only)
  useEffect(() => {
    const fetchScheduleDataFromAPI = async () => {
      if (category !== "scheduling" || scheduleData) {
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/event/current-next/${deviceId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch schedule data");
        const data = await response.json();
        setApiScheduleData(data);
      } catch (err) {
        console.error(`❌ [TemperatureHumidityDeviceCard ${deviceId}] API fallback error:`, err);
        setApiScheduleData(null);
      }
    };

    fetchScheduleDataFromAPI();
  }, [deviceId, scheduleData, category]);

  // ✅ Read events from global context
  const contextEvents = eventsMap?.[deviceId] ?? [];
  const displayEvents = contextEvents.length > 0 ? contextEvents : events;

  // ✅ For SCHEDULING: Only check WebSocket data for running event
  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  // For TRIGGER: Use context events
  const runningEvent = useMemo(() => {
    if (!isSchedulingOrTrigger || !displayEvents.length) return null;
    return displayEvents.find(e => e.type === "CURRENT") || null;
  }, [displayEvents, isSchedulingOrTrigger]);

  const nextEvent = useMemo(() => {
    if (!isSchedulingOrTrigger || !displayEvents.length) return null;
    return displayEvents.find(e => e.type === "NEXT") || null;
  }, [displayEvents, isSchedulingOrTrigger]);

  const displayState = toggleState;
  const isDisabled = (category === "scheduling" ? !!wsRunningEvent : !!runningEvent) || !isOnline;

  const handleToggleClick = async (e) => {
    e.stopPropagation();

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

    // ✅ For SCHEDULING category: Check WebSocket data ONLY
    if (category === "scheduling" && wsRunningEvent) {
      const localStartTime = convertUTCToLocal(wsRunningEvent.startTime);
      const localEndTime = convertUTCToLocal(wsRunningEvent.endTime);

      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `The <b>${wsRunningEvent.command || "Scheduled"}</b> event is active.<br/>
               <span style="color:#64748b;font-size:13px">${localStartTime} → ${localEndTime}</span><br/><br/>
               Do you want to disable this event?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Disable Event",
        cancelButtonText: "Close",
        confirmButtonColor: "#EF4444",
      });

      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/event/${wsRunningEvent._id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ status: "INACTIVE" }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to disable event");
          }

          await response.json();
          await onRefreshScheduler?.();

          Swal.fire({
            icon: "success",
            title: "Event Disabled",
            text: "The event has been successfully disabled.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not disable event" });
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // ✅ For TRIGGER category: Use existing context logic
    if (category === "trigger" && runningEvent) {
      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `The <b>${runningEvent.command || "Scheduled"}</b> event is active.<br/>
               <span style="color:#64748b;font-size:13px">${runningEvent.startTime} → ${runningEvent.endTime}</span><br/><br/>
               Do you want to disable this event?`,
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
          Swal.fire({ icon: "error", title: "Failed", text: err.message || "Could not skip event" });
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Normal toggle
    const nextAction = toggleState === "on" ? "OFF" : "ON";

    try {
      setLoading(true);

      if (category === "trigger") {
        // Trigger category: Use PUT /device/manual-trigger/:deviceId with state
        await triggerDeviceManual(deviceId, nextAction);
      } else {
        // Scheduling category: Use POST /event/manual-toggle
        await triggerDevice(deviceId, nextAction);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.message || "Command failed" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setUTCHours(h, m, 0);
    const localHours = date.getHours();
    const localMinutes = date.getMinutes();
    const hour12 = localHours % 12 || 12;
    const ampm = localHours >= 12 ? "PM" : "AM";
    return `${String(hour12).padStart(2, "0")}:${String(localMinutes).padStart(2, "0")} ${ampm}`;
  };

  // ✅ Priority: WebSocket > API Fallback > Context Events
  const displayEvent = runningEvent || nextEvent;
  const contextEventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

  // WebSocket data
  const wsEvent = scheduleData?.event;
  const wsEventType = scheduleData?.type;
  const wsDuration = scheduleData?.totalDurationText;

  // API fallback data
  const apiEvent = apiScheduleData?.event;
  const apiEventType = apiScheduleData?.type;
  const apiDuration = apiScheduleData?.totalDurationText;

  // Final values with priority
  const finalEvent = wsEvent || apiEvent || displayEvent;
  const finalEventType =
    (wsEventType && wsEventType !== "NO_EVENT") ? wsEventType :
    (apiEventType && apiEventType !== "NO_EVENT") ? apiEventType :
    contextEventType;

  const displayStart = finalEvent?.startTime ? formatTime(finalEvent.startTime) : "--";
  const displayDuration =
    wsDuration ||
    apiDuration ||
    (finalEvent?.duration ? formatDuration(finalEvent.duration) : "--");
  const eventType = finalEventType !== "NO_EVENT" ? finalEventType : "--";

  return (
    <div
      onClick={() => onCardSelect && onCardSelect()}
      className={`freezer-card-container relative rounded-4xl bg-white min-h-[160px] p-4 ${cardSelectedClass} cursor-pointer`}
    >
      {/* top-right status pill - only for monitoring */}
      {!isSchedulingOrTrigger && (
        <div className="absolute top-0 right-0 flex items-center z-10">
          <div className={`flex rounded-bl-2xl ${temperatureAlert ? "bg-rose-100" : "bg-[#DCE8F4]/50"}`}>
            <p className="px-2 pr-4 py-1 text-sm text-[#020F24]">Alert</p>
            {hasAnyAlert && (
              <div className="flex items-center rounded-xl px-2 py-1">
                {temperatureAlert && (
                  <img
                    src="/temp-alert.svg"
                    alt="Temperature Alert"
                    className="w-4 h-4"
                  />
                )}
                {humidityAlert && (
                  <img
                    src="/hum-alert.svg"
                    alt="Humidity Alert"
                    className="w-4 h-4"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN ROW */}
      <div className="flex flex-row h-full justify-between items-start">
        {/* LEFT: icons + meter */}
        <div className="h-full flex flex-col justify-between flex-shrink-0 min-w-[140px] w-1/3">
          <div title={lastUpdateStr} className="flex flex-col items-start flex-1 min-w-0">
            <div className="w-full">
              <div className="flex items-center">
                <span
                  aria-hidden
                  className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
                  style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
                />
                <div className="text-xs text-gray-500">Device ID</div>
              </div>

              <TruncatedText
                text={deviceName}
                className="text-lg font-bold text-gray-900"
                maxLines={1}
                tooltipPlacement="top"
              />
            </div>
          </div>

          {/* icons row */}
          <div className="flex items-center justify-start gap-3 mt-2 flex-nowrap overflow-hidden border-b-2 border-[#C3C1C1] pb-2">
            <div className={`p-2 rounded-full border ${timeOfDay === "sunrise" ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sunrise size={18} className={`${timeOfDay === "sunrise" ? "text-yellow-600" : "text-gray-500"}`} />
            </div>
            <div className={`p-2 rounded-full border ${timeOfDay === "day" ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sun size={18} className={`${timeOfDay === "day" ? "text-yellow-500" : "text-gray-500"}`} />
            </div>
            <div className={`p-2 rounded-full border ${(timeOfDay === "sunset" || timeOfDay === "night") ? "border-1 border-gray-600" : "border-transparent"}`}>
              <Sunset size={18} className={`${timeOfDay === "sunset" ? "text-orange-500" : "text-gray-500"}`} />
            </div>
          </div>

          <TemperatureRangeMeter value={temp !== null ? Math.round(temp) : 0} />
        </div>

        {/* CENTER/RIGHT: temp/humidity + toggle for scheduling/trigger */}
        <div className="h-full flex flex-col justify-around">
          <div />

          <div className="flex items-start gap-4">
            <div className="h-full flex flex-col items-center justify-around mt-5">
              <div className="">
                <div className="text-sm text-gray-500">Temperature</div>
                <div className="text-3xl font-bold">
                  {temp !== null ? `${Math.round(temp)}` : "--"}<span className="font-normal">°C</span>
                </div>
                <div className="mt-2">
                  <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                    <div className={`h-2 ${statusColorClass(temperatureAlert)}`} />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Humidity</div>
                <div className="text-2xl font-bold">
                  {hum !== null ? `${Math.round(hum)}%` : "--"}
                </div>
                <div className="mt-2">
                  <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                    <div className={`h-2 ${statusColorClass(humidityAlert)}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Power Toggle for scheduling/trigger */}
            {isSchedulingOrTrigger && (
              <PowerToggle
                displayState={displayState}
                isLocked={isDisabled}
                loading={loading}
                onClick={handleToggleClick}
              />
            )}
          </div>

          <div />
        </div>
      </div>

      {/* Footer: Show different content based on category */}
      {isSchedulingOrTrigger && (
        <div className="mt-3 pt-3 border-t border-gray-200">
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
            <div className="flex justify-between items-center">
              <div className="flex items-center justify-center gap-2">
                <CalendarDays className="w-5 h-5 text-gray-600" />
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
          )}
        </div>
      )}
    </div>
  );
}

TemperatureHumidityDeviceCard.propTypes = {
  deviceId: PropTypes.string,
  deviceName: PropTypes.string,
  espTemprature: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  espHumidity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  temperatureAlert: PropTypes.bool,
  humidityAlert: PropTypes.bool,
  lastUpdateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCardSelect: PropTypes.func,
  isSelected: PropTypes.bool,
  isOnline: PropTypes.bool,
  lastUpdateISO: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  category: PropTypes.string,
  events: PropTypes.array,
  onRefreshScheduler: PropTypes.func,
  interval: PropTypes.number,
  deviceState: PropTypes.string,
  scheduleData: PropTypes.object,
  triggeredAlerts: PropTypes.array,
};


