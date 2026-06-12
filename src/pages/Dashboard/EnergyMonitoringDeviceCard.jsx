// src/pages/EnergyMonitoringDeviceCard.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import PowerRangeMeter from "./PowerRangeMeter";
import PowerToggle from "../../components/PowerToggle";
import { CalendarDays, TimerIcon } from "lucide-react";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";

function formatSmartNumber(v, maxDecimals = 3) {
  if (v === undefined || v === null || v === "") return "--";
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";

  return parseFloat(n.toFixed(maxDecimals)).toString();
}

// Returns { intPart, decPart, unit } for styled power display
// < 1,000          → Wh,  2 decimals  (e.g. 45.67 Wh,   342.50 Wh)
// 1,000 – 99,999   → kWh, 3 decimals  (e.g. 2.000 kWh,  99.999 kWh)
// 100,000 – 999,999→ kWh, 2 decimals  (e.g. 123.45 kWh, 999.99 kWh)
// ≥ 1,000,000      → MWh, 3 decimals  (e.g. 1.234 MWh,  10.500 MWh)


function formatPower(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;

  if (n >= 1_000_000) {
    const [intPart, decPart] = (n / 1_000_000).toFixed(3).split(".");
    return { intPart, decPart, unit: "MW" };
  }

  if (n >= 100_000) {
    const [intPart, decPart] = (n / 1000).toFixed(2).split(".");
    return { intPart, decPart, unit: "kW" };
  }

  if (n >= 1000) {
    const [intPart, decPart] = (n / 1000).toFixed(3).split(".");
    return { intPart, decPart, unit: "kW" };
  }

  const [intPart, decPart] = n.toFixed(2).split(".");
  return { intPart, decPart, unit: "W" };
}

const EnergyMonitoringDeviceCard = React.memo(function EnergyMonitoringDeviceCard({
    deviceId,
    espVoltage,
    espCurrent,
    espPower,
    espTemprature,
    espHumidity,
    isOnline,
    lastUpdateISO,
    onCardSelect,
    isSelected,
    temperatureAlert,
    humidityAlert,
    category = "monitoring",
    events = [],
    onRefreshScheduler,
    interval = null, // For trigger category
}) {
    const { triggerDevice, triggerDeviceManual, skipEvent, fetchToggleStatus, toggleMap, eventsMap } = useScheduler();
    const toggleState = toggleMap?.[deviceId] ?? "off";
    const [loading, setLoading] = useState(false);

    const contextEvents = eventsMap?.[deviceId] ?? [];
    const displayEvents = contextEvents.length > 0 ? contextEvents : events;

    const isSchedulingOrTrigger = category === "scheduling" || category === "trigger";

    // Get current running event
    const runningEvent = useMemo(() => {
        if (!isSchedulingOrTrigger || !displayEvents.length) return null;
        return displayEvents.find(e => e.type === "CURRENT") || null;
    }, [displayEvents, isSchedulingOrTrigger]);

    // Get next event
    const nextEvent = useMemo(() => {
        if (!isSchedulingOrTrigger || !displayEvents.length) return null;
        return displayEvents.find(e => e.type === "NEXT") || null;
    }, [displayEvents, isSchedulingOrTrigger]);

    const displayState = toggleState;
    const isDisabled = !!runningEvent || !isOnline;

    useEffect(() => {
        if (deviceId && isSchedulingOrTrigger) fetchToggleStatus(deviceId);
    }, [deviceId, fetchToggleStatus, isSchedulingOrTrigger]);

    const handleToggleClick = async (e) => {
        e.stopPropagation();

        if (runningEvent) {
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

        // Use different API based on category
        try {
            setLoading(true);

            if (category === "trigger") {
                // Trigger category: Use PUT /event/manual-trigger/:deviceId
                await triggerDeviceManual(deviceId);
            } else {
                // Scheduling category: Use POST /event/manual-toggle
                const nextAction = toggleState === "on" ? "OFF" : "ON";
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

    const displayEvent = runningEvent || nextEvent;
    const displayStart = displayEvent?.startTime ? formatTime(displayEvent.startTime) : "--";
    const displayDuration = displayEvent?.duration || "--";
    const eventType = runningEvent ? "CURRENT" : (nextEvent ? "NEXT" : "--");

    const calculatedPower = useMemo(() => {
    const v = Number(espVoltage);
    const c = Number(espCurrent);

    if (!Number.isFinite(v) || !Number.isFinite(c)) return null;

    return v * c;
}, [espVoltage, espCurrent]);


    return (
        <div onClick={onCardSelect} className={`freezer-card-container rounded-4xl  bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`} >
            <div className="px-4 py-3 h-full flex flex-col  justify-between">

                <div className="flex justify-between ">
                    <div>
                        <div className="flex items-center">
                            <span
                                aria-hidden
                                className={`inline-block h-1.5 w-1.5 rounded-full mr-2 shadow-sm ${isOnline ? "bg-green-300" : "bg-gray-300"}`}
                                style={{ boxShadow: isOnline ? "0 0 6px rgba(34,197,94,0.45)" : "none" }}
                            />
                            <div className="text-xs text-gray-500">Device ID</div>
                        </div>
                        <div className="text-lg font-bold">{deviceId}</div>
                    </div>

                    <div>
                        {isSchedulingOrTrigger ? (
                            <PowerToggle
                                displayState={displayState}
                                isLocked={isDisabled}
                                loading={loading}
                                onClick={handleToggleClick}
                            />
                        ) : (
                            <div className={`ambient-pill bg-white/20 border border-white/30 flex items-center`}>
                                <img src="/ampere-Icon.png" alt="Ampere Icon" className="h-[2rem] w-[2rem] " />
                                <div>
                                    <p className="responsive-value-status">{formatSmartNumber(espCurrent, 2)} <span className="font-normal  ">A</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center justify-between ">
                        <div className=" border-b-2  border-gray-300 w-full  ">

                            {(() => {
                                // const power = formatPower(espPower);
                                const power = formatPower(calculatedPower);
                                if (!power) return <div className="text-3xl font-bold">--</div>;

                                const { intPart, decPart, unit } = power;
                                return (
                                    <div className="flex items-end gap-x-2 mb-2">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-start text-sm text-gray-900 ">Power</div>
                                            <img src="/power-icon.png" alt="Power" className="w-8" />
                                        </div>

                                        <div>
                                            <span className="text-3xl font-bold leading-none">
                                                {intPart}
                                            </span>

                                            {decPart && (
                                                <>
                                                    <span className="text-lg font-bold leading-none">.</span>
                                                    <span className="text-lg font-bold leading-none">
                                                        {decPart}
                                                    </span>
                                                </>
                                            )}

                                            <span className="text-md font-medium ml-1">{unit}</span>
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    </div>


                    <div>
                        <div className="flex items-center">
                            <div className="flex flex-col items-end mb-0.5">
                                <div className={`text-sm text-gray-500 `}>Voltage</div>
                                <span className={`text-2xl font-bold`}>
                                    {espVoltage}<span className="font-normal">V</span>
                                </span>
                                <p className={`h-2 w-[3rem] rounded-full bg-[#BAEACC]`} />
                            </div>
                        </div>
                    </div>
                </div>



                {isSchedulingOrTrigger ? (
                    // Scheduling/Trigger: Show appropriate info based on category
                    <div className="flex justify-between items-center">
                        {category === "trigger" ? (
                            // Trigger category: Show interval only
                            <div className="flex items-center justify-center gap-2 w-full">
                                <TimerIcon className="w-6 h-6 text-gray-600" />
                                <div className="flex flex-col">
                                    <p className="text-xs text-gray-500 font-semibold">Interval</p>
                                    <div className="text-xs font-bold text-[#178D8F]">
                                        {interval !== null && interval !== undefined ? `${interval}s` : "--"}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Scheduling category: Show starting/duration/event type
                            <>
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
                            </>
                        )}
                    </div>
                ) : (
                    // Monitoring: Show PowerRangeMeter and Temperature/Humidity alerts
                    <div className="flex justify-between items-center  ">
                        <div className="w-[260px]">
                            <PowerRangeMeter value={espTemprature !== null ? Math.round(espTemprature) : 0} />
                        </div>

                        <div className="flex items-center justify-start gap-4">
                            <div className="flex  items-center justify-center gap-1 ">
                                <div className="flex flex-col items-center ">
                                    <div className="text-xs">Temperature</div>
                                    <div className="text-sm text-right font-semibold">{espTemprature ?? "--"}°C</div>
                                    {
                                        temperatureAlert ?
                                            <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
                                            <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />
                                    }
                                </div>
                            </div>

                            <div className="flex  items-center justify-center gap-1  ">
                                <div className="flex flex-col items-center ">
                                    <div className="text-xs">Humidity</div>
                                    <div className="text-sm text-right font-semibold">{espHumidity ?? "--"}%</div>
                                    {
                                        humidityAlert ?
                                            <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
                                            <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>


        </div>

    );
});

export default EnergyMonitoringDeviceCard;