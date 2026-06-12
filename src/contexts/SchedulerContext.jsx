import { createContext, useContext, useState, useCallback } from "react";
import Swal from "sweetalert2";
const SchedulerContext = createContext(null);
const TOKEN = localStorage.getItem("token");


export function SchedulerProvider({ children }) {
  const [eventsMap, setEventsMap] = useState({});
  const [toggleMap, setToggleMap] = useState({});

  const setEvents = useCallback((deviceId, updated) =>
    setEventsMap(prev => ({
      ...prev,
      [deviceId]: updated || [],
    })), []);

  const setToggle = useCallback((deviceId, val) =>
    setToggleMap(prev => ({
      ...prev,
      [deviceId]: val ?? "off",   // ← FORCE DEFAULT OFF
    })), []);

  const fetchToggleStatus = useCallback(async (deviceId, retries = 5) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get-toggle-status/${deviceId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const newState = data.status === "ON" ? "on" : "off";

      setToggleMap(prev => {
        // 🔥 IMPORTANT: force re-render only if changed
        if (prev[deviceId] === newState) return prev;

        return {
          ...prev,
          [deviceId]: newState,
        };
      });

      return newState;

    } catch (err) {
      console.error("❌ Fetch toggle error:", err);
    }
  }, []);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const triggerDevice = useCallback(async (deviceId, action) => {
    const expected = action === "ON" ? "on" : "off";

    try {
      // ✅ STEP 1: Check if device is online first
      const checkRes = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      const checkData = await checkRes.json();

      // Check if device is offline
      if (checkRes.ok && (checkData?.event?.isDeviceOnline === false || checkData?.isDeviceOnline === false)) {
        Swal.fire({
          icon: "error",
          title: "Device is Offline",
          text: "Cannot turn ON/OFF because the device is currently offline.\nPlease check the device connection.",
          confirmButtonColor: "#EF4444",
          confirmButtonText: "Okay",
        });
        return; // Stop execution
      }

      // ✅ STEP 2: Device is online, proceed with toggle (SCHEDULING ONLY)
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

      // Success → sync state
      await delay(800);

      for (let i = 0; i < 6; i++) {
        const current = await fetchToggleStatus(deviceId);
        if (current === expected) break;
        await delay(400);
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
  }, [fetchToggleStatus]);

  // ✅ NEW: Trigger device toggle (for TRIGGER category devices)
  const triggerDeviceManual = useCallback(async (deviceId, action) => {
    const expected = action === "ON" ? "on" : "off";

    try {
      // ✅ STEP 1: Check if device is online first
      const checkRes = await fetch(
        `${import.meta.env.VITE_API_URL}/event/get/${deviceId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      const checkData = await checkRes.json();

      // Check if device is offline
      if (checkRes.ok && (checkData?.event?.isDeviceOnline === false || checkData?.isDeviceOnline === false)) {
        Swal.fire({
          icon: "error",
          title: "Device is Offline",
          text: "Cannot trigger because the device is currently offline.\nPlease check the device connection.",
          confirmButtonColor: "#EF4444",
          confirmButtonText: "Okay",
        });
        return;
      }

      // ✅ STEP 2: Device is online, proceed with trigger (TRIGGER CATEGORY)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/event/manual-trigger/${deviceId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      const data = await res.json();
      console.log("Manual Trigger Response:", data);

      // Handle API errors
      if (!res.ok) {
        throw new Error(data.message || "Trigger failed");
      }

      // Success → sync state
      await delay(800);

      for (let i = 0; i < 6; i++) {
        const current = await fetchToggleStatus(deviceId);
        if (current === expected) break;
        await delay(400);
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
  }, [fetchToggleStatus]);

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
      value={{ eventsMap, toggleMap, setEvents, setToggle, triggerDevice, triggerDeviceManual, skipEvent, fetchToggleStatus }}
    >
      {children}
    </SchedulerContext.Provider>
  );
}

export const useScheduler = () => useContext(SchedulerContext);