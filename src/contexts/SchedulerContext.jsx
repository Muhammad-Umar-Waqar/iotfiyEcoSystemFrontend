import { createContext, useContext, useState, useCallback } from "react";
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