import { createContext, useContext, useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
const SchedulerContext = createContext(null);
const TOKEN = localStorage.getItem("token");


export function SchedulerProvider({ children }) {
  const [eventsMap, setEventsMap] = useState({});
  const [toggleMap, setToggleMap] = useState({});
  const [eventsRefreshMap, setEventsRefreshMap] = useState({});

  const setEvents = useCallback((deviceId, updated) =>
    setEventsMap(prev => ({
      ...prev,
      [deviceId]: updated || [],
    })), []);

  const bumpEventsRefresh = useCallback((deviceId) => {
    if (!deviceId) return;
    setEventsRefreshMap(prev => ({
      ...prev,
      [deviceId]: (prev[deviceId] ?? 0) + 1,
    }));
  }, []);

  const refreshEventsForDevice = useCallback(async (deviceId, extra = {}) => {
    const id = String(deviceId || "").trim();
    if (!id) return;

    const deletedEventId = extra.deletedEventId
      ? String(extra.deletedEventId)
      : null;
    if (deletedEventId) {
      setEventsMap((prev) => ({
        ...prev,
        [id]: (prev[id] || []).filter(
          (e) => String(e?._id || e?.id) !== deletedEventId
        ),
      }));
    }

    // Always bump so EventsSection / TriggerEventsSection refetch even if
    // this device is a trigger (scheduling GET can be empty).
    bumpEventsRefresh(id);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      const events =
        res.ok || res.status === 404 ? data.events || [] : null;
      if (events) {
        const next = deletedEventId
          ? events.filter((e) => String(e?._id || e?.id) !== deletedEventId)
          : events;
        setEvents(id, next);
      }
    } catch (err) {
      console.warn("[Scheduler] agent events refresh failed", err);
    }
  }, [setEvents, bumpEventsRefresh]);

  useEffect(() => {
    const onAgentData = (e) => {
      const scopes = e.detail?.scopes || [];
      const deviceId = e.detail?.hints?.deviceId;
      if (!scopes.includes("events") || !deviceId) return;
      refreshEventsForDevice(deviceId, {
        deletedEventId: e.detail?.hints?.deletedEventId,
      });
    };
    window.addEventListener("eco:agent-data-changed", onAgentData);
    return () => window.removeEventListener("eco:agent-data-changed", onAgentData);
  }, [refreshEventsForDevice]);

  const setToggle = useCallback((deviceId, val) =>
    setToggleMap(prev => ({
      ...prev,
      [deviceId]: val ?? "off",   // ← FORCE DEFAULT OFF
    })), []);

  const triggerDevice = useCallback(async (deviceId, action) => {
    try {
      // ✅ Device is online, proceed with toggle (SCHEDULING ONLY)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/manual-toggle`,
        {
          method: "POST",
          credentials: "include",
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
          body: JSON.stringify({ deviceId, status: action }),
        }
      );

      const data = await res.json();
      console.log("Trigger Response:", data);

      // Handle API errors
      if (!res.ok) {
        throw new Error(data.message || "Toggle failed");
      }

      // ✅ Update state immediately from API response
      if (data.device?.state) {
        const newState = data.device.state === "ON" ? "on" : "off";
        setToggleMap(prev => ({
          ...prev,
          [deviceId]: newState,
        }));
      }

      return data;

    } catch (err) {
      console.error("Trigger error:", err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Failed to send command to device",
        confirmButtonColor: "#EF4444",
      });
    }
  }, []);

  // ✅ NEW: Trigger device toggle (for TRIGGER category devices)
  const triggerDeviceManual = useCallback(async (deviceId, action) => {
    if (!action || !["ON", "OFF"].includes(action)) {
      console.error("Invalid action for triggerDeviceManual:", action);
      throw new Error("Action must be either 'ON' or 'OFF'");
    }

    try {
      // ✅ Device is online, proceed with trigger (TRIGGER CATEGORY)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/device/manual-trigger/${deviceId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ state: action }), // ✅ Send state in request body
        }
      );

      const data = await res.json();
      console.log("Manual Trigger Response:", data);

      // Handle API errors
      if (!res.ok) {
        throw new Error(data.message || "Trigger failed");
      }

      // ✅ Update state immediately from API response
      if (data.device?.state) {
        const newState = data.device.state === "ON" ? "on" : "off";
        setToggleMap(prev => ({
          ...prev,
          [deviceId]: newState,
        }));
      }

      return data;

    } catch (err) {
      console.error("Manual trigger error:", err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message || "Failed to trigger device",
        confirmButtonColor: "#EF4444",
      });
    }
  }, []);

  const skipEvent = useCallback(async (deviceId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/event/skip-event`, {
      method: "POST",
       headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      credentials: "include",
      body: JSON.stringify({ deviceId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Skip failed");

    setEventsMap(prev => ({
      ...prev,
      [deviceId]: [],
    }));

    setToggleMap(prev => ({
      ...prev,
      [deviceId]: "off",
    }));

    return data;
  }, []);


  return (
    <SchedulerContext.Provider
      value={{
        eventsMap,
        toggleMap,
        eventsRefreshMap,
        setEvents,
        setToggle,
        bumpEventsRefresh,
        triggerDevice,
        triggerDeviceManual,
        skipEvent,
      }}
    >
      {children}
    </SchedulerContext.Provider>
  );
}

export const useScheduler = () => useContext(SchedulerContext);