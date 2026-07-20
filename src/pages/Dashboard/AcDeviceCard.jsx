import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIcon,
  CalendarDays,
  CalendarClock,
  CirclePlus,
  Lock,
  PowerIcon,
  TimerIcon,
  Unlock,
} from "lucide-react";
import PowerToggle from "../../components/PowerToggle";
import TruncatedText from "../../components/TruncatedText";
import TemperatureStepper from "../../components/TemperatureStepper";
import { fetchCurrentOrNextSchedule } from "../../utils/fetchCurrentOrNextSchedule";
import { handleCreateEventPlusClick } from "../../utils/schedulingCardUtils";
import { useAcControl } from "../../contexts/AcControlContext";
import "../../styles/pages/Dashboard/dashboard-styles.css";
import FormattedValue from "../../components/FormattedValue";

const AC_MODES = ["Cool", "Heat", "Dry", "FanOnly", "Auto"];
const FAN_SPEEDS = ["Low", "Medium", "Ultra", "Turbo"];

const formatTime = (time) => {
  if (!time) return "--:--";
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setUTCHours(h, m, 0);
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();
  const ampm = localHours >= 12 ? "PM" : "AM";
  const displayHour = localHours % 12 || 12;
  return `${displayHour}:${String(localMinutes).padStart(2, "0")} ${ampm}`;
};


/**
 * AC card — all controls go through AcControlContext so VenueDetailsPanel stays in sync.
 */
const AcDeviceCard = ({
  deviceId,
  deviceName,
  isOnline = false,
  isSelected = false,
  onCardSelect,
  // seed props (hydrate once / when list refreshes)
  deviceState = "OFF",
  setTemperature: setTempProp = 26,
  acMode: modeProp = "Cool",
  fanSpeed: fanProp = "Low",
  acLocked: lockedProp = false,
  acHealthAlert: healthProp = false,
  energyMonitoringIncluded: energyProp = false,
  espPower: powerProp = null,
  espEnergy: energyKwhProp = null,
  espCurrent: currentProp = null,
  scheduleData = null,
  onRefreshScheduler,
  onCreateEventClick,
  alerts = [],
}) => {
  const {
    getAc,
    hydrateAc,
    updateAcSettings,
    stepTemperature,
    toggleAcPower,
    busyMap,
    TEMP_MIN,
    TEMP_MAX,
  } = useAcControl();

  const [apiScheduleData, setApiScheduleData] = useState(null);

  // Keep shared map seeded from props / live parent data (skip while mutating)
  useEffect(() => {
    if (!deviceId || busyMap[deviceId]) return;
    hydrateAc(deviceId, {
      state: deviceState,
      setTemperature: setTempProp,
      acMode: modeProp,
      fanSpeed: fanProp,
      acLocked: lockedProp,
      acHealthAlert: healthProp,
      energyMonitoringIncluded: energyProp,
      espPower: powerProp,
      espEnergy: energyKwhProp,
      espCurrent: currentProp,
    });
  }, [
    deviceId,
    deviceState,
    setTempProp,
    modeProp,
    fanProp,
    lockedProp,
    healthProp,
    energyProp,
    powerProp,
    energyKwhProp,
    currentProp,
    busyMap,
    hydrateAc,
  ]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (scheduleData) return;
      const data = await fetchCurrentOrNextSchedule(deviceId);
      if (!cancelled) setApiScheduleData(data);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [deviceId, scheduleData]);

  const ac = getAc(deviceId);
  const busy = busyMap[deviceId];
  const settingsLoading = busy === "settings";
  const powerLoading = busy === "power";

  const displayState = String(ac.state || "OFF").toLowerCase() === "on" ? "on" : "off";
  const effectiveSchedule = scheduleData || apiScheduleData;
  const hasCurrentEvent =
    effectiveSchedule?.type === "CURRENT" && !!effectiveSchedule?.event;
  const powerLocked = !isOnline || hasCurrentEvent;

  const healthAlert =
    ac.acHealthAlert ||
    (Array.isArray(alerts) && alerts.some((a) => a.type === "acHealth"));

  const handleTempStep = (e, delta) => {
    e.stopPropagation();
    stepTemperature(deviceId, delta, { isOnline });
  };

  const handlePowerToggle = async (e) => {
    e?.stopPropagation?.();
    const currentEvent = effectiveSchedule?.event || null;
    const result = await toggleAcPower(deviceId, {
      isOnline,
      hasCurrentEvent,
      currentEvent,
      eventId: currentEvent?._id,
    });
    // After disable-schedule OR successful toggle → refresh scheduler UI
    if (result) await onRefreshScheduler?.();
  };

  const cardSelectedClass = isSelected
    ? "shadow-lg ring-1 ring-[#0D5CA4]/15"
    : "";

  const scheduleEvent = effectiveSchedule?.event;
  const scheduleType = effectiveSchedule?.type;
  const hasScheduleEvent =
    !!scheduleEvent && scheduleType && scheduleType !== "NO_EVENT";

  const displayStart = scheduleEvent?.startTime
    ? formatTime(scheduleEvent.startTime)
    : "--";
  const displayEnd = scheduleEvent?.endTime
    ? formatTime(scheduleEvent.endTime)
    : "--";
  const displayDuration =
    effectiveSchedule?.totalDurationText ||
    scheduleEvent?.duration ||
    "--";
  const displayEventType =
    scheduleType && scheduleType !== "NO_EVENT" ? scheduleType : "--";
  const scheduleCmdLabel = [
    scheduleEvent?.command || "ON",
    scheduleEvent?.setTemperature != null
      ? `${scheduleEvent.setTemperature}°C`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const powerLabel = useMemo(() => {
    if (ac.espPower == null || !Number.isFinite(Number(ac.espPower))) return "--";
    return `${Math.round(Number(ac.espPower))} W`;
  }, [ac.espPower]);

  const energyLabel = useMemo(() => {
    if (ac.espEnergy == null || !Number.isFinite(Number(ac.espEnergy))) return "--";
    return `${Number(ac.espEnergy).toFixed(3)} kWh`;
  }, [ac.espEnergy]);

  return (
    <div
      onClick={onCardSelect}
      className={`freezer-card-container rounded-4xl bg-white ${cardSelectedClass}  cursor-pointer transition hover:shadow-md px-4 py-3 flex flex-col gap-2`}
    >
<div className="flex flex-col justify-between  h-full">
      {/* AC ID to On/Off */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-300"
                }`}
            />
            <span className="text-xs text-gray-500">AC · {deviceId}</span>
          </div>
          <TruncatedText
            text={deviceName}
            className="text-lg font-bold text-gray-900"
            maxLines={1}
          />

          {healthAlert && (
            <div className="max-w-fit text-xs font-semibold text-rose-600 bg-rose-50 rounded-md px-2 py-1 mt-2">
              AC health alert
            </div>
          )}

          {/* <div
        className="grid grid-cols-2 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-xs text-gray-500 flex flex-col gap-1">
          Mode
          <select
            value={ac.acMode || "Cool"}
            disabled={!isOnline || settingsLoading}
            onChange={(e) =>
              updateAcSettings(deviceId, { acMode: e.target.value }, { isOnline })
            }
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white disabled:opacity-50"
          >
            {AC_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-gray-500 flex flex-col gap-1">
          Fan
          <select
            value={ac.fanSpeed || "Low"}
            disabled={!isOnline || settingsLoading}
            onChange={(e) =>
              updateAcSettings(deviceId, { fanSpeed: e.target.value }, { isOnline })
            }
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white disabled:opacity-50"
          >
            {FAN_SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div> */}

        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex flex-col items-end gap-3">

            <TemperatureStepper
              value={ac.setTemperature}
              onDecrement={(e) => handleTempStep(e, -1)}
              onIncrement={(e) => handleTempStep(e, 1)}
              disabled={!isOnline || settingsLoading}
              disabledMinus={ac.setTemperature <= TEMP_MIN}
              disabledPlus={ac.setTemperature >= TEMP_MAX}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                title={ac.acLocked ? "Unlock" : "Lock"}
                disabled={!isOnline || settingsLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  updateAcSettings(deviceId, { acLocked: !ac.acLocked }, { isOnline });
                }}
                className={`p-1.5 rounded-full border ${ac.acLocked
                    ? "border-amber-400 text-amber-600 bg-amber-50"
                    : "border-gray-200 text-gray-500"
                  }`}
              >
                {ac.acLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
              <PowerToggle
                displayState={displayState}
                isLocked={powerLocked}
                loading={powerLoading}
                onClick={handlePowerToggle}
              />
            </div>

          </div>
        </div>
      </div>

{/* Current and Power */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <ActivityIcon className="w-4 h-4 text-gray-500" />
          {/* <strong>
            {ac.espCurrent != null
              ? `${Number(ac.espCurrent).toFixed(2)} A`
              : "--"}
          </strong> */}
<FormattedValue
  value={
    ac.espCurrent != null
      ? Number(ac.espCurrent).toFixed(2)
      : "--"
  }
  unit="A"
/>
        </div>
        <span className="text-gray-500">|</span>
        <div className="flex items-center gap-1">
          <PowerIcon className="w-4 h-4 text-gray-500" />
          {/* <strong>{powerLabel}</strong> */}
          <FormattedValue
  value={
    ac.espPower != null
      ? Math.round(Number(ac.espPower))
      : "--"
  }
  unit="W"
/>
        </div>
      </div>


{/* Schedule Event — same layout as Odour scheduling footer (+ end time for AC) */}
      <div className="pt-2 border-t border-gray-200">
        {hasScheduleEvent ? (
          <div className="flex justify-between items-start gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <CalendarDays className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <p className="text-xs text-gray-500 font-semibold">Start</p>
                <div className="text-xs font-bold text-[#178D8F] truncate">
                  {displayStart}
                </div>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <p className="text-xs text-gray-500 font-semibold">End</p>
              <div className="text-xs font-bold text-[#178D8F] truncate">
                {displayEnd}
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                <TimerIcon className="w-3 h-3" /> Duration
              </div>
              <div className="text-xs font-bold text-[#178D8F] truncate">
                {displayDuration}
              </div>
            </div>

            {/* <div className="flex flex-col items-end min-w-0">
              <p className="text-xs text-gray-500 font-semibold">Event</p>
              <div
                className={`text-xs font-bold ${
                  displayEventType === "CURRENT"
                    ? "text-emerald-600"
                    : "text-gray-500"
                }`}
              >
                {displayEventType}
              </div>
              {scheduleCmdLabel ? (
                <div className="text-[10px] text-gray-500 truncate max-w-[72px]">
                  {scheduleCmdLabel}
                </div>
              ) : null}
            </div> */}
          </div>
        ) : (
          <div className="flex justify-center items-center gap-3">
            <CalendarClock size={24} className="text-gray-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <p className="text-xs font-normal">No Event Found!</p>
                <p className="text-xs font-thin text-gray-500">
                  Schedule your upcoming event
                </p>
              </div>
              {onCreateEventClick && (
                <CirclePlus
                  size={24}
                  className="text-gray-600 cursor-pointer hover:rotate-180 transition-transform duration-500 ease-in-out"
                  onClick={(e) =>
                    handleCreateEventPlusClick(
                      e,
                      onCardSelect,
                      onCreateEventClick
                    )
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AcDeviceCard;
