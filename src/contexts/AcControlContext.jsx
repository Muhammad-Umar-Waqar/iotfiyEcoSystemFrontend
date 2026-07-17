import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import Swal from "sweetalert2";

const AcControlContext = createContext(null);

const TEMP_MIN = 16;
const TEMP_MAX = 30;

/** UTC HH:MM → local 12h for the “event running” modal */
const utcToLocal12 = (utcTimeString) => {
  if (!utcTimeString) return utcTimeString;
  try {
    const [hours, minutes] = utcTimeString.split(":").map(Number);
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);
    let localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();
    const period = localHours >= 12 ? "PM" : "AM";
    localHours = localHours % 12 || 12;
    return `${localHours}:${String(localMinutes).padStart(2, "0")} ${period}`;
  } catch {
    return utcTimeString;
  }
};

const defaultAcState = (overrides = {}) => ({
  state: "OFF",
  setTemperature: 26,
  acMode: "Cool",
  fanSpeed: "Low",
  acLocked: false,
  acHealthAlert: false,
  energyMonitoringIncluded: false,
  espPower: null,
  espEnergy: null,
  espCurrent: null,
  ...overrides,
});

export function AcControlProvider({ children }) {
  const [acMap, setAcMap] = useState({});
  const [busyMap, setBusyMap] = useState({}); // deviceId → settings | power | null

  const setBusy = useCallback((deviceId, kind) => {
    setBusyMap((prev) => ({ ...prev, [deviceId]: kind }));
  }, []);

  /** Merge live / device props into shared map (websocket or list hydrate) */
  const hydrateAc = useCallback((deviceId, partial = {}) => {
    if (!deviceId) return;
    setAcMap((prev) => {
      const current = prev[deviceId] || defaultAcState();
      const next = { ...current };

      if (partial.state !== undefined && partial.state !== null) {
        next.state = String(partial.state).toUpperCase() === "ON" ? "ON" : "OFF";
      }
      if (partial.setTemperature != null && Number.isFinite(Number(partial.setTemperature))) {
        next.setTemperature = Number(partial.setTemperature);
      }
      if (partial.acMode) next.acMode = partial.acMode;
      if (partial.fanSpeed) next.fanSpeed = partial.fanSpeed;
      if (typeof partial.acLocked === "boolean") next.acLocked = partial.acLocked;
      if (typeof partial.acHealthAlert === "boolean") next.acHealthAlert = partial.acHealthAlert;
      if (typeof partial.energyMonitoringIncluded === "boolean") {
        next.energyMonitoringIncluded = partial.energyMonitoringIncluded;
      }
      if (partial.espPower !== undefined) next.espPower = partial.espPower;
      if (partial.espEnergy !== undefined) next.espEnergy = partial.espEnergy;
      if (partial.espCurrent !== undefined) next.espCurrent = partial.espCurrent;

      return { ...prev, [deviceId]: next };
    });
  }, []);

  const getAc = useCallback(
    (deviceId) => acMap[deviceId] || defaultAcState(),
    [acMap]
  );

  const patchLocal = useCallback((deviceId, patch) => {
    setAcMap((prev) => ({
      ...prev,
      [deviceId]: {
        ...(prev[deviceId] || defaultAcState()),
        ...patch,
      },
    }));
  }, []);

  /** Optimistic settings update — card + panel share same map */
  const updateAcSettings = useCallback(
    async (deviceId, body, { isOnline = true } = {}) => {
      if (!deviceId) return null;
      if (!isOnline) {
        Swal.fire({
          icon: "warning",
          title: "Device Offline",
          text: "Cannot update AC while offline.",
        });
        return null;
      }

      const prev = acMap[deviceId] || defaultAcState();
      const optimistic = { ...body };
      if (optimistic.setTemperature != null) {
        optimistic.setTemperature = Math.min(
          TEMP_MAX,
          Math.max(TEMP_MIN, Number(optimistic.setTemperature))
        );
      }

      patchLocal(deviceId, optimistic);
      setBusy(deviceId, "settings");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/device/ac-settings/${deviceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to update AC settings");
        }

        if (data.device) {
          hydrateAc(deviceId, {
            state: data.device.state,
            setTemperature: data.device.setTemperature,
            acMode: data.device.acMode,
            fanSpeed: data.device.fanSpeed,
            acLocked: data.device.acLocked,
            acHealthAlert: data.device.acHealthAlert,
            energyMonitoringIncluded: data.device.energyMonitoringIncluded,
          });
        }
        return data;
      } catch (err) {
        // rollback
        patchLocal(deviceId, {
          setTemperature: prev.setTemperature,
          acMode: prev.acMode,
          fanSpeed: prev.fanSpeed,
          acLocked: prev.acLocked,
        });
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: err.message || "Settings update failed",
        });
        return null;
      } finally {
        setBusy(deviceId, null);
      }
    },
    [acMap, hydrateAc, patchLocal, setBusy]
  );

  const stepTemperature = useCallback(
    async (deviceId, delta, opts) => {
      const current = acMap[deviceId] || defaultAcState();
      const next = Math.min(
        TEMP_MAX,
        Math.max(TEMP_MIN, Number(current.setTemperature || 26) + delta)
      );
      if (next === current.setTemperature) return null;
      return updateAcSettings(deviceId, { setTemperature: next }, opts);
    },
    [acMap, updateAcSettings]
  );

  /**
   * CURRENT schedule running → do NOT toggle power.
   * Show modal: event is active → optionally disable it first.
   * Used by AcDeviceCard + VenueDetailsPanel so both behave the same.
   */
  const promptDisableCurrentEvent = useCallback(async (event) => {
    if (!event?._id) {
      await Swal.fire({
        icon: "info",
        title: "Event Currently Running",
        text: "This event is already active currently. Disable it first before manually toggling.",
      });
      return null;
    }

    const localStart = utcToLocal12(event.startTime);
    const localEnd = utcToLocal12(event.endTime);

    const result = await Swal.fire({
      title: "Event Currently Running",
      html: `
        The <b>${event.command || "Scheduled"}</b> event is currently active.<br/>
        <span style="color:#64748b;font-size:13px">
          ${localStart || "--"} → ${localEnd || "--"}
        </span>
        <br/><br/>
        Disable it first before manually turning On/Off.
        <br/><br/>
        Do you want to disable this event?
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, disable it",
      cancelButtonText: "Keep running",
      confirmButtonColor: "#EF4444",
    });

    if (!result.isConfirmed) return null;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/${event._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "INACTIVE" }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to disable event");
      }
      return { disabled: true };
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Could not disable event",
      });
      return null;
    }
  }, []);

  /** Power On/Off — updates shared state so card + venue panel stay in sync */
  const toggleAcPower = useCallback(
    async (
      deviceId,
      {
        isOnline = true,
        hasCurrentEvent = false,
        currentEvent = null,
        eventId = null,
      } = {}
    ) => {
      if (!deviceId) return null;

      if (!isOnline) {
        Swal.fire({
          icon: "warning",
          title: "Device Offline",
          text: "Cannot control AC while offline.",
        });
        return null;
      }

      // Hard rule: never toggle while CURRENT schedule — prompt to disable first
      if (hasCurrentEvent) {
        return promptDisableCurrentEvent(currentEvent);
      }

      const prev = acMap[deviceId] || defaultAcState();
      const nextState = prev.state === "ON" ? "OFF" : "ON";

      patchLocal(deviceId, { state: nextState });
      setBusy(deviceId, "power");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/event/manual-toggle`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              deviceId,
              ...(eventId ? { eventId } : {}),
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Toggle failed");
        }

        if (data.newState) {
          patchLocal(deviceId, { state: data.newState });
        }
        return data;
      } catch (err) {
        patchLocal(deviceId, { state: prev.state });
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: err.message || "Command failed",
        });
        return null;
      } finally {
        setBusy(deviceId, null);
      }
    },
    [acMap, patchLocal, setBusy, promptDisableCurrentEvent]
  );

  const value = useMemo(
    () => ({
      acMap,
      busyMap,
      getAc,
      hydrateAc,
      updateAcSettings,
      stepTemperature,
      toggleAcPower,
      promptDisableCurrentEvent,
      TEMP_MIN,
      TEMP_MAX,
    }),
    [
      acMap,
      busyMap,
      getAc,
      hydrateAc,
      updateAcSettings,
      stepTemperature,
      toggleAcPower,
      promptDisableCurrentEvent,
    ]
  );

  return (
    <AcControlContext.Provider value={value}>
      {children}
    </AcControlContext.Provider>
  );
}

export function useAcControl() {
  const ctx = useContext(AcControlContext);
  if (!ctx) {
    throw new Error("useAcControl must be used within AcControlProvider");
  }
  return ctx;
}

export default AcControlContext;
