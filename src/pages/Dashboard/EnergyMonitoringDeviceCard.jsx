// src/pages/EnergyMonitoringDeviceCard.jsx
import React, { useMemo, useState } from "react";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import PowerRangeMeter from "./PowerRangeMeter";
import PowerToggle from "../../components/PowerToggle";
import { CalendarDays, TimerIcon, CirclePlus, CalendarClock } from "lucide-react";
import Swal from "sweetalert2";
import { useScheduler } from "../../contexts/SchedulerContext";
import TruncatedText from "../../components/TruncatedText";
import { resolveAlertState } from "../../utils/triggerAlertUtils";
import { handleCreateEventPlusClick } from "../../utils/schedulingCardUtils";

function formatSmartNumber(v, maxDecimals = 3) {
  if (v === undefined || v === null || v === "") return "--";
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  return parseFloat(n.toFixed(maxDecimals)).toString();
}

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

function AlertIndicator({ hasAlert }) {
  return hasAlert ?
    <img src="/humidity-red-alert.svg" alt="" className="w-[3rem] rounded-3px" /> :
    <img src="/temperature-green-alert.svg" alt="" className="w-[3rem] rounded-3px" />;
}

function MetricAlertItem({ label, value, hasAlert }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex flex-col items-center">
        <div className="text-xs">{label}</div>
        <div className="text-sm text-right font-semibold">{value}</div>
        <AlertIndicator hasAlert={hasAlert} />
      </div>
    </div>
  );
}

function TempHumidityAlerts({ espTemprature, espHumidity, temperatureAlert, humidityAlert }) {
  return (
    <div className="flex items-center justify-start gap-4">
      <MetricAlertItem
        label="Temperature"
        value={`${espTemprature ?? "--"}°C`}
        hasAlert={temperatureAlert}
      />
      <MetricAlertItem
        label="Humidity"
        value={`${espHumidity ?? "--"}%`}
        hasAlert={humidityAlert}
      />
    </div>
  );
}

function TempHumidityVoltageAlerts({
  espTemprature,
  espHumidity,
  espVoltage,
  temperatureAlert,
  humidityAlert,
  voltageAlert,
}) {
  return (
    <div className="flex items-center justify-start gap-3">
      <MetricAlertItem
        label="Temperature"
        value={`${espTemprature ?? "--"}°C`}
        hasAlert={temperatureAlert}
      />
      <MetricAlertItem
        label="Humidity"
        value={`${espHumidity ?? "--"}%`}
        hasAlert={humidityAlert}
      />
      <MetricAlertItem
        label="Voltage"
        value={`${espVoltage ?? "--"}V`}
        hasAlert={voltageAlert}
      />
    </div>
  );
}

function AmperePill({ value }) {
  return (
    <div className="flex items-center justify-center gap-3 bg-[#E5EBE4] rounded-l-2xl px-2 py-1">
      <img src="/ampere-Icon.png" alt="Ampere" className="h-[1.75rem] w-[1.75rem]" />
      <div className="flex flex-col items-end justify-center">
        <p className="text-xs font-normal">Ampere</p>
        <p className="text-lg font-bold">
          {value}<span className="text-sm font-normal ml-0.5">A</span>
        </p>
      </div>
    </div>
  );
}

function SchedulingEnergyMetrics({ calculatedPower, ampereDisplay }) {
  const power = formatPower(calculatedPower);

  return (
    <div className="flex items-center justify-around w-full rounded-2xl  border-b-1  border-gray-200 overflow-hidden ">
      <div className="flex items-center gap-3 px-4 min-w-0">
        <img src="/power-icon.png" alt="Power" className="w-[20%] h-[20%]" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500">Power</span>
          <span className="text-xl font-bold leading-tight truncate">
            {!power ? (
              "--"
            ) : (
              <>
                {power.intPart}
                {power.decPart && (
                  <>
                    <span className="text-base font-bold">.</span>
                    {power.decPart}
                  </>
                )}
                <span className="text-sm font-medium ml-1">{power.unit}</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="w-px self-stretch bg-gray-300 my-2" aria-hidden />

      <div className="flex  items-center gap-3 px-4 py-1 min-w-0">
        <img src="/ampere-Icon.png" alt="Ampere" className="h-6 w-6 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-gray-500">Ampere</span>
          <span className="text-xl font-bold leading-tight truncate">
            {ampereDisplay}
            <span className="text-sm font-medium ml-1">A</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PowerDisplay({ calculatedPower }) {
  const power = formatPower(calculatedPower);
  if (!power) return <div className="text-3xl font-bold">--</div>;

  const { intPart, decPart, unit } = power;
  return (
    <div className="flex items-end gap-x-2 mb-2">
      <div className="flex flex-col items-center justify-center">
        <div className="text-start text-sm text-gray-900">Power</div>
        <img src="/power-icon.png" alt="Power" className="w-8" />
      </div>
      <div>
        <span className="text-3xl font-bold leading-none">{intPart}</span>
        {decPart && (
          <>
            <span className="text-lg font-bold leading-none">.</span>
            <span className="text-lg font-bold leading-none">{decPart}</span>
          </>
        )}
        <span className="text-md font-medium ml-1">{unit}</span>
      </div>
    </div>
  );
}

const EnergyMonitoringDeviceCard = React.memo(function EnergyMonitoringDeviceCard({
  deviceId,
  deviceName,
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
  voltageAlert = false,
  category = "monitoring",
  onRefreshScheduler,
  deviceState = "OFF",
  scheduleData = null,
  triggeredAlerts = [],
  onCreateEventClick,
}) {
  const { triggerDevice, triggerDeviceManual, toggleMap } = useScheduler();
  const toggleState = deviceState?.toLowerCase() || toggleMap?.[deviceId] || "off";
  const [loading, setLoading] = useState(false);

  const effectiveTemperatureAlert = resolveAlertState(category, triggeredAlerts, "temperature", temperatureAlert);
  const effectiveHumidityAlert = resolveAlertState(category, triggeredAlerts, "humidity", humidityAlert);
  const effectiveVoltageAlert = resolveAlertState(category, triggeredAlerts, "voltage", voltageAlert);

  const ampereDisplay = formatSmartNumber(espCurrent, 2);

  const wsRunningEvent = useMemo(() => {
    if (category !== "scheduling") return null;
    if (scheduleData?.type === "CURRENT" && scheduleData?.event) {
      return scheduleData.event;
    }
    return null;
  }, [scheduleData, category]);

  const displayState = toggleState;
  const isDisabled =
    category === "trigger" ? !isOnline :
    category === "scheduling" ? !!wsRunningEvent || !isOnline :
    false;

  const handleToggleClick = async (e) => {
    e.stopPropagation();

    if (!isOnline) {
      await Swal.fire({
        title: "Device Offline",
        html: `
          <b>${deviceName}</b> is currently offline.<br/>
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

    if (category === "scheduling" && wsRunningEvent) {
      const result = await Swal.fire({
        title: "Event Currently Running",
        html: `The <b>${wsRunningEvent.command || "Scheduled"}</b> event is active.<br/>
               <span style="color:#64748b;font-size:13px">${wsRunningEvent.startTime} → ${wsRunningEvent.endTime}</span><br/><br/>
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

    const nextAction = toggleState === "on" ? "OFF" : "ON";

    try {
      setLoading(true);
      if (category === "trigger") {
        await triggerDeviceManual(deviceId, nextAction);
      } else {
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

  const wsEvent = scheduleData?.event;
  const wsEventType = scheduleData?.type;
  const wsDuration = scheduleData?.totalDurationText;
  const displayStart = wsEvent?.startTime ? formatTime(wsEvent.startTime) : "--";
  const displayDuration = wsDuration || (wsEvent?.duration ?? "--");
  const displayEventType = wsEventType && wsEventType !== "NO_EVENT" ? wsEventType : "--";
  const hasScheduleEvent =
    Boolean(wsEvent) && wsEventType !== "NO_EVENT" && displayEventType !== "--";

  const calculatedPower = useMemo(() => {
    const v = Number(espVoltage);
    const c = Number(espCurrent);
    if (!Number.isFinite(v) || !Number.isFinite(c)) return null;
    return v * c;
  }, [espVoltage, espCurrent]);

  const lastUpdateStr = lastUpdateISO ? new Date(lastUpdateISO).toLocaleString() : "";
  const paddingClass = "px-4 py-3";

  const powerToggle = (
    <PowerToggle
      displayState={displayState}
      isLocked={isDisabled}
      loading={loading}
      onClick={handleToggleClick}
    />
  );

  const deviceIdHeader = (
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
  );

  // ── Monitoring layout (unchanged) ──────────────────────────────────────
  if (category === "monitoring") {
    return (
      <div
        onClick={onCardSelect}
        className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`}
      >
        <div className="px-4 py-3 h-full flex flex-col justify-between">
          <div className="flex justify-between">
            {deviceIdHeader}
            <div className="ambient-pill bg-white/20 border border-white/30 flex items-center">
              <img src="/ampere-Icon.png" alt="Ampere Icon" className="h-[2rem] w-[2rem]" />
              <div>
                <p className="responsive-value-status">
                  {ampereDisplay} <span className="font-normal">A</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="border-b-2 border-gray-300 w-full">
              <PowerDisplay calculatedPower={calculatedPower} />
            </div>
            <div className="flex flex-col items-end mb-0.5 ml-2">
              <div className="text-sm text-gray-500">Voltage</div>
              <span className="text-2xl font-bold">
                {espVoltage ?? "--"}<span className="font-normal">V</span>
              </span>
              <AlertIndicator hasAlert={effectiveVoltageAlert} />
              {/* <p className="h-2 w-[3rem] rounded-full bg-[#BAEACC]" /> */}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="w-[260px]">
              <PowerRangeMeter value={espTemprature !== null ? Math.round(espTemprature) : 0} />
            </div>
            <TempHumidityAlerts
              espTemprature={espTemprature}
              espHumidity={espHumidity}
              temperatureAlert={effectiveTemperatureAlert}
              humidityAlert={effectiveHumidityAlert}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Trigger layout ───────────────────────────────────────────────────────
  if (category === "trigger") {
    return (
      <div
        onClick={onCardSelect}
        className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""} min-h-[160px]`}
      >
        <div className="pl-4 py-3 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            {deviceIdHeader}
            <div className="pr-4">
            {powerToggle}
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <div className="border-b-2 border-gray-300 w-full">
              <PowerDisplay calculatedPower={calculatedPower}/>
            </div>
            <div className="flex flex-col items-end justify-start shrink-0">
              <AmperePill value={ampereDisplay} />
            </div>
          </div>

          <div className="flex justify-between items-center pr-4">
            <div className="w-[260px]">
              <PowerRangeMeter value={espTemprature !== null ? Math.round(espTemprature) : 0} />
            </div>
            <TempHumidityAlerts
              espTemprature={espTemprature}
              espHumidity={espHumidity}
              temperatureAlert={effectiveTemperatureAlert}
              humidityAlert={effectiveHumidityAlert}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Scheduling layout ────────────────────────────────────────────────────
  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${isSelected ? "shadow-lg" : ""}  flex flex-col`}
    >
      <div className={`flex flex-col flex-1 justify-between ${paddingClass}`}>
        <div className="flex justify-between items-start gap-3">
          {deviceIdHeader}
          {powerToggle}
        </div>

<div>
        <SchedulingEnergyMetrics
          calculatedPower={calculatedPower}
          ampereDisplay={ampereDisplay}
          />
</div>

        <div className="flex justify-around w-full">
          <TempHumidityVoltageAlerts
            espTemprature={espTemprature}
            espHumidity={espHumidity}
            espVoltage={espVoltage}
            temperatureAlert={effectiveTemperatureAlert}
            humidityAlert={effectiveHumidityAlert}
            voltageAlert={effectiveVoltageAlert}
          />
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="pt-2 border-t border-gray-200">
          {hasScheduleEvent ? (
            <div className="flex justify-between items-center">
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
                <div className={`text-xs font-bold ${displayEventType === "CURRENT" ? "text-emerald-600" : "text-gray-500"}`}>
                  {displayEventType}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-3">
              <CalendarClock size={24} className="text-gray-600" />
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <p className="text-xs font-normal">No Event Found!</p>
                  <p className="text-xs font-thin text-gray-500">Schedule your upcoming event.</p>
                </div>
                <CirclePlus
                  size={24}
                  className="text-gray-600 cursor-pointer"
                  onClick={(e) => handleCreateEventPlusClick(e, onCardSelect, onCreateEventClick)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default EnergyMonitoringDeviceCard;
